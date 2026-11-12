'use strict';

const { execFileSync } = require('node:child_process');
const path = require('node:path');

exports.default = async function afterPack(context) {
  if (context.electronPlatformName !== 'darwin') {
    return;
  }

  const appName = `${context.packager.appInfo.productFilename}.app`;
  const appPath = path.join(context.appOutDir, appName);

  console.log(`\n[afterPack] Nettoyage xattr & Signature ad-hoc macOS : ${appPath}`);

  try {
    execFileSync('xattr', ['-cr', appPath], { stdio: 'inherit' });
  } catch (_err) {
    // ignore if xattr not needed
  }

  execFileSync('codesign', ['--force', '--deep', '--sign', '-', appPath], {
    stdio: 'inherit'
  });

  execFileSync('codesign', ['--verify', '--deep', '--strict', '--verbose=2', appPath], {
    stdio: 'inherit'
  });

  console.log(`[afterPack] Signature macOS validée avec succès pour ${appName}\n`);
};
