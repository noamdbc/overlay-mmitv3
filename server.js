const express = require('express');
const http = require('http');
const path = require('path');
const fs = require('fs');
const os = require('os');
const crypto = require('crypto');
const { Server } = require('socket.io');

const PORT = Number(process.env.PORT) || 3000;
const HOST = '0.0.0.0';

const DATA_DIR = path.join(__dirname, 'data');
const STORE_PATH = path.join(DATA_DIR, 'store.json');

// Exact durations (ms) shared with public/shared/renderer.js
const ANIM_TIMINGS = {
  'bouncy-rise': { in: 760, out: 460 },
  'elastic-wipe': { in: 820, out: 480 },
  'spring-cascade': { in: 860, out: 480 }
};
const SWITCH_GAP_MS = 110;

function getAnimDuration(asset, direction) {
  const style = ANIM_TIMINGS[asset?.animStyle] ? asset.animStyle : 'bouncy-rise';
  const speed = clampNumber(asset?.animSpeed, 0.5, 2, 1);
  return Math.round(ANIM_TIMINGS[style][direction] * speed);
}

function clampNumber(val, min, max, fallback) {
  const n = Number(val);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

function makeId() {
  return 'ast_' + crypto.randomBytes(5).toString('hex');
}

function getDefaultPresets() {
  return [
    {
      id: makeId(),
      kind: 'synthe',
      primaryText: 'Camille Moreau',
      secondaryText: 'Réalisatrice • Plateau MMI',
      tagText: '',
      icon: 'fa-solid fa-video',
      mode: 'auto',
      duration: 6,
      layout: 'layered',
      align: 'left',
      posX: 96,
      posY: 84,
      scale: 1,
      borderRadius: 10,
      paddingX: 26,
      paddingY: 14,
      accentWidth: 8,
      borderWidth: 0,
      primaryBg: '#FFFFFF',
      primaryColor: '#000000',
      secondaryBg: '#FAB001',
      secondaryColor: '#000000',
      accentColor: '#FAB001',
      iconBg: '#404040',
      iconColor: '#FAB001',
      tagBg: '#000000',
      tagColor: '#FAB001',
      borderColor: '#000000',
      primarySize: 42,
      primaryWeight: 700,
      primaryUppercase: false,
      secondarySize: 22,
      secondaryWeight: 600,
      secondaryUppercase: false,
      animStyle: 'bouncy-rise',
      animSpeed: 1
    },
    {
      id: makeId(),
      kind: 'synthe',
      primaryText: 'Lucas Bernard',
      secondaryText: 'Enseignant-chercheur • IUT de Troyes',
      tagText: 'INVITÉ',
      icon: 'fa-solid fa-microphone-lines',
      mode: 'manual',
      duration: 7,
      layout: 'split',
      align: 'left',
      posX: 96,
      posY: 84,
      scale: 1,
      borderRadius: 12,
      paddingX: 26,
      paddingY: 14,
      accentWidth: 8,
      borderWidth: 0,
      primaryBg: '#404040',
      primaryColor: '#FFFFFF',
      secondaryBg: '#FAB001',
      secondaryColor: '#000000',
      accentColor: '#FAB001',
      iconBg: '#000000',
      iconColor: '#FAB001',
      tagBg: '#FAB001',
      tagColor: '#000000',
      borderColor: '#000000',
      primarySize: 40,
      primaryWeight: 700,
      primaryUppercase: false,
      secondarySize: 21,
      secondaryWeight: 600,
      secondaryUppercase: false,
      animStyle: 'bouncy-rise',
      animSpeed: 1
    },
    {
      id: makeId(),
      kind: 'synthe',
      primaryText: 'Éléa Fontaine',
      secondaryText: 'Étudiante BUT MMI 3 • Création Numérique',
      tagText: '',
      icon: 'fa-solid fa-bolt',
      mode: 'auto',
      duration: 5.5,
      layout: 'capsule',
      align: 'left',
      posX: 96,
      posY: 84,
      scale: 1,
      borderRadius: 28,
      paddingX: 26,
      paddingY: 13,
      accentWidth: 6,
      borderWidth: 0,
      primaryBg: '#000000',
      primaryColor: '#FFFFFF',
      secondaryBg: '#FFFFFF',
      secondaryColor: '#000000',
      accentColor: '#FAB001',
      iconBg: '#FAB001',
      iconColor: '#000000',
      tagBg: '#FAB001',
      tagColor: '#000000',
      borderColor: '#FAB001',
      primarySize: 40,
      primaryWeight: 700,
      primaryUppercase: false,
      secondarySize: 21,
      secondaryWeight: 600,
      secondaryUppercase: false,
      animStyle: 'spring-cascade',
      animSpeed: 1
    },
    {
      id: makeId(),
      kind: 'titre',
      primaryText: 'Les coulisses de la WebTV',
      secondaryText: 'SÉQUENCE 01',
      tagText: '',
      icon: 'fa-solid fa-clapperboard',
      mode: 'auto',
      duration: 5,
      layout: 'minimal',
      align: 'center',
      posX: 0,
      posY: 60,
      scale: 1,
      borderRadius: 10,
      paddingX: 26,
      paddingY: 12,
      accentWidth: 5,
      borderWidth: 0,
      primaryBg: '#404040',
      primaryColor: '#FFFFFF',
      secondaryBg: '#FAB001',
      secondaryColor: '#000000',
      accentColor: '#FAB001',
      iconBg: '#FAB001',
      iconColor: '#000000',
      tagBg: '#FAB001',
      tagColor: '#000000',
      borderColor: '#000000',
      primarySize: 27,
      primaryWeight: 600,
      primaryUppercase: false,
      secondarySize: 15,
      secondaryWeight: 700,
      secondaryUppercase: true,
      animStyle: 'elastic-wipe',
      animSpeed: 1
    },
    {
      id: makeId(),
      kind: 'titre',
      primaryText: 'Débat : L’audiovisuel en direct',
      secondaryText: '',
      tagText: '',
      icon: 'fa-solid fa-tower-broadcast',
      mode: 'manual',
      duration: 6,
      layout: 'minimal',
      align: 'center',
      posX: 0,
      posY: 60,
      scale: 1,
      borderRadius: 99,
      paddingX: 28,
      paddingY: 12,
      accentWidth: 5,
      borderWidth: 0,
      primaryBg: '#FFFFFF',
      primaryColor: '#000000',
      secondaryBg: '#404040',
      secondaryColor: '#FFFFFF',
      accentColor: '#FAB001',
      iconBg: '#FAB001',
      iconColor: '#000000',
      tagBg: '#000000',
      tagColor: '#FAB001',
      borderColor: '#000000',
      primarySize: 26,
      primaryWeight: 700,
      primaryUppercase: false,
      secondarySize: 15,
      secondaryWeight: 600,
      secondaryUppercase: true,
      animStyle: 'bouncy-rise',
      animSpeed: 1
    }
  ];
}

function normalizeAsset(raw = {}) {
  const kind = raw.kind === 'titre' ? 'titre' : 'synthe';
  const isTitre = kind === 'titre';
  const validWeights = [300, 400, 500, 600, 700];
  const pWeight = validWeights.includes(Number(raw.primaryWeight))
    ? Number(raw.primaryWeight)
    : (isTitre ? 600 : 700);
  const sWeight = validWeights.includes(Number(raw.secondaryWeight))
    ? Number(raw.secondaryWeight)
    : 600;

  return {
    id: typeof raw.id === 'string' && raw.id.trim() ? raw.id.trim() : makeId(),
    kind,
    primaryText: typeof raw.primaryText === 'string' ? raw.primaryText : 'Sans titre',
    secondaryText: typeof raw.secondaryText === 'string' ? raw.secondaryText : '',
    tagText: typeof raw.tagText === 'string' ? raw.tagText : '',
    icon: typeof raw.icon === 'string' ? raw.icon.trim() : '',
    mode: raw.mode === 'manual' ? 'manual' : 'auto',
    duration: clampNumber(raw.duration, 1, 120, isTitre ? 5 : 6),
    layout: ['layered', 'split', 'capsule', 'minimal'].includes(raw.layout)
      ? raw.layout
      : (isTitre ? 'minimal' : 'layered'),
    align: ['left', 'center', 'right'].includes(raw.align)
      ? raw.align
      : (isTitre ? 'center' : 'left'),
    posX: clampNumber(raw.posX, -600, 800, isTitre ? 0 : 96),
    posY: clampNumber(raw.posY, 0, 500, isTitre ? 58 : 84),
    scale: clampNumber(raw.scale, 0.5, 2, 1),
    borderRadius: clampNumber(raw.borderRadius, 0, 100, isTitre ? 10 : 10),
    paddingX: clampNumber(raw.paddingX, 8, 64, isTitre ? 24 : 26),
    paddingY: clampNumber(raw.paddingY, 4, 40, isTitre ? 11 : 14),
    accentWidth: clampNumber(raw.accentWidth, 0, 24, isTitre ? 5 : 8),
    borderWidth: clampNumber(raw.borderWidth, 0, 8, 0),
    primaryBg: typeof raw.primaryBg === 'string' && raw.primaryBg ? raw.primaryBg : '#FFFFFF',
    primaryColor: typeof raw.primaryColor === 'string' && raw.primaryColor ? raw.primaryColor : '#000000',
    secondaryBg: typeof raw.secondaryBg === 'string' && raw.secondaryBg ? raw.secondaryBg : '#FAB001',
    secondaryColor: typeof raw.secondaryColor === 'string' && raw.secondaryColor ? raw.secondaryColor : '#000000',
    accentColor: typeof raw.accentColor === 'string' && raw.accentColor ? raw.accentColor : '#FAB001',
    iconBg: typeof raw.iconBg === 'string' && raw.iconBg ? raw.iconBg : '#404040',
    iconColor: typeof raw.iconColor === 'string' && raw.iconColor ? raw.iconColor : '#FAB001',
    tagBg: typeof raw.tagBg === 'string' && raw.tagBg ? raw.tagBg : '#000000',
    tagColor: typeof raw.tagColor === 'string' && raw.tagColor ? raw.tagColor : '#FAB001',
    borderColor: typeof raw.borderColor === 'string' && raw.borderColor ? raw.borderColor : '#000000',
    primarySize: clampNumber(raw.primarySize, 14, 72, isTitre ? 23 : 36),
    primaryWeight: pWeight,
    primaryUppercase: Boolean(raw.primaryUppercase),
    secondarySize: clampNumber(raw.secondarySize, 11, 48, isTitre ? 14 : 19),
    secondaryWeight: sWeight,
    secondaryUppercase: Boolean(raw.secondaryUppercase),
    animStyle: ['bouncy-rise', 'elastic-wipe', 'spring-cascade'].includes(raw.animStyle)
      ? raw.animStyle
      : 'bouncy-rise',
    animSpeed: clampNumber(raw.animSpeed, 0.5, 2, 1)
  };
}

function loadStore() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(STORE_PATH)) {
      const initial = { assets: getDefaultPresets() };
      saveStore(initial);
      return initial;
    }
    const raw = JSON.parse(fs.readFileSync(STORE_PATH, 'utf8'));
    const assets = Array.isArray(raw.assets) ? raw.assets.map(normalizeAsset) : getDefaultPresets();
    return { assets };
  } catch (err) {
    console.error('Store read error, initializing defaults:', err.message);
    return { assets: getDefaultPresets() };
  }
}

function saveStore(storeData) {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  const tmpPath = STORE_PATH + '.tmp';
  fs.writeFileSync(tmpPath, JSON.stringify(storeData, null, 2), 'utf8');
  fs.renameSync(tmpPath, STORE_PATH);
}

function getLanAddresses() {
  const interfaces = os.networkInterfaces();
  const ips = [];
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name] || []) {
      if (iface.family === 'IPv4' && !iface.internal) {
        ips.push({ name, address: iface.address });
      }
    }
  }
  return ips;
}

const store = loadStore();

const app = express();
const server = http.createServer(app);
server.keepAliveTimeout = 65000;
server.headersTimeout = 66000;

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

io.engine.on('headers', (headers) => {
  headers['Access-Control-Allow-Private-Network'] = 'true';
});

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Private-Network', 'true');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

app.use(express.json({ limit: '2mb' }));

// Local offline-ready vendor mounts
app.use('/vendor/quicksand', express.static(path.join(__dirname, 'node_modules/@fontsource/quicksand')));
app.use('/vendor/fontawesome', express.static(path.join(__dirname, 'node_modules/@fortawesome/fontawesome-free')));
app.use('/vendor/gsap', express.static(path.join(__dirname, 'node_modules/gsap/dist')));
app.use(express.static(path.join(__dirname, 'public')));

app.get(['/', '/control'], (_req, res) => {
  res.sendFile(path.join(__dirname, 'public/control.html'));
});

app.get('/overlay', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public/overlay.html'));
});

app.get('/api/info', (_req, res) => {
  const ips = getLanAddresses();
  res.json({
    port: PORT,
    ips,
    serverNow: Date.now(),
    overlayClients: countClientsByRole('overlay'),
    controlClients: countClientsByRole('control'),
    streamdeckClients: countClientsByRole('streamdeck')
  });
});

app.get('/api/export', (_req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', 'attachment; filename="overlay-assets.json"');
  res.send(JSON.stringify({ assets: store.assets }, null, 2));
});

// =========================================================
// Broadcast State Machine — Strict Single-Asset Sequencing
// =========================================================
const airState = {
  phase: 'IDLE', // 'IDLE' | 'ENTERING' | 'ON_AIR' | 'EXITING'
  currentAsset: null,
  queuedAsset: null,
  transitionId: 0,
  startedAt: null,
  autoHideAt: null,
  autoDurationMs: null
};

let phaseTimer = null;
let autoTimer = null;

function clearTimers() {
  if (phaseTimer) {
    clearTimeout(phaseTimer);
    phaseTimer = null;
  }
  if (autoTimer) {
    clearTimeout(autoTimer);
    autoTimer = null;
  }
}

function publicAirState() {
  return {
    ...airState,
    serverNow: Date.now(),
    overlayClients: countClientsByRole('overlay'),
    controlClients: countClientsByRole('control'),
    streamdeckClients: countClientsByRole('streamdeck')
  };
}

function broadcastAirState() {
  io.emit('air:state', publicAirState());
}

function broadcastAssets() {
  io.emit('assets:list', store.assets);
}

function countClientsByRole(role) {
  let count = 0;
  for (const [, socket] of io.of('/').sockets) {
    if (socket.data?.role === role) count++;
  }
  return count;
}

function runEnter(asset) {
  clearTimers();
  const normalized = normalizeAsset(asset);
  const inMs = getAnimDuration(normalized, 'in');

  airState.phase = 'ENTERING';
  airState.currentAsset = normalized;
  airState.queuedAsset = null;
  airState.transitionId += 1;
  airState.startedAt = null;
  airState.autoHideAt = null;
  airState.autoDurationMs = null;

  const tid = airState.transitionId;

  io.emit('overlay:cmd', {
    type: 'ANIMATE_IN',
    asset: normalized,
    transitionId: tid,
    durationMs: inMs
  });
  broadcastAirState();

  phaseTimer = setTimeout(() => {
    phaseTimer = null;
    if (airState.transitionId !== tid) return;

    airState.phase = 'ON_AIR';
    airState.startedAt = Date.now();

    if (normalized.mode === 'auto') {
      const holdMs = Math.round(normalized.duration * 1000);
      airState.autoDurationMs = holdMs;
      airState.autoHideAt = airState.startedAt + holdMs;
      autoTimer = setTimeout(() => {
        autoTimer = null;
        triggerOut();
      }, holdMs);
    } else {
      airState.autoDurationMs = null;
      airState.autoHideAt = null;
    }

    broadcastAirState();
  }, inMs);
}

function triggerTake(rawAsset, overrideMode) {
  if (!rawAsset) return;
  const incoming = normalizeAsset({
    ...rawAsset,
    mode: overrideMode === 'auto' || overrideMode === 'manual' ? overrideMode : rawAsset.mode
  });

  // If nothing is visible, enter immediately
  if (airState.phase === 'IDLE' || !airState.currentAsset) {
    runEnter(incoming);
    return;
  }

  // If already exiting, simply update the queued asset that will enter once exit finishes
  if (airState.phase === 'EXITING') {
    airState.queuedAsset = incoming;
    broadcastAirState();
    return;
  }

  // Otherwise (ENTERING or ON_AIR): animate OUT current asset first, wait, then animate IN incoming
  clearTimers();
  const outMs = getAnimDuration(airState.currentAsset, 'out');
  airState.phase = 'EXITING';
  airState.queuedAsset = incoming;
  airState.autoHideAt = null;
  airState.autoDurationMs = null;
  airState.transitionId += 1;

  const tid = airState.transitionId;

  io.emit('overlay:cmd', {
    type: 'ANIMATE_OUT',
    transitionId: tid,
    durationMs: outMs
  });
  broadcastAirState();

  phaseTimer = setTimeout(() => {
    phaseTimer = null;
    if (airState.transitionId !== tid) return;

    const next = airState.queuedAsset;
    airState.currentAsset = null;
    airState.queuedAsset = null;

    if (next) {
      runEnter(next);
    } else {
      airState.phase = 'IDLE';
      broadcastAirState();
    }
  }, outMs + SWITCH_GAP_MS);
}

function triggerOut() {
  if (airState.phase === 'IDLE' || !airState.currentAsset) {
    airState.queuedAsset = null;
    airState.phase = 'IDLE';
    broadcastAirState();
    return;
  }

  // If already exiting, cancel any queued asset so it finishes to IDLE
  if (airState.phase === 'EXITING') {
    airState.queuedAsset = null;
    broadcastAirState();
    return;
  }

  clearTimers();
  const outMs = getAnimDuration(airState.currentAsset, 'out');
  airState.phase = 'EXITING';
  airState.queuedAsset = null;
  airState.autoHideAt = null;
  airState.autoDurationMs = null;
  airState.transitionId += 1;

  const tid = airState.transitionId;

  io.emit('overlay:cmd', {
    type: 'ANIMATE_OUT',
    transitionId: tid,
    durationMs: outMs
  });
  broadcastAirState();

  phaseTimer = setTimeout(() => {
    phaseTimer = null;
    if (airState.transitionId !== tid) return;

    const next = airState.queuedAsset;
    airState.currentAsset = null;
    airState.queuedAsset = null;

    if (next) {
      runEnter(next);
    } else {
      airState.phase = 'IDLE';
      broadcastAirState();
    }
  }, outMs + SWITCH_GAP_MS);
}

function triggerCut() {
  clearTimers();
  airState.phase = 'IDLE';
  airState.currentAsset = null;
  airState.queuedAsset = null;
  airState.startedAt = null;
  airState.autoHideAt = null;
  airState.autoDurationMs = null;
  airState.transitionId += 1;

  io.emit('overlay:cmd', {
    type: 'CUT',
    transitionId: airState.transitionId
  });
  broadcastAirState();
}

function triggerHoldManual() {
  if (airState.phase === 'ON_AIR' && airState.currentAsset) {
    if (autoTimer) {
      clearTimeout(autoTimer);
      autoTimer = null;
    }
    airState.currentAsset.mode = 'manual';
    airState.autoHideAt = null;
    airState.autoDurationMs = null;
    broadcastAirState();
  }
}

// =========================================================
// Socket.IO Real-Time Protocol
// =========================================================
io.on('connection', (socket) => {
  const qRole = socket.handshake.query?.role;
  const role =
    qRole === 'overlay' ? 'overlay' : qRole === 'streamdeck' ? 'streamdeck' : 'control';
  socket.data.role = role;

  socket.emit('assets:list', store.assets);
  socket.emit('air:state', publicAirState());
  broadcastAirState();

  socket.on('air:take', (payload = {}) => {
    const targetAsset = payload.assetId
      ? store.assets.find((a) => a.id === payload.assetId) || payload.asset
      : payload.asset;
    triggerTake(targetAsset, payload.overrideMode);
  });

  socket.on('air:out', () => {
    triggerOut();
  });

  socket.on('air:cut', () => {
    triggerCut();
  });

  socket.on('air:hold', () => {
    triggerHoldManual();
  });

  socket.on('asset:save', (rawAsset, ack) => {
    const normalized = normalizeAsset(rawAsset);
    const idx = store.assets.findIndex((a) => a.id === normalized.id);
    if (idx >= 0) {
      store.assets[idx] = normalized;
    } else {
      store.assets.push(normalized);
    }
    saveStore(store);
    broadcastAssets();
    if (typeof ack === 'function') ack({ ok: true, asset: normalized });
  });

  socket.on('asset:duplicate', (sourceAssetOrId, ack) => {
    let base = null;
    let insertIdx = store.assets.length;

    if (typeof sourceAssetOrId === 'string') {
      const idx = store.assets.findIndex((a) => a.id === sourceAssetOrId);
      if (idx >= 0) {
        base = store.assets[idx];
        insertIdx = idx + 1;
      }
    } else if (sourceAssetOrId && typeof sourceAssetOrId === 'object') {
      base = sourceAssetOrId;
      const idx = store.assets.findIndex((a) => a.id === base.id);
      if (idx >= 0) insertIdx = idx + 1;
    }

    if (!base) {
      if (typeof ack === 'function') ack({ ok: false });
      return;
    }

    const copy = normalizeAsset({
      ...base,
      id: makeId(),
      primaryText: base.primaryText
    });
    store.assets.splice(insertIdx, 0, copy);
    saveStore(store);
    broadcastAssets();
    if (typeof ack === 'function') ack({ ok: true, asset: copy });
  });

  socket.on('asset:delete', (assetId, ack) => {
    const idx = store.assets.findIndex((a) => a.id === assetId);
    if (idx >= 0) {
      store.assets.splice(idx, 1);
      saveStore(store);
      broadcastAssets();
    }
    if (typeof ack === 'function') ack({ ok: true });
  });

  socket.on('asset:reorder', (orderedIds = [], ack) => {
    if (!Array.isArray(orderedIds)) return;
    const map = new Map(store.assets.map((a) => [a.id, a]));
    const next = [];
    for (const id of orderedIds) {
      if (map.has(id)) {
        next.push(map.get(id));
        map.delete(id);
      }
    }
    for (const remaining of map.values()) {
      next.push(remaining);
    }
    store.assets = next;
    saveStore(store);
    broadcastAssets();
    if (typeof ack === 'function') ack({ ok: true });
  });

  socket.on('asset:applyStyle', ({ styleAsset, scope = 'kind' } = {}, ack) => {
    if (!styleAsset) return;
    const s = normalizeAsset(styleAsset);
    const styleKeys = [
      'layout', 'align', 'posX', 'posY', 'scale',
      'borderRadius', 'paddingX', 'paddingY', 'accentWidth', 'borderWidth',
      'primaryBg', 'primaryColor', 'secondaryBg', 'secondaryColor',
      'accentColor', 'iconBg', 'iconColor', 'tagBg', 'tagColor', 'borderColor',
      'primarySize', 'primaryWeight', 'primaryUppercase',
      'secondarySize', 'secondaryWeight', 'secondaryUppercase',
      'animStyle', 'animSpeed'
    ];

    store.assets = store.assets.map((item) => {
      if (scope === 'kind' && item.kind !== s.kind) return item;
      const updated = { ...item };
      for (const k of styleKeys) {
        updated[k] = s[k];
      }
      return normalizeAsset(updated);
    });

    saveStore(store);
    broadcastAssets();
    if (typeof ack === 'function') ack({ ok: true });
  });

  socket.on('store:import', (payload = {}, ack) => {
    if (!Array.isArray(payload.assets)) {
      if (typeof ack === 'function') ack({ ok: false });
      return;
    }
    store.assets = payload.assets.map(normalizeAsset);
    saveStore(store);
    broadcastAssets();
    if (typeof ack === 'function') ack({ ok: true, count: store.assets.length });
  });

  socket.on('disconnect', () => {
    broadcastAirState();
  });
});

server.listen({ port: PORT, host: '::', ipv6Only: false }, () => {
  const ips = getLanAddresses();
  const hostLocal = os.hostname().replace(/\.local$/i, '') + '.local';
  console.log('\n======================================================');
  console.log('  OVERLAY BROADCAST SYSTEM — PRÊT');
  console.log('======================================================');
  console.log(`  Local Contrôle : http://localhost:${PORT}/control`);
  console.log(`  Local Overlay  : http://localhost:${PORT}/overlay`);
  console.log(`  Bonjour (.local): http://${hostLocal}:${PORT}/control`);
  for (const ip of ips) {
    console.log(`  LAN Contrôle   : http://${ip.address}:${PORT}/control  (${ip.name})`);
    console.log(`  LAN Overlay    : http://${ip.address}:${PORT}/overlay  (${ip.name})`);
  }
  console.log('======================================================\n');
});
