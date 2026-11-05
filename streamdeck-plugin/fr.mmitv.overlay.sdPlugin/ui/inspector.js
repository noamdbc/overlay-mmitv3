(function () {
  'use strict';

  let websocket = null;
  let piUUID = '';
  let actionUUID = '';
  let settings = {};
  let assets = [];
  let connected = false;
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
    dot.classList.toggle('online', connected);
    txt.textContent = connected
      ? `Connecté • ${assets.length} asset${assets.length > 1 ? 's' : ''}`
      : `Hors ligne (${serverUrl.replace(/^https?:\/\//, '')})`;

    const inpUrl = document.getElementById('inpServerUrl');
    if (document.activeElement !== inpUrl) {
      inpUrl.value = serverUrl;
    }

    if (!connected) {
      document.getElementById('serverBox').classList.remove('hidden');
    }
  }

  function renderAssets() {
    if (actionUUID !== 'fr.mmitv.overlay.asset') return;

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
            primaryText: item.primaryText,
            secondaryText: item.secondaryText,
            mode: item.mode,
            duration: item.duration,
            accentColor: item.accentColor,
            primaryBg: item.primaryBg
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
  });

  document.getElementById('btnClearLabel').addEventListener('click', () => {
    document.getElementById('inpCustomLabel').value = '';
    settings = { ...settings, customLabel: '' };
    saveSettings();
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
          assets = Array.isArray(p.assets) ? p.assets : [];
          updateConnectionUI();
          renderAssets();
        }
      }
    };
  };
})();
