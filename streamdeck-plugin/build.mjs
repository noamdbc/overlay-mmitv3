import * as esbuild from 'esbuild';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const sdPluginDir = path.join(__dirname, 'fr.mmitv.overlay.sdPlugin');
const distDir = path.join(__dirname, 'dist');

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
  logLevel: 'info'
});

const streamdeckBin = path.join(
  __dirname,
  'node_modules',
  '.bin',
  process.platform === 'win32' ? 'streamdeck.cmd' : 'streamdeck'
);

console.log('\nValidating Stream Deck plugin...');
execFileSync(streamdeckBin, ['validate', sdPluginDir], { stdio: 'inherit' });

console.log('\nPacking .streamDeckPlugin installer...');
execFileSync(streamdeckBin, ['pack', sdPluginDir, '-o', distDir, '--force'], {
  stdio: 'inherit'
});
