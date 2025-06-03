import { defineConfig } from "@tanstack/react-start/config";
import nitroCloudflareBindings from "nitro-cloudflare-dev";
import { cloudflare } from "unenv";
import tsConfigPaths from "vite-tsconfig-paths";
export default defineConfig({
  server: {
    preset: "cloudflare-module",
    unenv: cloudflare,
    modules: [nitroCloudflareBindings],
  },
  tsr: {
    appDirectory: "src",
  },
  vite: {
    plugins: [
      tsConfigPaths({
        projects: ["./tsconfig.json"],
      }),
    ],
  },
});
