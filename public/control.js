(function () {
  'use strict';

  const BRAND_COLORS = ['#FAB001', '#FFFFFF', '#404040', '#000000'];

  const THEME_PRESETS = {
    'light-gold': {
      primaryBg: '#FFFFFF',
      primaryColor: '#000000',
      secondaryBg: '#FAB001',
      secondaryColor: '#000000',
      accentColor: '#FAB001',
      iconBg: '#404040',
      iconColor: '#FAB001',
      tagBg: '#000000',
      tagColor: '#FAB001',
      borderColor: '#000000'
    },
    'grey-gold': {
      primaryBg: '#404040',
      primaryColor: '#FFFFFF',
      secondaryBg: '#FAB001',
      secondaryColor: '#000000',
      accentColor: '#FAB001',
      iconBg: '#000000',
      iconColor: '#FAB001',
      tagBg: '#FAB001',
      tagColor: '#000000',
      borderColor: '#000000'
    },
    'black-gold': {
      primaryBg: '#000000',
      primaryColor: '#FFFFFF',
      secondaryBg: '#FAB001',
      secondaryColor: '#000000',
      accentColor: '#FAB001',
      iconBg: '#FAB001',
      iconColor: '#000000',
      tagBg: '#404040',
      tagColor: '#FFFFFF',
      borderColor: '#FAB001'
    },
    'gold-black': {
      primaryBg: '#FAB001',
      primaryColor: '#000000',
      secondaryBg: '#000000',
      secondaryColor: '#FFFFFF',
      accentColor: '#000000',
      iconBg: '#000000',
      iconColor: '#FAB001',
      tagBg: '#FFFFFF',
      tagColor: '#000000',
      borderColor: '#000000'
    },
    'clean-white': {
      primaryBg: '#FFFFFF',
      primaryColor: '#000000',
      secondaryBg: '#404040',
      secondaryColor: '#FFFFFF',
      accentColor: '#FAB001',
      iconBg: '#FAB001',
      iconColor: '#000000',
      tagBg: '#404040',
      tagColor: '#FAB001',
      borderColor: '#404040'
    }
  };

  const COLOR_FIELDS = [
    { key: 'primaryBg', label: 'Fond principal' },
    { key: 'primaryColor', label: 'Texte principal' },
    { key: 'secondaryBg', label: 'Fond secondaire' },
    { key: 'secondaryColor', label: 'Texte secondaire' },
    { key: 'accentColor', label: 'Accent graphique' },
    { key: 'iconBg', label: 'Fond icône' },
    { key: 'iconColor', label: 'Couleur icône' },
    { key: 'tagBg', label: 'Fond badge' },
    { key: 'tagColor', label: 'Texte badge' },
    { key: 'borderColor', label: 'Couleur bordure' }
  ];

  const ICON_CHOICES = [
    '',
    'fa-solid fa-user',
    'fa-solid fa-microphone-lines',
    'fa-solid fa-video',
    'fa-solid fa-clapperboard',
    'fa-solid fa-tower-broadcast',
    'fa-solid fa-tv',
    'fa-solid fa-bolt',
    'fa-solid fa-bullhorn',
    'fa-solid fa-comments',
    'fa-solid fa-graduation-cap',
    'fa-solid fa-award',
    'fa-solid fa-play',
    'fa-solid fa-star',
    'fa-solid fa-camera',
    'fa-solid fa-headphones',
    'fa-solid fa-music',
    'fa-solid fa-code',
    'fa-solid fa-palette',
    'fa-solid fa-gamepad',
    'fa-solid fa-globe',
    'fa-solid fa-location-dot',
    'fa-solid fa-clock',
    'fa-solid fa-newspaper',
    'fa-solid fa-circle-info',
    'fa-solid fa-hashtag',
    'fa-solid fa-fire',
    'fa-solid fa-lightbulb',
    'fa-solid fa-briefcase',
    'fa-solid fa-users',
    'fa-solid fa-film',
    'fa-solid fa-wand-magic-sparkles'
  ];

  // State
  let assets = [];
  let selectedId = null;
  let draft = null;
  let activeFilter = 'all';
  let searchQuery = '';
  let dragSrcId = null;

  let airState = {
    phase: 'IDLE',
    currentAsset: null,
    queuedAsset: null,
    autoHideAt: null,
    autoDurationMs: null
  };
  let clockOffsetMs = 0;
  let pgmInitialized = false;
  let lanOverlayUrl = `${window.location.origin}/overlay`;

  const pvwStage = document.getElementById('pvwStage');
  const pgmStage = document.getElementById('pgmStage');
  const pvwRenderer = new window.OverlayRenderer(pvwStage);
  const pgmRenderer = new window.OverlayRenderer(pgmStage);

  const socket = window.io({ query: { role: 'control' } });

  function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  function getSavedSelected() {
    if (!selectedId) return null;
    return assets.find((a) => a.id === selectedId) || null;
  }

  function checkDirty() {
    if (!draft) return false;
    const saved = getSavedSelected();
    if (!saved) return true;
    return JSON.stringify(draft) !== JSON.stringify(saved);
  }

  function showToast(msg) {
    const el = document.getElementById('toast');
    el.textContent = msg;
    el.classList.remove('hidden');
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => el.classList.add('hidden'), 1800);
  }

  // =========================================================
  // Responsive 1920x1080 Viewport Scaling
  // =========================================================
  function fitViewport(wrapId, scalerId) {
    const wrap = document.getElementById(wrapId);
    const scaler = document.getElementById(scalerId);
    if (!wrap || !scaler) return;
    const pad = 16;
    const w = Math.max(80, wrap.clientWidth - pad);
    const h = Math.max(45, wrap.clientHeight - pad);
    const scale = Math.min(w / 1920, h / 1080);
    scaler.style.transform = `translate(-50%, -50%) scale(${scale.toFixed(4)})`;
  }

  function setupViewportObservers() {
    const ro = new ResizeObserver(() => {
      fitViewport('pvwViewport', 'pvwScaler');
      fitViewport('pgmViewport', 'pgmScaler');
    });
    ro.observe(document.getElementById('pvwViewport'));
    ro.observe(document.getElementById('pgmViewport'));
    fitViewport('pvwViewport', 'pvwScaler');
    fitViewport('pgmViewport', 'pgmScaler');
  }

  // =========================================================
  // Network Info (LAN IP for vMix & Remote Devices)
  // =========================================================
  async function loadNetworkInfo() {
    try {
      const res = await fetch('/api/info');
      const info = await res.json();
      if (info.serverNow) {
        clockOffsetMs = info.serverNow - Date.now();
      }
      const host =
        info.ips && info.ips.length > 0
          ? `${info.ips[0].address}:${info.port}`
          : window.location.host;
      lanOverlayUrl = `http://${host}/overlay`;
      document.getElementById('lanUrlText').textContent = `${host}/overlay`;
      updateOverlayCount(info.overlayClients || 0);
    } catch (_e) {
      document.getElementById('lanUrlText').textContent = `${window.location.host}/overlay`;
    }
  }

  function updateOverlayCount(count) {
    const dot = document.getElementById('overlayConnDot');
    const lbl = document.getElementById('overlayCountLabel');
    dot.classList.toggle('connected', count > 0);
    lbl.textContent = `${count} Overlay${count > 1 ? 's' : ''}`;
  }

  // =========================================================
  // Dynamic Inspector Color Rows & Icon Picker Construction
  // =========================================================
  function buildColorsMatrix() {
    const container = document.getElementById('colorsMatrix');
    container.innerHTML = '';

    for (const field of COLOR_FIELDS) {
      const row = document.createElement('div');
      row.className = 'color-row';

      const swatchesHtml = BRAND_COLORS.map(
        (hex) =>
          `<button type="button" class="swatch-dot" data-color-key="${field.key}" data-hex="${hex}" style="background:${hex}" title="${hex}"></button>`
      ).join('');

      row.innerHTML = `
        <span class="color-lbl">${field.label}</span>
        <div class="color-controls">
          <div class="brand-swatches">${swatchesHtml}</div>
          <input type="color" class="color-picker-native" data-picker-key="${field.key}">
        </div>
      `;
      container.appendChild(row);
    }

    container.addEventListener('click', (e) => {
      const sw = e.target.closest('.swatch-dot');
      if (!sw || !draft) return;
      const key = sw.dataset.colorKey;
      const hex = sw.dataset.hex;
      draft[key] = hex;
      syncInspectorFromDraft();
      renderPreviewStatic();
      updateDirtyUI();
    });

    container.addEventListener('input', (e) => {
      const picker = e.target.closest('.color-picker-native');
      if (!picker || !draft) return;
      draft[picker.dataset.pickerKey] = picker.value.toUpperCase();
      renderPreviewStatic();
      updateDirtyUI();
    });
  }

  function buildIconGrid() {
    const grid = document.getElementById('iconGrid');
    grid.innerHTML = '';

    for (const cls of ICON_CHOICES) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'ico-choice';
      btn.dataset.ico = cls;
      btn.title = cls || 'Aucune icône';
      btn.innerHTML = cls ? `<i class="${cls}"></i>` : `<i class="fa-solid fa-ban" style="opacity:0.45"></i>`;
      grid.appendChild(btn);
    }

    grid.addEventListener('click', (e) => {
      const btn = e.target.closest('.ico-choice');
      if (!btn || !draft) return;
      draft.icon = btn.dataset.ico;
      syncInspectorFromDraft();
      renderPreviewStatic();
      updateDirtyUI();
    });
  }

  // =========================================================
  // Asset Selection, Creation & Rundown List Rendering
  // =========================================================
  function makeNewTemplate(kind) {
    const isTitre = kind === 'titre';
    return {
      id: 'ast_' + Math.random().toString(36).slice(2, 10),
      kind: isTitre ? 'titre' : 'synthe',
      primaryText: isTitre ? 'Nouveau titre de séquence' : 'Prénom Nom',
      secondaryText: isTitre ? '' : 'Fonction / Rôle',
      tagText: '',
      icon: isTitre ? 'fa-solid fa-clapperboard' : 'fa-solid fa-user',
      mode: 'auto',
      duration: isTitre ? 5 : 6,
      layout: isTitre ? 'minimal' : 'layered',
      align: isTitre ? 'center' : 'left',
      posX: isTitre ? 0 : 96,
      posY: isTitre ? 58 : 84,
      scale: 1,
      borderRadius: 10,
      paddingX: isTitre ? 24 : 26,
      paddingY: isTitre ? 11 : 14,
      accentWidth: isTitre ? 5 : 8,
      borderWidth: 0,
      primaryBg: isTitre ? '#404040' : '#FFFFFF',
      primaryColor: isTitre ? '#FFFFFF' : '#000000',
      secondaryBg: '#FAB001',
      secondaryColor: '#000000',
      accentColor: '#FAB001',
      iconBg: isTitre ? '#FAB001' : '#404040',
      iconColor: isTitre ? '#000000' : '#FAB001',
      tagBg: '#000000',
      tagColor: '#FAB001',
      borderColor: '#000000',
      primarySize: isTitre ? 27 : 42,
      primaryWeight: isTitre ? 600 : 700,
      primaryUppercase: false,
      secondarySize: isTitre ? 15 : 22,
      secondaryWeight: 600,
      secondaryUppercase: isTitre,
      animStyle: 'bouncy-rise',
      animSpeed: 1
    };
  }

  function selectAssetById(id) {
    const found = assets.find((a) => a.id === id);
    if (!found) return;
    selectedId = found.id;
    draft = clone(found);
    syncInspectorFromDraft();
    renderPreviewStatic();
    updateDirtyUI();
    renderAssetList();
  }

  function updateDirtyUI() {
    const dirty = checkDirty();
    const savedExists = Boolean(getSavedSelected());
    document.getElementById('dirtyIndicator').classList.toggle('hidden', !dirty);
    document.getElementById('btnRevert').classList.toggle('hidden', !(dirty && savedExists));
    const btnSave = document.getElementById('btnSave');
    btnSave.classList.toggle('has-changes', dirty);
    document.getElementById('saveBtnLabel').textContent = savedExists ? 'Enregistrer' : 'Ajouter à la liste';
  }

  function renderPreviewStatic() {
    if (!draft) {
      pvwRenderer.cut();
      return;
    }
    pvwRenderer.renderStatic(draft);
  }

  function renderAssetList() {
    const listEl = document.getElementById('assetList');
    listEl.innerHTML = '';

    const q = searchQuery.trim().toLowerCase();
    const canDrag = activeFilter === 'all' && !q;

    const filtered = assets.filter((item) => {
      if (activeFilter !== 'all' && item.kind !== activeFilter) return false;
      if (q) {
        const hay = `${item.primaryText} ${item.secondaryText} ${item.tagText}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    const liveId =
      airState.phase !== 'IDLE' && airState.currentAsset ? airState.currentAsset.id : null;
    const queuedId = airState.queuedAsset ? airState.queuedAsset.id : null;

    for (const item of filtered) {
      const isSelected = item.id === selectedId;
      const isLive = item.id === liveId && airState.phase !== 'EXITING';
      const isQueued = item.id === queuedId;

      const row = document.createElement('div');
      row.className = [
        'asset-item',
        isSelected ? 'is-selected' : '',
        isLive ? 'is-live' : '',
        isQueued ? 'is-queued' : ''
      ]
        .filter(Boolean)
        .join(' ');
      row.dataset.id = item.id;
      row.draggable = canDrag;

      const kindIcon =
        item.align === 'center' || item.kind === 'titre'
          ? 'fa-closed-captioning'
          : 'fa-id-badge';

      const modeBadge =
        item.mode === 'auto' ? `AUTO ${item.duration}s` : 'MANUEL';

      row.innerHTML = `
        <span class="asset-swatch" style="background:${item.accentColor || '#FAB001'}"></span>
        <div class="asset-info">
          <div class="asset-top-line">
            <i class="fa-solid ${kindIcon} asset-kind-ico"></i>
            <span class="asset-primary">${escapeText(item.primaryText || 'Sans titre')}</span>
          </div>
          <div class="asset-meta-line">
            <span class="asset-secondary">${escapeText(item.secondaryText || (item.kind === 'titre' ? 'Titre centré' : 'Synthé'))}</span>
            <span class="asset-mode-tag">${isQueued ? 'SUIVANT' : modeBadge}</span>
          </div>
        </div>
        <div class="asset-actions">
          <button type="button" class="btn-row-mini" data-act="dup" title="Dupliquer">
            <i class="fa-regular fa-clone"></i>
          </button>
          <button type="button" class="btn-row-mini danger" data-act="del" title="Supprimer">
            <i class="fa-regular fa-trash-can"></i>
          </button>
          <button type="button" class="btn-row-air" data-act="air" title="${isLive ? 'Sortir de l\'antenne' : 'Envoyer en direct'}">
            <i class="fa-solid ${isLive ? 'fa-stop' : 'fa-play'}"></i>
          </button>
        </div>
      `;

      if (canDrag) {
        row.addEventListener('dragstart', (e) => {
          dragSrcId = item.id;
          row.classList.add('dragging');
          e.dataTransfer.effectAllowed = 'move';
        });
        row.addEventListener('dragend', () => {
          dragSrcId = null;
          row.classList.remove('dragging');
        });
        row.addEventListener('dragover', (e) => {
          e.preventDefault();
          e.dataTransfer.dropEffect = 'move';
        });
        row.addEventListener('drop', (e) => {
          e.preventDefault();
          if (!dragSrcId || dragSrcId === item.id) return;
          const ids = assets.map((a) => a.id);
          const from = ids.indexOf(dragSrcId);
          const to = ids.indexOf(item.id);
          if (from < 0 || to < 0) return;
          ids.splice(from, 1);
          ids.splice(to, 0, dragSrcId);
          socket.emit('asset:reorder', ids);
        });
      }

      listEl.appendChild(row);
    }
  }

  function escapeText(str) {
    return String(str ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  // =========================================================
  // Sync Inspector Controls <-> Draft
  // =========================================================
  function syncInspectorFromDraft() {
    if (!draft) return;

    document.querySelectorAll('[data-kind-preset]').forEach((b) => {
      b.classList.toggle('active', b.dataset.kindPreset === draft.kind);
    });

    document.getElementById('inpPrimary').value = draft.primaryText || '';
    document.getElementById('inpSecondary').value = draft.secondaryText || '';
    document.getElementById('inpTag').value = draft.tagText || '';
    document.getElementById('inpIcon').value = draft.icon || '';

    const prevIco = document.getElementById('currentIconPreview');
    prevIco.className = draft.icon && draft.icon.trim() ? draft.icon.trim() : 'fa-solid fa-ban';

    document.querySelectorAll('.ico-choice').forEach((b) => {
      b.classList.toggle('active', b.dataset.ico === (draft.icon || ''));
    });

    document.querySelectorAll('[data-mode]').forEach((b) => {
      b.classList.toggle('active', b.dataset.mode === draft.mode);
    });

    document.getElementById('durationGroup').classList.toggle('hidden', draft.mode !== 'auto');
    setPair('rngDuration', 'numDuration', draft.duration);

    document.querySelectorAll('[data-layout]').forEach((b) => {
      b.classList.toggle('active', b.dataset.layout === draft.layout);
    });

    document.querySelectorAll('[data-align]').forEach((b) => {
      b.classList.toggle('active', b.dataset.align === draft.align);
    });

    document.querySelectorAll('[data-picker-key]').forEach((inp) => {
      const val = draft[inp.dataset.pickerKey] || '#000000';
      if (/^#[0-9a-fA-F]{6}$/.test(val)) {
        inp.value = val;
      }
    });

    setPair('rngPosX', 'numPosX', draft.posX);
    setPair('rngPosY', 'numPosY', draft.posY);
    setPair('rngScale', 'numScale', draft.scale);
    setPair('rngRadius', 'numRadius', draft.borderRadius);
    setPair('rngPadX', 'numPadX', draft.paddingX);
    setPair('rngPadY', 'numPadY', draft.paddingY);
    setPair('rngAccentW', 'numAccentW', draft.accentWidth);
    setPair('rngBorderW', 'numBorderW', draft.borderWidth);

    document.getElementById('chkPrimaryUpper').checked = Boolean(draft.primaryUppercase);
    document.getElementById('chkSecondaryUpper').checked = Boolean(draft.secondaryUppercase);
    setPair('rngPrimarySize', 'numPrimarySize', draft.primarySize);
    setPair('rngSecondarySize', 'numSecondarySize', draft.secondarySize);

    document.querySelectorAll('[data-weight-target="primaryWeight"] button').forEach((b) => {
      b.classList.toggle('active', Number(b.dataset.w) === Number(draft.primaryWeight));
    });
    document.querySelectorAll('[data-weight-target="secondaryWeight"] button').forEach((b) => {
      b.classList.toggle('active', Number(b.dataset.w) === Number(draft.secondaryWeight));
    });

    document.querySelectorAll('[data-anim]').forEach((b) => {
      b.classList.toggle('active', b.dataset.anim === draft.animStyle);
    });

    document.querySelectorAll('[data-speed]').forEach((b) => {
      b.classList.toggle('active', Math.abs(Number(b.dataset.speed) - Number(draft.animSpeed)) < 0.08);
    });
  }

  function setPair(rangeId, numId, val) {
    const r = document.getElementById(rangeId);
    const n = document.getElementById(numId);
    if (r) r.value = val;
    if (n) n.value = val;
  }

  function bindSliderPair(rangeId, numId, key, isFloat) {
    const r = document.getElementById(rangeId);
    const n = document.getElementById(numId);
    const apply = (raw) => {
      if (!draft) return;
      const v = isFloat ? parseFloat(raw) : parseInt(raw, 10);
      if (Number.isNaN(v)) return;
      draft[key] = v;
      if (r && document.activeElement !== r) r.value = v;
      if (n && document.activeElement !== n) n.value = v;
      renderPreviewStatic();
      updateDirtyUI();
    };
    r.addEventListener('input', () => apply(r.value));
    n.addEventListener('input', () => apply(n.value));
  }

  // =========================================================
  // Bind All UI Events
  // =========================================================
  function bindEvents() {
    // Filter tabs
    document.querySelectorAll('.filter-tab').forEach((btn) => {
      btn.addEventListener('click', () => {
        activeFilter = btn.dataset.filter;
        document.querySelectorAll('.filter-tab').forEach((b) => b.classList.toggle('active', b === btn));
        renderAssetList();
      });
    });

    // Search
    const searchInput = document.getElementById('searchInput');
    const btnClearSearch = document.getElementById('btnClearSearch');
    searchInput.addEventListener('input', () => {
      searchQuery = searchInput.value;
      btnClearSearch.classList.toggle('hidden', !searchQuery);
      renderAssetList();
    });
    btnClearSearch.addEventListener('click', () => {
      searchInput.value = '';
      searchQuery = '';
      btnClearSearch.classList.add('hidden');
      renderAssetList();
    });

    // Create Synthé / Titre
    document.getElementById('btnNewSynthe').addEventListener('click', () => {
      const fresh = makeNewTemplate('synthe');
      socket.emit('asset:save', fresh, (res) => {
        if (res?.asset) {
          selectAssetById(res.asset.id);
          const inp = document.getElementById('inpPrimary');
          inp.focus();
          inp.select();
        }
      });
    });

    document.getElementById('btnNewTitre').addEventListener('click', () => {
      const fresh = makeNewTemplate('titre');
      socket.emit('asset:save', fresh, (res) => {
        if (res?.asset) {
          selectAssetById(res.asset.id);
          const inp = document.getElementById('inpPrimary');
          inp.focus();
          inp.select();
        }
      });
    });

    // Asset list interactions
    document.getElementById('assetList').addEventListener('click', (e) => {
      const row = e.target.closest('.asset-item');
      if (!row) return;
      const id = row.dataset.id;
      const actBtn = e.target.closest('[data-act]');

      if (actBtn) {
        e.stopPropagation();
        const act = actBtn.dataset.act;
        const item = assets.find((a) => a.id === id);
        if (!item) return;

        if (act === 'air') {
          const isCurrentlyLive =
            airState.phase !== 'IDLE' &&
            airState.phase !== 'EXITING' &&
            airState.currentAsset &&
            airState.currentAsset.id === id;

          if (isCurrentlyLive) {
            socket.emit('air:out');
          } else {
            const payload = id === selectedId && draft ? draft : item;
            socket.emit('air:take', { asset: payload });
          }
        } else if (act === 'dup') {
          socket.emit('asset:duplicate', id, (res) => {
            if (res?.asset) {
              selectAssetById(res.asset.id);
              showToast('Asset dupliqué');
            }
          });
        } else if (act === 'del') {
          socket.emit('asset:delete', id, () => {
            if (selectedId === id) {
              if (assets.length > 0) {
                const next = assets.find((a) => a.id !== id);
                if (next) selectAssetById(next.id);
              } else {
                selectedId = null;
                draft = makeNewTemplate('synthe');
                syncInspectorFromDraft();
                renderPreviewStatic();
                updateDirtyUI();
              }
            }
          });
        }
        return;
      }

      selectAssetById(id);
    });

    // Inspector tabs
    document.querySelectorAll('.insp-tab').forEach((tab) => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.insp-tab').forEach((t) => t.classList.toggle('active', t === tab));
        document.querySelectorAll('.insp-pane').forEach((p) => {
          p.classList.toggle('active', p.id === `tab-${tab.dataset.tab}`);
        });
      });
    });

    // Kind preset switch (Synthé bottom-left vs Titre bottom-center)
    document.querySelectorAll('[data-kind-preset]').forEach((btn) => {
      btn.addEventListener('click', () => {
        if (!draft) return;
        const kind = btn.dataset.kindPreset;
        draft.kind = kind;
        if (kind === 'titre') {
          draft.layout = 'minimal';
          draft.align = 'center';
          draft.posX = 0;
          draft.posY = 60;
          draft.primarySize = 27;
          draft.primaryWeight = 600;
          draft.secondarySize = 15;
          draft.accentWidth = 5;
          draft.paddingX = 26;
          draft.paddingY = 12;
        } else {
          draft.layout = 'layered';
          draft.align = 'left';
          draft.posX = 96;
          draft.posY = 84;
          draft.primarySize = 42;
          draft.primaryWeight = 700;
          draft.secondarySize = 22;
          draft.accentWidth = 8;
          draft.paddingX = 28;
          draft.paddingY = 15;
        }
        syncInspectorFromDraft();
        renderPreviewStatic();
        updateDirtyUI();
      });
    });

    // Text inputs
    ['inpPrimary', 'inpSecondary', 'inpTag', 'inpIcon'].forEach((id) => {
      const mapKey = {
        inpPrimary: 'primaryText',
        inpSecondary: 'secondaryText',
        inpTag: 'tagText',
        inpIcon: 'icon'
      }[id];

      document.getElementById(id).addEventListener('input', (e) => {
        if (!draft) return;
        draft[mapKey] = e.target.value;
        if (id === 'inpIcon') {
          const prevIco = document.getElementById('currentIconPreview');
          prevIco.className = draft.icon && draft.icon.trim() ? draft.icon.trim() : 'fa-solid fa-ban';
        }
        renderPreviewStatic();
        updateDirtyUI();
      });
    });

    // Icon picker toggle & clear
    document.getElementById('btnIconPicker').addEventListener('click', () => {
      document.getElementById('iconPickerDrawer').classList.toggle('hidden');
    });
    document.getElementById('btnClearIcon').addEventListener('click', () => {
      if (!draft) return;
      draft.icon = '';
      syncInspectorFromDraft();
      renderPreviewStatic();
      updateDirtyUI();
    });

    // Mode Auto / Manual
    document.querySelectorAll('[data-mode]').forEach((btn) => {
      btn.addEventListener('click', () => {
        if (!draft) return;
        draft.mode = btn.dataset.mode;
        syncInspectorFromDraft();
        updateDirtyUI();
      });
    });

    // Layout
    document.querySelectorAll('[data-layout]').forEach((btn) => {
      btn.addEventListener('click', () => {
        if (!draft) return;
        draft.layout = btn.dataset.layout;
        syncInspectorFromDraft();
        renderPreviewStatic();
        updateDirtyUI();
      });
    });

    // Align
    document.querySelectorAll('[data-align]').forEach((btn) => {
      btn.addEventListener('click', () => {
        if (!draft) return;
        const nextAlign = btn.dataset.align;
        if (nextAlign === 'center' && draft.align !== 'center') {
          draft.posX = 0;
        } else if (nextAlign !== 'center' && draft.align === 'center') {
          draft.posX = 96;
        }
        draft.align = nextAlign;
        syncInspectorFromDraft();
        renderPreviewStatic();
        updateDirtyUI();
      });
    });

    // Theme presets
    document.getElementById('themePresets').addEventListener('click', (e) => {
      const chip = e.target.closest('[data-theme]');
      if (!chip || !draft) return;
      const theme = THEME_PRESETS[chip.dataset.theme];
      if (!theme) return;
      Object.assign(draft, theme);
      syncInspectorFromDraft();
      renderPreviewStatic();
      updateDirtyUI();
    });

    // Sliders
    bindSliderPair('rngDuration', 'numDuration', 'duration', true);
    bindSliderPair('rngPosX', 'numPosX', 'posX', false);
    bindSliderPair('rngPosY', 'numPosY', 'posY', false);
    bindSliderPair('rngScale', 'numScale', 'scale', true);
    bindSliderPair('rngRadius', 'numRadius', 'borderRadius', false);
    bindSliderPair('rngPadX', 'numPadX', 'paddingX', false);
    bindSliderPair('rngPadY', 'numPadY', 'paddingY', false);
    bindSliderPair('rngAccentW', 'numAccentW', 'accentWidth', false);
    bindSliderPair('rngBorderW', 'numBorderW', 'borderWidth', false);
    bindSliderPair('rngPrimarySize', 'numPrimarySize', 'primarySize', false);
    bindSliderPair('rngSecondarySize', 'numSecondarySize', 'secondarySize', false);

    // Uppercase toggles
    document.getElementById('chkPrimaryUpper').addEventListener('change', (e) => {
      if (!draft) return;
      draft.primaryUppercase = e.target.checked;
      renderPreviewStatic();
      updateDirtyUI();
    });
    document.getElementById('chkSecondaryUpper').addEventListener('change', (e) => {
      if (!draft) return;
      draft.secondaryUppercase = e.target.checked;
      renderPreviewStatic();
      updateDirtyUI();
    });

    // Quicksand weights
    document.querySelectorAll('[data-weight-target]').forEach((group) => {
      const key = group.dataset.weightTarget;
      group.addEventListener('click', (e) => {
        const b = e.target.closest('button[data-w]');
        if (!b || !draft) return;
        draft[key] = Number(b.dataset.w);
        syncInspectorFromDraft();
        renderPreviewStatic();
        updateDirtyUI();
      });
    });

    // Animation style & speed
    document.querySelectorAll('[data-anim]').forEach((btn) => {
      btn.addEventListener('click', () => {
        if (!draft) return;
        draft.animStyle = btn.dataset.anim;
        syncInspectorFromDraft();
        pvwRenderer.playIn(draft);
        updateDirtyUI();
      });
    });

    document.querySelectorAll('[data-speed]').forEach((btn) => {
      btn.addEventListener('click', () => {
        if (!draft) return;
        draft.animSpeed = Number(btn.dataset.speed);
        syncInspectorFromDraft();
        pvwRenderer.playIn(draft);
        updateDirtyUI();
      });
    });

    // Style propagation
    document.getElementById('btnApplySameKind').addEventListener('click', () => {
      if (!draft) return;
      socket.emit('asset:applyStyle', { styleAsset: draft, scope: 'kind' }, () => {
        showToast('Style appliqué à la catégorie');
      });
    });
    document.getElementById('btnApplyAll').addEventListener('click', () => {
      if (!draft) return;
      socket.emit('asset:applyStyle', { styleAsset: draft, scope: 'all' }, () => {
        showToast('Style appliqué à tous les assets');
      });
    });

    // Preview tools
    document.getElementById('btnTestAnimIn').addEventListener('click', () => {
      if (draft) pvwRenderer.playIn(draft);
    });
    document.getElementById('btnTestAnimOut').addEventListener('click', () => {
      if (!draft) return;
      pvwRenderer.playOut(() => {
        setTimeout(() => {
          if (draft) pvwRenderer.renderStatic(draft);
        }, 280);
      });
    });

    const safeGuides = document.getElementById('safeGuides');
    const btnToggleSafe = document.getElementById('btnToggleSafe');
    btnToggleSafe.addEventListener('click', () => {
      const hidden = safeGuides.classList.toggle('hidden');
      btnToggleSafe.classList.toggle('active', !hidden);
    });

    const pvwScaler = document.getElementById('pvwScaler');
    const bgModes = ['bg-checker', 'bg-dark-studio', 'bg-light-studio'];
    let bgIdx = 0;
    document.getElementById('btnCycleBg').addEventListener('click', () => {
      pvwScaler.classList.remove(...bgModes);
      bgIdx = (bgIdx + 1) % bgModes.length;
      pvwScaler.classList.add(bgModes[bgIdx]);
    });

    // Broadcast transport buttons
    document.getElementById('btnTake').addEventListener('click', () => {
      if (!draft) return;
      socket.emit('air:take', { asset: draft });
    });
    document.getElementById('btnTakeAuto').addEventListener('click', () => {
      if (!draft) return;
      socket.emit('air:take', { asset: draft, overrideMode: 'auto' });
    });
    document.getElementById('btnTakeManual').addEventListener('click', () => {
      if (!draft) return;
      socket.emit('air:take', { asset: draft, overrideMode: 'manual' });
    });
    document.getElementById('btnOut').addEventListener('click', () => {
      socket.emit('air:out');
    });
    document.getElementById('btnCut').addEventListener('click', () => {
      socket.emit('air:cut');
    });
    document.getElementById('btnHoldAir').addEventListener('click', () => {
      socket.emit('air:hold');
    });

    // Save / Revert / Duplicate / Scratch
    document.getElementById('btnSave').addEventListener('click', saveCurrentDraft);
    document.getElementById('btnRevert').addEventListener('click', () => {
      const saved = getSavedSelected();
      if (!saved) return;
      draft = clone(saved);
      syncInspectorFromDraft();
      renderPreviewStatic();
      updateDirtyUI();
      showToast('Modifications annulées');
    });
    document.getElementById('btnDuplicate').addEventListener('click', duplicateCurrentDraft);
    document.getElementById('btnScratch').addEventListener('click', () => {
      const base = draft ? clone(draft) : makeNewTemplate('synthe');
      selectedId = null;
      draft = {
        ...base,
        id: 'live_' + Math.random().toString(36).slice(2, 9),
        primaryText: '',
        secondaryText: ''
      };
      syncInspectorFromDraft();
      renderPreviewStatic();
      updateDirtyUI();
      renderAssetList();
      document.getElementById('inpPrimary').focus();
    });

    // Copy LAN URL
    document.getElementById('btnCopyOverlayUrl').addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(lanOverlayUrl);
        showToast(`Copié : ${lanOverlayUrl}`);
      } catch (_e) {
        window.prompt('URL Overlay vMix :', lanOverlayUrl);
      }
    });

    // Export / Import JSON
    document.getElementById('btnExport').addEventListener('click', () => {
      window.location.href = '/api/export';
    });
    const fileImport = document.getElementById('fileImport');
    document.getElementById('btnImport').addEventListener('click', () => fileImport.click());
    fileImport.addEventListener('change', async () => {
      const file = fileImport.files?.[0];
      if (!file) return;
      try {
        const text = await file.text();
        const json = JSON.parse(text);
        const list = Array.isArray(json) ? json : json.assets;
        if (!Array.isArray(list)) throw new Error('Format invalide');
        socket.emit('store:import', { assets: list }, (res) => {
          if (res?.ok) showToast(`${res.count} assets importés`);
        });
      } catch (_err) {
        showToast('Fichier JSON invalide');
      } finally {
        fileImport.value = '';
      }
    });

    // Global Keyboard Shortcuts (Broadcast Régie)
    window.addEventListener('keydown', (e) => {
      const tag = document.activeElement?.tagName;
      const inInput = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        saveCurrentDraft();
        return;
      }

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        duplicateCurrentDraft();
        return;
      }

      if (e.key === 'Escape') {
        e.preventDefault();
        if (e.shiftKey) {
          socket.emit('air:cut');
        } else {
          socket.emit('air:out');
        }
        return;
      }

      if (inInput) return;

      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        if (draft) socket.emit('air:take', { asset: draft });
      } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        if (assets.length === 0) return;
        const idx = assets.findIndex((a) => a.id === selectedId);
        const delta = e.key === 'ArrowDown' ? 1 : -1;
        const nextIdx = idx < 0 ? 0 : (idx + delta + assets.length) % assets.length;
        selectAssetById(assets[nextIdx].id);
      }
    });
  }

  function saveCurrentDraft() {
    if (!draft) return;
    if (String(draft.id).startsWith('live_')) {
      draft.id = 'ast_' + Math.random().toString(36).slice(2, 10);
    }
    socket.emit('asset:save', draft, (res) => {
      if (res?.asset) {
        selectedId = res.asset.id;
        draft = clone(res.asset);
        updateDirtyUI();
        renderAssetList();
        showToast('Enregistré');
      }
    });
  }

  function duplicateCurrentDraft() {
    if (!draft) return;
    socket.emit('asset:duplicate', draft, (res) => {
      if (res?.asset) {
        selectAssetById(res.asset.id);
        showToast('Dupliqué');
      }
    });
  }

  // =========================================================
  // Socket.IO Synchronization & Live Air Countdown Loop
  // =========================================================
  socket.on('assets:list', (serverAssets) => {
    const wasDirty = checkDirty();
    assets = Array.isArray(serverAssets) ? serverAssets : [];

    if (!draft && assets.length > 0) {
      selectAssetById(assets[0].id);
      return;
    }

    if (!wasDirty && selectedId) {
      const updated = assets.find((a) => a.id === selectedId);
      if (updated) {
        draft = clone(updated);
        syncInspectorFromDraft();
        renderPreviewStatic();
      }
    }

    updateDirtyUI();
    renderAssetList();
  });

  socket.on('air:state', (state) => {
    if (!state) return;
    if (state.serverNow) {
      clockOffsetMs = state.serverNow - Date.now();
    }
    airState = state;
    updateOverlayCount(state.overlayClients || 0);
    updateAirStatusUI();
    renderAssetList();

    if (!pgmInitialized) {
      pgmInitialized = true;
      if (state.phase === 'ON_AIR' && state.currentAsset) {
        pgmRenderer.renderStatic(state.currentAsset);
      } else if (state.phase === 'ENTERING' && state.currentAsset) {
        pgmRenderer.playIn(state.currentAsset);
      } else {
        pgmRenderer.cut();
      }
    }
  });

  socket.on('overlay:cmd', (cmd) => {
    if (!cmd) return;
    pgmInitialized = true;
    if (cmd.type === 'ANIMATE_IN') {
      pgmRenderer.playIn(cmd.asset);
    } else if (cmd.type === 'ANIMATE_OUT') {
      pgmRenderer.playOut();
    } else if (cmd.type === 'CUT') {
      pgmRenderer.cut();
    }
  });

  function updateAirStatusUI() {
    const badge = document.getElementById('airBadge');
    const txt = document.getElementById('airStatusText');
    const pgmTag = document.getElementById('pgmTag');
    const pgmLabel = document.getElementById('pgmAssetLabel');
    const queuedBadge = document.getElementById('queuedBadge');
    const queuedLabel = document.getElementById('queuedLabel');
    const timerWrap = document.getElementById('airTimerWrap');

    badge.classList.remove('is-idle', 'is-live', 'is-transition');

    if (airState.phase === 'ON_AIR' && airState.currentAsset) {
      badge.classList.add('is-live');
      txt.textContent = "À L'ANTENNE";
      pgmTag.classList.add('live');
      pgmLabel.textContent = airState.currentAsset.primaryText || 'Asset actif';
    } else if (airState.phase === 'ENTERING' || airState.phase === 'EXITING') {
      badge.classList.add('is-transition');
      txt.textContent = airState.queuedAsset ? 'TRANSITION...' : (airState.phase === 'ENTERING' ? 'ENTRÉE...' : 'SORTIE...');
      pgmTag.classList.toggle('live', airState.phase === 'ENTERING');
      pgmLabel.textContent = airState.currentAsset?.primaryText || '—';
    } else {
      badge.classList.add('is-idle');
      txt.textContent = 'HORS ANTENNE';
      pgmTag.classList.remove('live');
      pgmLabel.textContent = '—';
    }

    if (airState.queuedAsset) {
      queuedBadge.classList.remove('hidden');
      queuedLabel.textContent = airState.queuedAsset.primaryText || 'Suivant';
    } else {
      queuedBadge.classList.add('hidden');
    }

    const showAutoTimer =
      airState.phase === 'ON_AIR' &&
      airState.autoHideAt &&
      airState.autoDurationMs > 0;
    timerWrap.classList.toggle('hidden', !showAutoTimer);
  }

  function tickCountdown() {
    if (
      airState.phase === 'ON_AIR' &&
      airState.autoHideAt &&
      airState.autoDurationMs > 0
    ) {
      const nowServer = Date.now() + clockOffsetMs;
      const remMs = Math.max(0, airState.autoHideAt - nowServer);
      const ratio = Math.min(1, Math.max(0, remMs / airState.autoDurationMs));
      document.getElementById('airTimerFill').style.transform = `scaleX(${ratio.toFixed(4)})`;
      document.getElementById('airTimerValue').textContent = `${(remMs / 1000).toFixed(1)}s`;
    }
    requestAnimationFrame(tickCountdown);
  }

  // =========================================================
  // Boot
  // =========================================================
  buildColorsMatrix();
  buildIconGrid();
  setupViewportObservers();
  bindEvents();
  loadNetworkInfo();
  requestAnimationFrame(tickCountdown);
})();
