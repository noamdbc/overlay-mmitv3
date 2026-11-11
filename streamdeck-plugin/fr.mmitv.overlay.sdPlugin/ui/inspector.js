(function () {
  'use strict';

  let websocket = null;
  let piUUID = '';
  let actionUUID = '';
  let settings = {};
  let assets = [];
  let profiles = [];
  let activeProfileId = null;
  let connected = false;
  let pluginVersion = '1.0.0';
  let serverVersion = null;
  let versionMismatch = false;
  let serverUrl = 'http://localhost:3000';
  let activeFilter = 'all';
  let searchQuery = '';

  const TRANSPORT_DESCRIPTIONS = {
    'fr.mmitv.overlay.out': 'Déclenche l’animation de disparition (SORTIR) de l’asset actuellement à l’antenne.',
    'fr.mmitv.overlay.cut': 'Coupe immédiatement (0ms) tout élément affiché à l’écran.',
    'fr.mmitv.overlay.hold': 'Verrouille l’asset actif en mode manuel en stoppant son décompte automatique.'
  };

  function send(msg) {
    if (websocket && websocket.readyState === WebSocket.OPEN) {
      websocket.send(JSON.stringify(msg));
    }
  }

  function saveSettings() {
    send({
      event: 'setSettings',
      context: piUUID,
      payload: settings
    });
  }

  function sendToPlugin(payload) {
    send({
      event: 'sendToPlugin',
      action: actionUUID,
      context: piUUID,
      payload
    });
  }

  function esc(str) {
    return String(str ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function updateConnectionUI() {
    const dot = document.getElementById('connDot');
    const txt = document.getElementById('connText');
    const mismatchBox = document.getElementById('versionMismatchBox');
    const mismatchTxt = document.getElementById('versionMismatchText');

    dot.classList.toggle('online', connected && !versionMismatch);
    dot.classList.toggle('mismatch', connected && versionMismatch);

    if (connected && versionMismatch) {
      txt.textContent = `Défaut version (v${pluginVersion} ≠ v${serverVersion})`;
      mismatchBox.classList.remove('hidden');
      mismatchTxt.textContent = `Plugin v${pluginVersion} installé, mais le serveur est en v${serverVersion}.`;
    } else {
      mismatchBox.classList.add('hidden');
      txt.textContent = connected
        ? `En ligne (v${serverVersion || pluginVersion}) • ${assets.length} asset${assets.length > 1 ? 's' : ''}`
        : `Hors ligne (${serverUrl.replace(/^https?:\/\//, '')})`;
    }

    const inpUrl = document.getElementById('inpServerUrl');
    if (document.activeElement !== inpUrl) {
      inpUrl.value = serverUrl;
    }

    if (!connected) {
      document.getElementById('serverBox').classList.remove('hidden');
    }

    const profRow = document.getElementById('profileRow');
    const selProf = document.getElementById('selProfile');
    if (connected && profiles.length > 0) {
      profRow.classList.remove('hidden');
      selProf.innerHTML = profiles
        .map(
          (p) =>
            `<option value="${esc(p.id)}" ${p.id === activeProfileId ? 'selected' : ''}>${esc(p.name)} (${p.count})</option>`
        )
        .join('');
    } else {
      profRow.classList.add('hidden');
    }
  }

  function renderKeyPreviewMini() {
    const box = document.getElementById('keyPreviewMini');
    if (!box) return;
    const found =
      assets.find((a) => a.id === settings.assetId) || settings.assetSnapshot || null;

    if (!found) {
      box.innerHTML = `
        <div style="margin:auto;text-align:center;color:#FAB001;font-size:10px;font-weight:800;">
          + CHOISIR<br><span style="color:#8B93A6;font-size:9px;">UN ASSET</span>
        </div>
      `;
      return;
    }

    const title = (settings.customLabel && settings.customLabel.trim()) || found.primaryText || 'Asset';
    const isAuto = found.mode === 'auto';
    const badge = isAuto ? `${found.duration}s` : 'MAN';
    const accent = found.accentColor || '#FAB001';
    const kind = found.kind === 'titre' ? 'TITRE' : 'SYNTHÉ';

    box.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;padding:3px 5px;background:#101218;border-bottom:1px solid #2A3040;font-size:8px;font-weight:800;">
        <span style="color:#FAB001">${kind}</span>
        <span style="background:${isAuto ? '#FAB001' : '#323846'};color:${isAuto ? '#000' : '#FFF'};padding:1px 4px;border-radius:3px;">${esc(badge)}</span>
      </div>
      <div style="flex:1;display:flex;align-items:center;justify-content:center;padding:2px 4px 2px 8px;border-left:4px solid ${esc(accent)};text-align:center;font-size:10px;font-weight:800;line-height:1.15;color:#FFF;overflow:hidden;">
        ${esc(title.slice(0, 18))}
      </div>
      <div style="padding:2px 4px;background:#101218;font-size:7.5px;color:#9BA3B5;text-align:center;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
        ${esc(found.secondaryText || kind)}
      </div>
    `;
  }

  function renderAssets() {
    if (actionUUID !== 'fr.mmitv.overlay.asset') return;

    renderKeyPreviewMini();

    const listEl = document.getElementById('assetList');
    listEl.innerHTML = '';

    if (!connected && assets.length === 0) {
      listEl.innerHTML = `<div class="empty-msg">Lancez le serveur Node (<code>npm start</code>) pour charger la liste des assets.</div>`;
      return;
    }

    const q = searchQuery.trim().toLowerCase();
    const filtered = assets.filter((item) => {
      if (activeFilter !== 'all' && item.kind !== activeFilter) return false;
      if (q) {
        const hay = `${item.primaryText} ${item.secondaryText}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    if (filtered.length === 0) {
      listEl.innerHTML = `<div class="empty-msg">Aucun asset correspondant.</div>`;
      return;
    }

    for (const item of filtered) {
      const card = document.createElement('div');
      const isSelected = settings.assetId === item.id;
      card.className = 'asset-card' + (isSelected ? ' selected' : '');

      const isAuto = item.mode === 'auto';
      const badgeLabel = isAuto ? `AUTO ${item.duration}s` : 'MANUEL';
      const kindPrefix = item.kind === 'titre' ? 'Titre' : 'Synthé';
      const sub = item.secondaryText ? `${kindPrefix} • ${item.secondaryText}` : kindPrefix;

      card.innerHTML = `
        <span class="swatch" style="background:${esc(item.accentColor || '#FAB001')}"></span>
        <div class="asset-meta">
          <span class="asset-title">${esc(item.primaryText || 'Sans titre')}</span>
          <span class="asset-sub">${esc(sub)}</span>
        </div>
        <span class="badge ${isAuto ? 'auto' : ''}">${esc(badgeLabel)}</span>
      `;

      card.addEventListener('click', () => {
        settings = {
          ...settings,
          assetId: item.id,
          assetSnapshot: {
            id: item.id,
            kind: item.kind,
            align: item.align,
            primaryText: item.primaryText,
            secondaryText: item.secondaryText,
            mode: item.mode,
            duration: item.duration,
            accentColor: item.accentColor,
            primaryBg: item.primaryBg,
            secondaryBg: item.secondaryBg
          }
        };
        saveSettings();
        renderAssets();
      });

      listEl.appendChild(card);
    }
  }

  function setupActionLayout() {
    const isAsset = actionUUID === 'fr.mmitv.overlay.asset';
    document.getElementById('assetSection').classList.toggle('hidden', !isAsset);
    document.getElementById('transportSection').classList.toggle('hidden', isAsset);

    if (!isAsset) {
      document.getElementById('transportDesc').textContent =
        TRANSPORT_DESCRIPTIONS[actionUUID] || '';
    } else {
      document.getElementById('inpCustomLabel').value = settings.customLabel || '';
      renderAssets();
    }
  }

  // Bind UI Controls
  document.getElementById('btnToggleServer').addEventListener('click', () => {
    document.getElementById('serverBox').classList.toggle('hidden');
  });

  document.getElementById('btnSaveServer').addEventListener('click', () => {
    const val = document.getElementById('inpServerUrl').value.trim() || 'http://localhost:3000';
    serverUrl = val;
    sendToPlugin({ cmd: 'setServerUrl', serverUrl: val });
  });

  document.getElementById('inpServerUrl').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      document.getElementById('btnSaveServer').click();
    }
  });

  document.getElementById('selProfile').addEventListener('change', (e) => {
    const profileId = e.target.value;
    if (profileId) {
      sendToPlugin({ cmd: 'switchProfile', profileId });
    }
  });

  document.querySelectorAll('.tab').forEach((btn) => {
    btn.addEventListener('click', () => {
      activeFilter = btn.dataset.filter;
      document.querySelectorAll('.tab').forEach((b) => b.classList.toggle('active', b === btn));
      renderAssets();
    });
  });

  document.getElementById('inpSearch').addEventListener('input', (e) => {
    searchQuery = e.target.value;
    renderAssets();
  });

  document.getElementById('inpCustomLabel').addEventListener('input', (e) => {
    settings = { ...settings, customLabel: e.target.value };
    saveSettings();
    renderKeyPreviewMini();
  });

  document.getElementById('btnClearLabel').addEventListener('click', () => {
    document.getElementById('inpCustomLabel').value = '';
    settings = { ...settings, customLabel: '' };
    saveSettings();
    renderKeyPreviewMini();
  });

  // Official Elgato Stream Deck Property Inspector Entry Point
  window.connectElgatoStreamDeckSocket = function (
    inPort,
    inPropertyInspectorUUID,
    inRegisterEvent,
    _inInfo,
    inActionInfo
  ) {
    piUUID = inPropertyInspectorUUID;
    const actionInfo = JSON.parse(inActionInfo);
    actionUUID = actionInfo.action;
    settings = actionInfo.payload?.settings || {};

    setupActionLayout();

    websocket = new WebSocket('ws://127.0.0.1:' + inPort);

    websocket.onopen = function () {
      send({
        event: inRegisterEvent,
        uuid: inPropertyInspectorUUID
      });
      sendToPlugin({ cmd: 'requestState' });
    };

    websocket.onmessage = function (evt) {
      let json = null;
      try {
        json = JSON.parse(evt.data);
      } catch (_e) {
        return;
      }

      if (json.event === 'didReceiveSettings') {
        settings = json.payload?.settings || {};
        if (actionUUID === 'fr.mmitv.overlay.asset') {
          const inp = document.getElementById('inpCustomLabel');
          if (document.activeElement !== inp) {
            inp.value = settings.customLabel || '';
          }
          renderAssets();
        }
      } else if (json.event === 'sendToPropertyInspector') {
        const p = json.payload || {};
        if (p.type === 'bridge:state') {
          connected = Boolean(p.connected);
          serverUrl = p.serverUrl || serverUrl;
          pluginVersion = p.pluginVersion || pluginVersion;
          serverVersion = p.serverVersion || null;
          versionMismatch = Boolean(p.versionMismatch);
          assets = Array.isArray(p.assets) ? p.assets : [];
          profiles = Array.isArray(p.profiles) ? p.profiles : [];
          activeProfileId = p.activeProfileId || null;
          updateConnectionUI();
          renderAssets();
        }
      }
    };
  };
})();
