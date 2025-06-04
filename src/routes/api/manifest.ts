import { createAPIFileRoute } from "@tanstack/react-start/api";
import FormData from "form-data";
import fs from "node:fs/promises";
import {
    convertSHA256HashToUUID,
    createNoUpdateAvailableDirectiveAsync,
    createRollBackDirectiveAsync,
    getAssetMetadataAsync,
    getExpoConfigAsync,
    getLatestUpdateBundlePathForRuntimeVersionAsync,
    getMetadataAsync,
    NoUpdateAvailableError,
} from "../../common/helper";

enum UpdateType {
  NORMAL_UPDATE,
  ROLLBACK,
}

async function getTypeOfUpdateAsync(
  updateBundlePath: string
): Promise<UpdateType> {
  const directoryContents = await fs.readdir(updateBundlePath);
  return directoryContents.includes("rollback")
    ? UpdateType.ROLLBACK
    : UpdateType.NORMAL_UPDATE;
}

export const APIRoute = createAPIFileRoute("/api/manifest")({
  GET: async ({ request }) => {
    console.log("manifestEndpoint (no-signing) TanStack Start",request.headers);

    const url = new URL(request.url);
    const headers = Object.fromEntries(request.headers.entries());

    const protocolVersionMaybeArray = headers["expo-protocol-version"];
    if (protocolVersionMaybeArray && Array.isArray(protocolVersionMaybeArray)) {
      return new Response(
        JSON.stringify({
          error: "Unsupported protocol version. Expected either 0 or 1.",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
    const protocolVersion = parseInt(protocolVersionMaybeArray ?? "0", 10);

    const platform =
      headers["expo-platform"] ?? url.searchParams.get("platform");
    if (platform !== "ios" && platform !== "android") {
      return new Response(
        JSON.stringify({
          error: "Unsupported platform. Expected either ios or android.",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const runtimeVersion =
      headers["expo-runtime-version"] ??
      url.searchParams.get("runtime-version");
    if (!runtimeVersion || typeof runtimeVersion !== "string") {
      return new Response(
        JSON.stringify({ error: "No runtimeVersion provided." }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    let updateBundlePath: string;
    try {
      updateBundlePath =
        await getLatestUpdateBundlePathForRuntimeVersionAsync(runtimeVersion);
    } catch (error: any) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    const updateType = await getTypeOfUpdateAsync(updateBundlePath);
    console.log("updateType", updateType);

    try {
      try {
        if (updateType === UpdateType.NORMAL_UPDATE) {
          return await putUpdateInResponse(
            request,
            updateBundlePath,
            runtimeVersion,
            platform,
            protocolVersion
          );
        } else if (updateType === UpdateType.ROLLBACK) {
          return await putRollBackInResponse(
            request,
            updateBundlePath,
            protocolVersion
          );
        }
      } catch (maybeNoUpdateAvailableError) {
        if (maybeNoUpdateAvailableError instanceof NoUpdateAvailableError) {
          return await putNoUpdateAvailableInResponse(protocolVersion);
        }
        throw maybeNoUpdateAvailableError;
      }
    } catch (error) {
      console.error(error);
      return new Response(JSON.stringify({ error }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response("Internal Server Error", { status: 500 });
  },
});

async function putUpdateInResponse(
  request: Request,
  updateBundlePath: string,
  runtimeVersion: string,
  platform: string,
  protocolVersion: number
): Promise<Response> {
  const headers = Object.fromEntries(request.headers.entries());
  const currentUpdateId = headers["expo-current-update-id"];

  const { metadataJson, createdAt, id } = await getMetadataAsync({
    updateBundlePath,
    runtimeVersion,
  });

  console.log(
    "currentUpdateId === convertSHA256HashToUUID(id)",
    currentUpdateId === convertSHA256HashToUUID(id)
  );

  // NoUpdateAvailable directive only supported on protocol version 1
  // for protocol version 0, serve most recent update as normal
  if (
    currentUpdateId === convertSHA256HashToUUID(id) &&
    protocolVersion === 1
  ) {
    throw new NoUpdateAvailableError();
  }

  const expoConfig = await getExpoConfigAsync({
    updateBundlePath,
    runtimeVersion,
  });
  const platformSpecificMetadata = metadataJson.fileMetadata[platform];
  const manifest = {
    id: convertSHA256HashToUUID(id),
    createdAt,
    runtimeVersion,
    assets: await Promise.all(
      (platformSpecificMetadata.assets as any[]).map((asset: any) =>
        getAssetMetadataAsync({
          updateBundlePath,
          filePath: asset.path,
          ext: asset.ext,
          runtimeVersion,
          platform,
          isLaunchAsset: false,
        })
      )
    ),
    launchAsset: await getAssetMetadataAsync({
      updateBundlePath,
      filePath: platformSpecificMetadata.bundle,
      isLaunchAsset: true,
      runtimeVersion,
      platform,
      ext: null,
    }),
    metadata: {},
    extra: {
      expoClient: expoConfig,
    },
  };

  // No signature for no-signing version
  const assetRequestHeaders: { [key: string]: object } = {};
  [...manifest.assets, manifest.launchAsset].forEach((asset) => {
    assetRequestHeaders[asset.key] = {
      "test-header": "test-header-value",
    };
  });

  const form = new FormData();
  form.append("manifest", JSON.stringify(manifest), {
    contentType: "application/json",
    header: {
      "content-type": "application/json; charset=utf-8",
    },
  });
  form.append("extensions", JSON.stringify({ assetRequestHeaders }), {
    contentType: "application/json",
  });

  return new Response(form.getBuffer(), {
    status: 200,
    headers: {
      "expo-protocol-version": protocolVersion.toString(),
      "expo-sfv-version": "0",
      "cache-control": "private, max-age=0",
      "content-type": `multipart/mixed; boundary=${form.getBoundary()}`,
    },
  });
}

async function putRollBackInResponse(
  request: Request,
  updateBundlePath: string,
  protocolVersion: number
): Promise<Response> {
  if (protocolVersion === 0) {
    throw new Error("Rollbacks not supported on protocol version 0");
  }

  const headers = Object.fromEntries(request.headers.entries());
  const embeddedUpdateId = headers["expo-embedded-update-id"];
  if (!embeddedUpdateId || typeof embeddedUpdateId !== "string") {
    throw new Error(
      "Invalid Expo-Embedded-Update-ID request header specified."
    );
  }

  const currentUpdateId = headers["expo-current-update-id"];
  if (currentUpdateId === embeddedUpdateId) {
    throw new NoUpdateAvailableError();
  }

  const directive = await createRollBackDirectiveAsync(updateBundlePath);

  // No signature for no-signing version
  const form = new FormData();
  form.append("directive", JSON.stringify(directive), {
    contentType: "application/json",
    header: {
      "content-type": "application/json; charset=utf-8",
    },
  });

  return new Response(form.getBuffer(), {
    status: 200,
    headers: {
      "expo-protocol-version": "1",
      "expo-sfv-version": "0",
      "cache-control": "private, max-age=0",
      "content-type": `multipart/mixed; boundary=${form.getBoundary()}`,
    },
  });
}

async function putNoUpdateAvailableInResponse(
  protocolVersion: number
): Promise<Response> {
  if (protocolVersion === 0) {
    throw new Error(
      "NoUpdateAvailable directive not available in protocol version 0"
    );
  }

  const directive = await createNoUpdateAvailableDirectiveAsync();

  // No signature for no-signing version
  const form = new FormData();
  form.append("directive", JSON.stringify(directive), {
    contentType: "application/json",
    header: {
      "content-type": "application/json; charset=utf-8",
    },
  });

  return new Response(form.getBuffer(), {
    status: 200,
    headers: {
      "expo-protocol-version": "1",
      "expo-sfv-version": "0",
      "cache-control": "private, max-age=0",
      "content-type": `multipart/mixed; boundary=${form.getBoundary()}`,
    },
  });
}
