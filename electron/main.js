'use strict';

const {
  app,
  BrowserWindow,
  Tray,
  Menu,
  nativeImage,
  shell,
  clipboard,
  ipcMain,
  dialog
} = require('electron');
const path = require('path');
const fs = require('fs');

// Set writable userData directory for store.json before requiring server.js
const userDataRoot = app.getPath('userData');
const userStoreDir = path.join(userDataRoot, 'data');
process.env.OVERLAY_USER_DATA_DIR = userStoreDir;

const settingsPath = path.join(userDataRoot, 'app-settings.json');

function loadAppSettings() {
  const defaults = {
    closeToTray: true
  };
  try {
    if (fs.existsSync(settingsPath)) {
      const parsed = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
      return {
        ...defaults,
        ...parsed
      };
    }
  } catch (_err) {
    // ignore
  }
  return defaults;
}

function saveAppSettings(nextSettings) {
  try {
    fs.mkdirSync(userDataRoot, { recursive: true });
    fs.writeFileSync(settingsPath, JSON.stringify(nextSettings, null, 2), 'utf8');
  } catch (err) {
    console.error('Impossible de sauvegarder app-settings.json:', err.message);
  }
}

let appSettings = loadAppSettings();
let mainWindow = null;
let tray = null;
let isQuitting = false;
let serverModule = null;

// Single-instance lock so opening the app again focuses the existing instance
const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    showControlWindow();
  });
}

function getTrayIcon(isLive) {
  const assetsDir = path.join(__dirname, 'assets');
  if (process.platform === 'darwin') {
    if (isLive) {
      const livePath = path.join(assetsDir, 'tray-live.png');
      if (fs.existsSync(livePath)) {
        const img = nativeImage.createFromPath(livePath).resize({ width: 18, height: 18 });
        img.setTemplateImage(false);
        return img;
      }
    }
    const tplPath = path.join(assetsDir, 'trayTemplate.png');
    const img = nativeImage.createFromPath(tplPath);
    img.setTemplateImage(true);
    return img;
  }

  const winIconPath = path.join(assetsDir, isLive ? 'tray-live.png' : 'tray-icon.png');
  return nativeImage.createFromPath(winIconPath);
}

function getLanOverlayUrl() {
  if (!serverModule) return 'http://localhost:3000/overlay';
  const ips = serverModule.getLanAddresses();
  const host = ips.length > 0 ? `${ips[0].address}:${serverModule.PORT}` : `localhost:${serverModule.PORT}`;
  return `http://${host}/overlay`;
}

function showControlWindow() {
  if (process.platform === 'darwin' && app.dock) {
    app.dock.show();
  }
  if (!mainWindow || mainWindow.isDestroyed()) {
    createMainWindow();
    return;
  }
  mainWindow.setSkipTaskbar(false);
  if (mainWindow.isMinimized()) {
    mainWindow.restore();
  }
  mainWindow.show();
  mainWindow.focus();
  updateTrayMenu();
}

function hideToBackgroundTray() {
  if (!mainWindow || mainWindow.isDestroyed()) return;
  mainWindow.setSkipTaskbar(true);
  mainWindow.hide();
  if (process.platform === 'darwin' && app.dock) {
    app.dock.hide();
  }
  updateTrayMenu();
}

function sendMenuAction(action) {
  showControlWindow();
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('menu:action', action);
  }
}

async function openOrInstallStreamDeckPlugin() {
  if (!serverModule) return { ok: false, error: 'Serveur non initialisé' };
  const pluginPath = serverModule.resolveStreamDeckPluginFile();
  if (!fs.existsSync(pluginPath)) {
    return { ok: false, error: 'Fichier .streamDeckPlugin introuvable' };
  }

  // Copy to temporary folder with versioned filename and open with OS handler (Elgato Stream Deck)
  try {
    const tempDir = app.getPath('temp');
    const targetFile = path.join(
      tempDir,
      `fr.mmitv.overlay-v${serverModule.APP_VERSION}.streamDeckPlugin`
    );
    fs.copyFileSync(pluginPath, targetFile);
    const errMsg = await shell.openPath(targetFile);
    if (errMsg) {
      shell.showItemInFolder(targetFile);
      return { ok: true, shownInFolder: true, path: targetFile };
    }
    return { ok: true, path: targetFile };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

function buildTrayContextMenu() {
  const air = serverModule ? serverModule.getAirState() : { phase: 'IDLE' };
  const isLive = air.phase === 'ON_AIR' || air.phase === 'ENTERING';
  const liveTitle =
    isLive && air.currentAsset
      ? `🔴 À L'ANTENNE : ${air.currentAsset.primaryText || 'Asset actif'}`
      : '⚪ HORS ANTENNE (Prêt)';

  const lanUrl = getLanOverlayUrl();
  const isVisible = mainWindow && !mainWindow.isDestroyed() && mainWindow.isVisible();

  return Menu.buildFromTemplate([
    {
      label: `Overlay Régie v${serverModule ? serverModule.APP_VERSION : '1.0.0'} — Serveur Actif`,
      enabled: false
    },
    {
      label: liveTitle,
      enabled: false
    },
    { type: 'separator' },
    {
      label: isVisible ? 'Afficher la fenêtre de Contrôle' : 'Ouvrir l\'interface de Contrôle',
      click: () => showControlWindow()
    },
    {
      label: 'Masquer en arrière-plan (Tray uniquement)',
      enabled: Boolean(isVisible),
      click: () => hideToBackgroundTray()
    },
    { type: 'separator' },
    {
      label: 'SORTIR de l\'antenne (Animation)',
      enabled: isLive,
      click: () => {
        if (serverModule) serverModule.triggerOut();
      }
    },
    {
      label: 'CUT immédiat (Urgence)',
      click: () => {
        if (serverModule) serverModule.triggerCut();
      }
    },
    { type: 'separator' },
    {
      label: `Copier l'URL vMix (${lanUrl})`,
      click: () => {
        clipboard.writeText(lanUrl);
      }
    },
    {
      label: 'Ouvrir l\'Overlay 1920×1080 dans le navigateur',
      click: () => {
        shell.openExternal(`http://localhost:${serverModule ? serverModule.PORT : 3000}/overlay`);
      }
    },
    {
      label: `Installer le plugin Stream Deck (v${serverModule ? serverModule.APP_VERSION : '1.0.0'})`,
      click: () => {
        openOrInstallStreamDeckPlugin();
      }
    },
    {
      label: 'Vérifier les mises à jour GitHub…',
      click: () => {
        sendMenuAction('check-updates');
      }
    },
    { type: 'separator' },
    {
      label: 'Quitter complètement Overlay Régie',
      click: () => {
        isQuitting = true;
        app.quit();
      }
    }
  ]);
}

function updateTrayMenu() {
  if (!tray) return;
  const air = serverModule ? serverModule.getAirState() : { phase: 'IDLE' };
  const isLive = air.phase === 'ON_AIR' || air.phase === 'ENTERING';
  tray.setImage(getTrayIcon(isLive));
  tray.setToolTip(
    isLive && air.currentAsset
      ? `Overlay Régie — À L'ANTENNE : ${air.currentAsset.primaryText || ''}`
      : `Overlay Régie v${serverModule ? serverModule.APP_VERSION : '1.0.0'} (Serveur Actif)`
  );
  tray.setContextMenu(buildTrayContextMenu());
}

function createSystemTray() {
  if (tray) return;
  tray = new Tray(getTrayIcon(false));
  updateTrayMenu();

  tray.on('click', () => {
    if (process.platform !== 'darwin') {
      if (mainWindow && !mainWindow.isDestroyed() && mainWindow.isVisible()) {
        mainWindow.focus();
      } else {
        showControlWindow();
      }
    }
  });

  tray.on('double-click', () => {
    showControlWindow();
  });
}

function buildNativeAppMenu() {
  const isMac = process.platform === 'darwin';
  const ver = serverModule ? serverModule.APP_VERSION : '1.0.0';
  const repo = serverModule ? serverModule.GITHUB_REPO : 'noamdbc/overlay-mmitv3';

  const template = [
    ...(isMac
      ? [
          {
            label: 'Overlay Régie',
            submenu: [
              {
                label: `À propos d'Overlay Régie (v${ver})`,
                click: () => {
                  dialog.showMessageBox({
                    type: 'info',
                    title: 'Overlay Régie',
                    message: `Overlay Régie Broadcast System v${ver}`,
                    detail: `Système d'habillage TV 1920×1080 temps réel pour vMix, Fill & Key et Elgato Stream Deck.\n\nServeur local : http://localhost:${serverModule ? serverModule.PORT : 3000}\nDépôt GitHub : github.com/${repo}`
                  });
                }
              },
              { type: 'separator' },
              {
                label: 'Paramètres & Plugin Stream Deck…',
                accelerator: 'CmdOrCtrl+,',
                click: () => sendMenuAction('open-settings')
              },
              {
                label: 'Vérifier les mises à jour GitHub…',
                click: () => sendMenuAction('check-updates')
              },
              {
                label: `Installer le plugin Stream Deck (v${ver})`,
                click: () => openOrInstallStreamDeckPlugin()
              },
              {
                label: 'Ouvrir le dossier des données (store.json)',
                click: () => {
                  if (serverModule) shell.openPath(serverModule.DATA_DIR);
                }
              },
              { type: 'separator' },
              {
                label: 'Maintenir le serveur en arrière-plan à la fermeture',
                type: 'checkbox',
                checked: Boolean(appSettings.closeToTray),
                click: (menuItem) => {
                  appSettings.closeToTray = Boolean(menuItem.checked);
                  saveAppSettings(appSettings);
                }
              },
              { type: 'separator' },
              { role: 'services', label: 'Services' },
              { type: 'separator' },
              { role: 'hide', label: 'Masquer Overlay Régie' },
              { role: 'hideOthers', label: 'Masquer les autres' },
              { role: 'unhide', label: 'Tout afficher' },
              { type: 'separator' },
              {
                label: 'Quitter complètement Overlay Régie',
                accelerator: 'CmdOrCtrl+Q',
                click: () => {
                  isQuitting = true;
                  app.quit();
                }
              }
            ]
          }
        ]
      : []),
    {
      label: 'Fichier',
      submenu: [
        {
          label: 'Nouveau Synthé (Bas-Gauche)',
          accelerator: 'CmdOrCtrl+N',
          click: () => sendMenuAction('new-synthe')
        },
        {
          label: 'Nouveau Titre (Bas-Centre)',
          accelerator: 'CmdOrCtrl+Shift+N',
          click: () => sendMenuAction('new-titre')
        },
        { type: 'separator' },
        {
          label: 'Enregistrer l\'asset actif',
          accelerator: 'CmdOrCtrl+S',
          click: () => sendMenuAction('save-asset')
        },
        {
          label: 'Dupliquer l\'asset actif',
          accelerator: 'CmdOrCtrl+D',
          click: () => sendMenuAction('duplicate-asset')
        },
        { type: 'separator' },
        {
          label: 'Gestionnaire de Profils…',
          accelerator: 'CmdOrCtrl+P',
          click: () => sendMenuAction('open-profiles')
        },
        {
          label: 'Importer un ou plusieurs profils (.json)…',
          click: () => sendMenuAction('import-profile')
        },
        {
          label: 'Exporter le profil actif (.json)…',
          click: () => sendMenuAction('export-profile')
        },
        { type: 'separator' },
        ...(!isMac
          ? [
              {
                label: 'Paramètres & Plugin Stream Deck…',
                accelerator: 'CmdOrCtrl+,',
                click: () => sendMenuAction('open-settings')
              },
              { type: 'separator' },
              {
                label: 'Quitter complètement Overlay Régie',
                accelerator: 'Alt+F4',
                click: () => {
                  isQuitting = true;
                  app.quit();
                }
              }
            ]
          : [])
      ]
    },
    {
      label: 'Édition',
      submenu: [
        {
          label: 'Annuler',
          accelerator: 'CmdOrCtrl+Z',
          click: () => sendMenuAction('undo')
        },
        {
          label: 'Rétablir',
          accelerator: 'CmdOrCtrl+Shift+Z',
          click: () => sendMenuAction('redo')
        },
        { type: 'separator' },
        { role: 'cut', label: 'Couper' },
        { role: 'copy', label: 'Copier' },
        { role: 'paste', label: 'Coller' },
        { role: 'selectAll', label: 'Tout sélectionner' }
      ]
    },
    {
      label: 'Diffusion',
      submenu: [
        {
          label: 'Envoyer à l\'antenne (TAKE)',
          accelerator: 'Space',
          click: () => sendMenuAction('take-air')
        },
        {
          label: 'Sortir avec animation (SORTIR)',
          accelerator: 'Escape',
          click: () => {
            if (serverModule) serverModule.triggerOut();
          }
        },
        {
          label: 'Couper immédiatement (CUT)',
          accelerator: 'Shift+Escape',
          click: () => {
            if (serverModule) serverModule.triggerCut();
          }
        },
        {
          label: 'Maintenir à l\'antenne (Forcer Manuel)',
          click: () => {
            if (serverModule) serverModule.triggerHoldManual();
          }
        },
        { type: 'separator' },
        {
          label: 'Copier l\'URL vMix (Réseau Local)',
          click: () => {
            clipboard.writeText(getLanOverlayUrl());
          }
        },
        {
          label: 'Ouvrir l\'Overlay 1920×1080 dans le navigateur',
          click: () => {
            shell.openExternal(`http://localhost:${serverModule ? serverModule.PORT : 3000}/overlay`);
          }
        }
      ]
    },
    {
      label: 'Affichage',
      submenu: [
        {
          label: 'Afficher / Replier le volet Assets (Gauche)',
          accelerator: 'CmdOrCtrl+1',
          click: () => sendMenuAction('toggle-left-panel')
        },
        {
          label: 'Afficher / Replier le volet Inspecteur (Droite)',
          accelerator: 'CmdOrCtrl+2',
          click: () => sendMenuAction('toggle-right-panel')
        },
        {
          label: 'Grille Safe Area (90% / 80%)',
          click: () => sendMenuAction('toggle-safe-guides')
        },
        {
          label: 'Aperçu Plein Écran & Timeline Animation…',
          accelerator: 'CmdOrCtrl+Shift+F',
          click: () => sendMenuAction('open-fs-preview')
        },
        {
          label: 'Galerie de Templates & Thèmes (36+)',
          accelerator: 'CmdOrCtrl+G',
          click: () => sendMenuAction('open-gallery')
        },
        { type: 'separator' },
        { role: 'reload', label: 'Recharger l\'interface' },
        { role: 'togglefullscreen', label: 'Plein écran' },
        { role: 'toggleDevTools', label: 'Outils de développement' }
      ]
    },
    {
      label: 'Fenêtre',
      submenu: [
        { role: 'minimize', label: 'Réduire' },
        { role: 'zoom', label: 'Zoom' },
        {
          label: 'Fermer la fenêtre (Garder le serveur en arrière-plan)',
          accelerator: 'CmdOrCtrl+W',
          click: () => hideToBackgroundTray()
        },
        ...(isMac
          ? [
              { type: 'separator' },
              { role: 'front', label: 'Tout ramener au premier plan' }
            ]
          : [])
      ]
    },
    {
      label: 'Aide',
      submenu: [
        {
          label: `Installer le plugin Stream Deck (v${ver})`,
          click: () => openOrInstallStreamDeckPlugin()
        },
        {
          label: 'Vérifier les mises à jour GitHub…',
          click: () => sendMenuAction('check-updates')
        },
        { type: 'separator' },
        {
          label: `Ouvrir le dépôt GitHub (${repo})`,
          click: () => shell.openExternal(`https://github.com/${repo}/releases`)
        }
      ]
    }
  ];

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

function createMainWindow() {
  const iconFile = path.join(__dirname, '..', 'build', process.platform === 'win32' ? 'icon.ico' : 'icon.png');

  mainWindow = new BrowserWindow({
    width: 1560,
    height: 940,
    minWidth: 1100,
    minHeight: 680,
    fullscreenable: true,
    title: 'Overlay Régie — Contrôle',
    backgroundColor: '#121212',
    icon: fs.existsSync(iconFile) ? iconFile : undefined,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  const controlUrl = `http://localhost:${serverModule ? serverModule.PORT : 3000}/control`;
  mainWindow.loadURL(controlUrl);

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    updateTrayMenu();
  });

  // Intercept window.open / target="_blank"
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.endsWith('/overlay')) {
      shell.openExternal(url);
      return { action: 'deny' };
    }
    if (/^https?:\/\//i.test(url)) {
      shell.openExternal(url);
      return { action: 'deny' };
    }
    return { action: 'allow' };
  });

  // Intercept window close -> hide to Tray & remove from Taskbar / Dock if closeToTray is enabled
  mainWindow.on('close', (event) => {
    if (!isQuitting && appSettings.closeToTray) {
      event.preventDefault();
      hideToBackgroundTray();
    }
  });

  mainWindow.on('show', () => {
    mainWindow.setSkipTaskbar(false);
    if (process.platform === 'darwin' && app.dock) {
      app.dock.show();
    }
    updateTrayMenu();
  });

  mainWindow.on('hide', () => {
    updateTrayMenu();
  });

  mainWindow.on('leave-full-screen', () => {
    sendMenuAction('exited-fullscreen');
  });
}

// IPC Handlers for Control UI
ipcMain.handle('app:set-fullscreen', (_event, enabled) => {
  if (mainWindow && !mainWindow.isDestroyed()) {
    const flag = Boolean(enabled);
    if (mainWindow.isFullScreen() !== flag) {
      mainWindow.setFullScreen(flag);
    }
    return { ok: true, isFullScreen: mainWindow.isFullScreen() };
  }
  return { ok: false };
});
ipcMain.handle('app:get-settings', () => {
  return {
    closeToTray: Boolean(appSettings.closeToTray),
    version: serverModule ? serverModule.APP_VERSION : '1.0.0',
    dataDir: serverModule ? serverModule.DATA_DIR : userStoreDir
  };
});

ipcMain.handle('app:set-close-to-tray', (_event, enabled) => {
  appSettings.closeToTray = Boolean(enabled);
  saveAppSettings(appSettings);
  buildNativeAppMenu();
  return { ok: true, closeToTray: appSettings.closeToTray };
});

ipcMain.handle('app:install-streamdeck', async () => {
  return await openOrInstallStreamDeckPlugin();
});

ipcMain.handle('app:open-data-folder', () => {
  if (serverModule) {
    shell.openPath(serverModule.DATA_DIR);
  }
  return { ok: true };
});

ipcMain.handle('app:open-external', (_event, url) => {
  if (url && /^https?:\/\//i.test(url)) {
    shell.openExternal(url);
  }
  return { ok: true };
});

ipcMain.handle('app:quit', () => {
  isQuitting = true;
  app.quit();
  return { ok: true };
});

app.whenReady().then(() => {
  serverModule = require('../server.js');

  // Keep Tray icon & Tally state updated whenever airState changes
  if (serverModule && serverModule.io) {
    serverModule.io.on('connection', (socket) => {
      socket.on('air:take', () => setTimeout(updateTrayMenu, 60));
      socket.on('air:out', () => setTimeout(updateTrayMenu, 60));
      socket.on('air:cut', () => setTimeout(updateTrayMenu, 60));
    });
    setInterval(updateTrayMenu, 1500);
  }

  buildNativeAppMenu();
  createSystemTray();
  createMainWindow();

  app.on('activate', () => {
    showControlWindow();
  });
});

app.on('before-quit', () => {
  isQuitting = true;
});

// Keep the server alive in the background even if all windows are closed/hidden
app.on('window-all-closed', () => {
  if (isQuitting) {
    app.quit();
  }
});
