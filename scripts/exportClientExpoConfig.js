async function main() {
  const { getConfig } = await import('@expo/config');
  const path = await import('path');
  const { fileURLToPath } = await import('url');
  
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  
  const projectDir = path.join(__dirname, '..', '..', "..", 'tovtam');
  const { exp } = getConfig(projectDir, {
    skipSDKVersionRequirement: true,
    isPublicConfig: true,
  });
  console.log(JSON.stringify(exp, null, 2));
}

main().catch(console.error);