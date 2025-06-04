import { createAPIFileRoute } from '@tanstack/react-start/api'
import mime from 'mime'
import fs from 'node:fs'
import fsPromises from 'node:fs/promises'
import path from 'node:path'
import nullthrows from 'nullthrows'
import { getLatestUpdateBundlePathForRuntimeVersionAsync, getMetadataAsync } from '~/common/helper'


export const APIRoute = createAPIFileRoute('/api/assets')({
  GET: async ({ request }) => {
    console.log('assetsEndpoint TanStack Start')
    const url = new URL(request.url)
    const assetName = url.searchParams.get('asset')
    const runtimeVersion = url.searchParams.get('runtimeVersion')
    const platform = url.searchParams.get('platform')

    if (!assetName || typeof assetName !== 'string') {
      return new Response(
        JSON.stringify({ error: 'No asset name provided.' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    if (platform !== 'ios' && platform !== 'android') {
      return new Response(
        JSON.stringify({ error: 'No platform provided. Expected "ios" or "android".' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    if (!runtimeVersion || typeof runtimeVersion !== 'string') {
      return new Response(
        JSON.stringify({ error: 'No runtimeVersion provided.' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    let updateBundlePath: string
    try {
      updateBundlePath = await getLatestUpdateBundlePathForRuntimeVersionAsync(runtimeVersion)
    } catch (error: any) {
      return new Response(
        JSON.stringify({ error: error.message }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    const { metadataJson } = await getMetadataAsync({
      updateBundlePath,
      runtimeVersion,
    })

    const assetPath = path.resolve(assetName)
    const assetMetadata = metadataJson.fileMetadata[platform].assets.find(
      (asset: any) => asset.path === assetName.replace(`${updateBundlePath}/`, '')
    )
    const isLaunchAsset =
      metadataJson.fileMetadata[platform].bundle === assetName.replace(`${updateBundlePath}/`, '')

    if (!fs.existsSync(assetPath)) {
      return new Response(
        JSON.stringify({ error: `Asset "${assetName}" does not exist.` }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    try {
      const asset = await fsPromises.readFile(assetPath, null)
      const contentType = isLaunchAsset 
        ? 'application/javascript' 
        : nullthrows(mime.getType(assetMetadata.ext))

      return new Response(asset, {
        status: 200,
        headers: {
          'Content-Type': contentType
        }
      })
    } catch (error) {
      console.log(error)
      return new Response(
        JSON.stringify({ error }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }
  }
})
