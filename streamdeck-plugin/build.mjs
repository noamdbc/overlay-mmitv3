import * as esbuild from 'esbuild';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootPkgPath = path.resolve(__dirname, '..', 'package.json');
const pluginPkgPath = path.join(__dirname, 'package.json');
const sdPluginDir = path.join(__dirname, 'fr.mmitv.overlay.sdPlugin');
const manifestPath = path.join(sdPluginDir, 'manifest.json');
const distDir = path.join(__dirname, 'dist');

// Sync Stream Deck plugin version strictly with root server package.json version
const rootPkg = JSON.parse(fs.readFileSync(rootPkgPath, 'utf8'));
const appVersion = String(rootPkg.version || '1.0.0').trim();

const pluginPkg = JSON.parse(fs.readFileSync(pluginPkgPath, 'utf8'));
if (pluginPkg.version !== appVersion) {
  pluginPkg.version = appVersion;
  fs.writeFileSync(pluginPkgPath, JSON.stringify(pluginPkg, null, 2) + '\n', 'utf8');
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const sdManifestVersion = appVersion.split('.').length === 3 ? `${appVersion}.0` : appVersion;
if (manifest.Version !== sdManifestVersion) {
  manifest.Version = sdManifestVersion;
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n', 'utf8');
}

function removeDsStore(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.name === '.DS_Store') {
      fs.rmSync(full, { force: true });
    } else if (entry.isDirectory()) {
      removeDsStore(full);
    }
  }
}

removeDsStore(sdPluginDir);
fs.rmSync(path.join(sdPluginDir, 'logs'), { recursive: true, force: true });

await esbuild.build({
  entryPoints: [path.join(__dirname, 'src/plugin.js')],
  bundle: true,
  platform: 'node',
  target: 'node20',
  format: 'cjs',
  outfile: path.join(sdPluginDir, 'bin/plugin.cjs'),
  external: ['bufferutil', 'utf-8-validate'],
  define: {
    __PLUGIN_VERSION__: JSON.stringify(appVersion)
  },
  logLevel: 'info'
});

const streamdeckBin = path.join(
  __dirname,
  'node_modules',
  '.bin',
  process.platform === 'win32' ? 'streamdeck.cmd' : 'streamdeck'
);

console.log(`\nValidating Stream Deck plugin (v${appVersion})...`);
execFileSync(streamdeckBin, ['validate', sdPluginDir], { stdio: 'inherit' });

console.log(`\nPacking .streamDeckPlugin installer (v${appVersion})...`);
execFileSync(streamdeckBin, ['pack', sdPluginDir, '-o', distDir, '--force'], {
  stdio: 'inherit'
});
