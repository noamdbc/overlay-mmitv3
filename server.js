const express = require('express');
const http = require('http');
const https = require('https');
const path = require('path');
const fs = require('fs');
const os = require('os');
const crypto = require('crypto');
const { Server } = require('socket.io');

const pkgJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'));
const APP_VERSION = String(pkgJson.version || '1.0.0').trim();
const GITHUB_REPO = process.env.GITHUB_REPO || pkgJson.githubRepo || 'noamdbc/overlay-mmitv3';

const PORT = Number(process.env.PORT) || 3000;
const HOST = '0.0.0.0';

const BUNDLED_DATA_DIR = path.join(__dirname, 'data');
const DATA_DIR = process.env.OVERLAY_USER_DATA_DIR
  ? path.join(process.env.OVERLAY_USER_DATA_DIR, 'data')
  : BUNDLED_DATA_DIR;
const STORE_PATH = path.join(DATA_DIR, 'store.json');

// Seed user data store from bundled store.json on first run in packaged Electron app
if (DATA_DIR !== BUNDLED_DATA_DIR && !fs.existsSync(STORE_PATH)) {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    const bundledStore = path.join(BUNDLED_DATA_DIR, 'store.json');
    if (fs.existsSync(bundledStore)) {
      fs.copyFileSync(bundledStore, STORE_PATH);
    }
  } catch (_e) {
    // Ignore seed error, loadStore will create defaults
  }
}

function resolveStreamDeckPluginFile() {
  const candidates = [
    process.resourcesPath
      ? path.join(process.resourcesPath, 'streamdeck-plugin', 'fr.mmitv.overlay.streamDeckPlugin')
      : null,
    path.join(__dirname, 'streamdeck-plugin', 'dist', 'fr.mmitv.overlay.streamDeckPlugin')
  ].filter(Boolean);

  for (const p of candidates) {
    if (fs.existsSync(p)) return p;
  }
  return candidates[candidates.length - 1];
}

// Exact durations (ms) shared with public/shared/renderer.js
const ANIM_TIMINGS = {
  'bouncy-rise': { in: 760, out: 460 },
  'elastic-wipe': { in: 820, out: 480 },
  'spring-cascade': { in: 860, out: 480 },
  'origami-unfold': { in: 840, out: 480 },
  'kinetic-slide': { in: 720, out: 440 },
  'shutter-reveal': { in: 780, out: 460 },
  'pop-elastic': { in: 820, out: 450 },
  'wave-stagger': { in: 880, out: 480 },
  'glitch-snap': { in: 640, out: 380 },
  'velvet-glide': { in: 920, out: 520 },
  'festive-sparkle': { in: 940, out: 500 },
  'snow-bounce': { in: 900, out: 480 },
  'whip-skew': { in: 700, out: 420 },
  'flip-3d': { in: 840, out: 460 }
};
const SWITCH_GAP_MS = 110;

const VALID_LAYOUTS = [
  'layered',
  'split',
  'capsule',
  'minimal',
  'editorial',
  'brutalist',
  'ribbon',
  'floating',
  'frame',
  'banner',
  'badge-card',
  'ticket'
];

const VALID_FONTS = [
  'Quicksand',
  'Montserrat',
  'Poppins',
  'Inter',
  'Raleway',
  'Nunito',
  'Space Grotesk',
  'Oswald',
  'Bebas Neue',
  'Anton',
  'Archivo Black',
  'Righteous',
  'Playfair Display',
  'Cinzel',
  'DM Serif Display',
  'Abril Fatface',
  'Roboto Slab',
  'Mountains of Christmas',
  'Great Vibes',
  'Dancing Script',
  'Pacifico',
  'Lobster',
  'Caveat',
  'Permanent Marker',
  'Fredoka',
  'Baloo 2',
  'Luckiest Guy',
  'Bangers',
  'Creepster',
  'Henny Penny',
  'JetBrains Mono',
  'Press Start 2P'
];

const VALID_DECORS = [
  'none',
  'christmas',
  'christmas-hat',
  'snowflakes',
  'newyear',
  'halloween',
  'valentines',
  'easter',
  'summer',
  'confetti',
  'trophy',
  'music',
  'retro',
  'campus',
  'fire'
];

const VALID_PATTERNS = [
  'none',
  'stripes',
  'dots',
  'grid',
  'snow',
  'stars',
  'checker',
  'candy',
  'waves',
  'chevron'
];

const VALID_DIRECTIONS = ['bottom', 'left', 'right', 'top', 'scale'];

function getAnimDuration(asset, direction) {
  const style = ANIM_TIMINGS[asset?.animStyle] ? asset.animStyle : 'bouncy-rise';
  const speed = clampNumber(asset?.animSpeed, 0.4, 2.2, 1);
  return Math.round(ANIM_TIMINGS[style][direction] * speed);
}

function clampNumber(val, min, max, fallback) {
  const n = Number(val);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

function makeId(prefix = 'ast_') {
  return prefix + crypto.randomBytes(5).toString('hex');
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
      shadowOffset: 0,
      shadowColor: '#000000',
      skewX: 0,
      gap: 6,
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
      decor: 'none',
      decorColor: '#FAB001',
      pattern: 'none',
      patternOpacity: 0.16,
      primaryFont: 'Quicksand',
      primarySize: 42,
      primaryWeight: 700,
      primaryUppercase: false,
      primaryItalic: false,
      primaryLetterSpacing: -1,
      secondaryFont: 'Quicksand',
      secondarySize: 22,
      secondaryWeight: 600,
      secondaryUppercase: false,
      secondaryItalic: false,
      secondaryLetterSpacing: 1,
      animStyle: 'bouncy-rise',
      animSpeed: 1,
      animBounce: 1,
      animDirection: 'bottom'
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
      shadowOffset: 0,
      shadowColor: '#000000',
      skewX: 0,
      gap: 6,
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
      decor: 'none',
      decorColor: '#FAB001',
      pattern: 'none',
      patternOpacity: 0.16,
      primaryFont: 'Quicksand',
      primarySize: 40,
      primaryWeight: 700,
      primaryUppercase: false,
      primaryItalic: false,
      primaryLetterSpacing: -1,
      secondaryFont: 'Quicksand',
      secondarySize: 21,
      secondaryWeight: 600,
      secondaryUppercase: false,
      secondaryItalic: false,
      secondaryLetterSpacing: 1,
      animStyle: 'bouncy-rise',
      animSpeed: 1,
      animBounce: 1,
      animDirection: 'bottom'
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
      shadowOffset: 0,
      shadowColor: '#000000',
      skewX: 0,
      gap: 6,
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
      decor: 'none',
      decorColor: '#FAB001',
      pattern: 'none',
      patternOpacity: 0.16,
      primaryFont: 'Quicksand',
      primarySize: 40,
      primaryWeight: 700,
      primaryUppercase: false,
      primaryItalic: false,
      primaryLetterSpacing: -1,
      secondaryFont: 'Quicksand',
      secondarySize: 21,
      secondaryWeight: 600,
      secondaryUppercase: false,
      secondaryItalic: false,
      secondaryLetterSpacing: 1,
      animStyle: 'spring-cascade',
      animSpeed: 1,
      animBounce: 1,
      animDirection: 'bottom'
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
      shadowOffset: 0,
      shadowColor: '#000000',
      skewX: 0,
      gap: 6,
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
      decor: 'none',
      decorColor: '#FAB001',
      pattern: 'none',
      patternOpacity: 0.16,
      primaryFont: 'Quicksand',
      primarySize: 27,
      primaryWeight: 600,
      primaryUppercase: false,
      primaryItalic: false,
      primaryLetterSpacing: 0,
      secondaryFont: 'Quicksand',
      secondarySize: 15,
      secondaryWeight: 700,
      secondaryUppercase: true,
      secondaryItalic: false,
      secondaryLetterSpacing: 6,
      animStyle: 'elastic-wipe',
      animSpeed: 1,
      animBounce: 1,
      animDirection: 'bottom'
    }
  ];
}

function normalizeAsset(raw = {}) {
  const kind = raw.kind === 'titre' ? 'titre' : 'synthe';
  const isTitre = kind === 'titre';
  const validWeights = [100, 200, 300, 400, 500, 600, 700, 800, 900];
  const pWeight = validWeights.includes(Number(raw.primaryWeight))
    ? Number(raw.primaryWeight)
    : (isTitre ? 600 : 700);
  const sWeight = validWeights.includes(Number(raw.secondaryWeight))
    ? Number(raw.secondaryWeight)
    : 600;

  return {
    id: typeof raw.id === 'string' && raw.id.trim() ? raw.id.trim() : makeId(),
    folderId: typeof raw.folderId === 'string' && raw.folderId.trim() ? raw.folderId.trim() : null,
    kind,
    primaryText: typeof raw.primaryText === 'string' ? raw.primaryText : 'Sans titre',
    secondaryText: typeof raw.secondaryText === 'string' ? raw.secondaryText : '',
    tagText: typeof raw.tagText === 'string' ? raw.tagText : '',
    icon: typeof raw.icon === 'string' ? raw.icon.trim() : '',
    mode: raw.mode === 'manual' ? 'manual' : 'auto',
    duration: clampNumber(raw.duration, 1, 120, isTitre ? 5 : 6),
    layout: VALID_LAYOUTS.includes(raw.layout)
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
    borderWidth: clampNumber(raw.borderWidth, 0, 10, 0),
    shadowOffset: clampNumber(raw.shadowOffset, 0, 20, 0),
    shadowColor: typeof raw.shadowColor === 'string' && raw.shadowColor ? raw.shadowColor : '#000000',
    skewX: clampNumber(raw.skewX, -18, 18, 0),
    gap: clampNumber(raw.gap, 0, 28, 6),
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
    decor: VALID_DECORS.includes(raw.decor) ? raw.decor : 'none',
    decorColor: typeof raw.decorColor === 'string' && raw.decorColor ? raw.decorColor : '#FAB001',
    pattern: VALID_PATTERNS.includes(raw.pattern) ? raw.pattern : 'none',
    patternOpacity: clampNumber(raw.patternOpacity, 0.04, 0.6, 0.16),
    primaryFont: VALID_FONTS.includes(raw.primaryFont) ? raw.primaryFont : 'Quicksand',
    primarySize: clampNumber(raw.primarySize, 12, 84, isTitre ? 25 : 38),
    primaryWeight: pWeight,
    primaryUppercase: Boolean(raw.primaryUppercase),
    primaryItalic: Boolean(raw.primaryItalic),
    primaryLetterSpacing: clampNumber(raw.primaryLetterSpacing, -6, 30, raw.primaryUppercase ? 4 : -1),
    secondaryFont: VALID_FONTS.includes(raw.secondaryFont) ? raw.secondaryFont : 'Quicksand',
    secondarySize: clampNumber(raw.secondarySize, 10, 52, isTitre ? 14 : 20),
    secondaryWeight: sWeight,
    secondaryUppercase: Boolean(raw.secondaryUppercase),
    secondaryItalic: Boolean(raw.secondaryItalic),
    secondaryLetterSpacing: clampNumber(raw.secondaryLetterSpacing, -6, 35, raw.secondaryUppercase ? 6 : 1),
    animStyle: ANIM_TIMINGS[raw.animStyle] ? raw.animStyle : 'bouncy-rise',
    animSpeed: clampNumber(raw.animSpeed, 0.4, 2.2, 1),
    animBounce: clampNumber(raw.animBounce, 0.4, 2.4, 1),
    animDirection: VALID_DIRECTIONS.includes(raw.animDirection) ? raw.animDirection : 'bottom'
  };
}

function normalizeFolder(raw = {}, index = 0) {
  const id = typeof raw.id === 'string' && raw.id.trim() ? raw.id.trim() : makeId('fld_');
  const name =
    typeof raw.name === 'string' && raw.name.trim()
      ? raw.name.trim().slice(0, 50)
      : `Dossier ${index + 1}`;
  const color =
    typeof raw.color === 'string' && /^#[0-9A-Fa-f]{6}$/.test(raw.color)
      ? raw.color.toUpperCase()
      : '#FAB001';
  return {
    id,
    name,
    color,
    collapsed: Boolean(raw.collapsed)
  };
}

function normalizeRundownItem(raw = {}) {
  return {
    id: typeof raw.id === 'string' && raw.id.trim() ? raw.id.trim() : makeId('cue_'),
    assetId: typeof raw.assetId === 'string' ? raw.assetId.trim() : '',
    note: typeof raw.note === 'string' ? raw.note.trim().slice(0, 100) : ''
  };
}

function normalizeProfile(raw = {}, index = 0) {
  const id = typeof raw.id === 'string' && raw.id.trim() ? raw.id.trim() : makeId('prf_');
  const name =
    typeof raw.name === 'string' && raw.name.trim()
      ? raw.name.trim().slice(0, 60)
      : `Profil ${index + 1}`;
  const assets = Array.isArray(raw.assets) ? raw.assets.map(normalizeAsset) : [];
  const folders = Array.isArray(raw.folders) ? raw.folders.map((f, i) => normalizeFolder(f, i)) : [];
  const rundown = Array.isArray(raw.rundown) ? raw.rundown.map(normalizeRundownItem) : [];
  return {
    id,
    name,
    updatedAt: Number(raw.updatedAt) || Date.now(),
    folders,
    assets,
    rundown
  };
}

function loadStore() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(STORE_PATH)) {
      const defProfile = {
        id: 'prf_default',
        name: 'Profil Principal',
        updatedAt: Date.now(),
        folders: [],
        assets: getDefaultPresets(),
        rundown: []
      };
      const initial = {
        activeProfileId: defProfile.id,
        profiles: [defProfile]
      };
      saveStore(initial);
      return initial;
    }

    const raw = JSON.parse(fs.readFileSync(STORE_PATH, 'utf8'));

    // Multi-profile store format
    if (Array.isArray(raw.profiles) && raw.profiles.length > 0) {
      const profiles = raw.profiles.map((p, idx) => normalizeProfile(p, idx));
      const activeExists = profiles.some((p) => p.id === raw.activeProfileId);
      const activeProfileId = activeExists ? raw.activeProfileId : profiles[0].id;
      return { activeProfileId, profiles };
    }

    // Legacy single-list format migration -> preserve existing assets in "Profil Principal"
    const legacyAssets = Array.isArray(raw.assets) ? raw.assets.map(normalizeAsset) : getDefaultPresets();
    const migratedProfile = {
      id: 'prf_default',
      name: 'Profil Principal',
      updatedAt: Date.now(),
      assets: legacyAssets
    };
    const migrated = {
      activeProfileId: migratedProfile.id,
      profiles: [migratedProfile]
    };
    saveStore(migrated);
    return migrated;
  } catch (err) {
    console.error('Store read error, initializing defaults:', err.message);
    const defProfile = {
      id: 'prf_default',
      name: 'Profil Principal',
      updatedAt: Date.now(),
      folders: [],
      assets: getDefaultPresets(),
      rundown: []
    };
    return { activeProfileId: defProfile.id, profiles: [defProfile] };
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

const store = loadStore();

function getActiveProfile() {
  let found = store.profiles.find((p) => p.id === store.activeProfileId);
  if (!found) {
    found = store.profiles[0];
    store.activeProfileId = found.id;
  }
  return found;
}

function getActiveAssets() {
  return getActiveProfile().assets;
}

function setActiveAssets(nextAssets) {
  const prof = getActiveProfile();
  prof.assets = nextAssets;
  prof.updatedAt = Date.now();
}

function publicProfilesState() {
  const active = getActiveProfile();
  return {
    activeProfileId: active.id,
    profiles: store.profiles.map((p) => ({
      id: p.id,
      name: p.name,
      count: p.assets.length,
      updatedAt: p.updatedAt
    })),
    folders: active.folders || []
  };
}

// =========================================================
// Conducteur Runtime State (Rundown / Playlist / Cue System)
// =========================================================
const rundownRuntime = {
  currentIndex: -1,
  nextIndex: 0,
  activeCueId: null,
  state: 'READY' // 'READY' | 'ON_AIR' | 'EXITING' | 'OVERRIDDEN'
};

function publicRundownState() {
  const profile = getActiveProfile();
  const items = (profile.rundown || []).map((item, idx) => {
    const asset = findAssetAcrossProfiles(item.assetId);
    return {
      id: item.id,
      assetId: item.assetId,
      note: item.note || '',
      index: idx,
      asset: asset
        ? {
            id: asset.id,
            kind: asset.kind,
            layout: asset.layout,
            primaryText: asset.primaryText,
            secondaryText: asset.secondaryText,
            tagText: asset.tagText,
            mode: asset.mode,
            duration: asset.duration,
            icon: asset.icon,
            primaryBg: asset.primaryBg,
            primaryColor: asset.primaryColor,
            secondaryBg: asset.secondaryBg,
            secondaryColor: asset.secondaryColor,
            animStyle: asset.animStyle
          }
        : null
    };
  });

  const nextIndex =
    rundownRuntime.nextIndex >= 0 && rundownRuntime.nextIndex < items.length
      ? rundownRuntime.nextIndex
      : items.length > 0
      ? 0
      : -1;

  const currentIndex =
    rundownRuntime.currentIndex >= 0 && rundownRuntime.currentIndex < items.length
      ? rundownRuntime.currentIndex
      : -1;

  const currentCue = currentIndex >= 0 ? items[currentIndex] : null;
  const nextCue = nextIndex >= 0 ? items[nextIndex] : null;

  return {
    items,
    currentIndex,
    nextIndex,
    activeCueId: rundownRuntime.activeCueId,
    state: rundownRuntime.state,
    currentCue,
    nextCue
  };
}

function broadcastRundownState() {
  io.emit('rundown:state', publicRundownState());
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

// Build combined @font-face CSS from all installed @fontsource packages
let cachedFontsCss = null;
function getAllFontsCss() {
  if (cachedFontsCss) return cachedFontsCss;
  const fontsourceDir = path.join(__dirname, 'node_modules/@fontsource');
  const chunks = [];
  try {
    const pkgs = fs.readdirSync(fontsourceDir).sort();
    for (const pkg of pkgs) {
      const pkgDir = path.join(fontsourceDir, pkg);
      if (!fs.statSync(pkgDir).isDirectory()) continue;
      const cssFiles = fs
        .readdirSync(pkgDir)
        .filter((f) => /^\d00(-italic)?\.css$/.test(f))
        .sort();
      for (const file of cssFiles) {
        const rawCss = fs.readFileSync(path.join(pkgDir, file), 'utf8');
        const rewritten = rawCss.replace(/url\(\.\/files\//g, `url(/vendor/fonts/${pkg}/files/`);
        chunks.push(rewritten);
      }
    }
  } catch (err) {
    console.error('Font CSS bundle error:', err.message);
  }
  cachedFontsCss = chunks.join('\n');
  return cachedFontsCss;
}

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

app.use(express.json({ limit: '8mb' }));

// Dynamic all-fonts stylesheet (offline local @fontsource bundle)
app.get('/vendor/fonts/all-fonts.css', (_req, res) => {
  res.setHeader('Content-Type', 'text/css; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.send(getAllFontsCss());
});

// Local offline-ready vendor mounts
app.use('/vendor/fonts', express.static(path.join(__dirname, 'node_modules/@fontsource')));
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

function compareSemver(vA, vB) {
  const clean = (v) =>
    String(v || '0.0.0')
      .trim()
      .replace(/^v/i, '')
      .split('-')[0]
      .split('.')
      .map((n) => parseInt(n, 10) || 0);
  const a = clean(vA);
  const b = clean(vB);
  const len = Math.max(a.length, b.length, 3);
  for (let i = 0; i < len; i++) {
    const na = a[i] || 0;
    const nb = b[i] || 0;
    if (na > nb) return 1;
    if (na < nb) return -1;
  }
  return 0;
}

function checkGitHubRelease() {
  return new Promise((resolve) => {
    const req = https.get(
      `https://api.github.com/repos/${GITHUB_REPO}/releases/latest`,
      {
        headers: {
          'User-Agent': `OverlayRegie/${APP_VERSION}`,
          Accept: 'application/vnd.github+json'
        },
        timeout: 5500
      },
      (res) => {
        let body = '';
        res.on('data', (chunk) => {
          body += chunk;
        });
        res.on('end', () => {
          if (res.statusCode === 404) {
            resolve({
              ok: true,
              noReleasesYet: true,
              currentVersion: APP_VERSION,
              latestVersion: APP_VERSION,
              hasUpdate: false,
              githubRepo: GITHUB_REPO,
              repoUrl: `https://github.com/${GITHUB_REPO}/releases`
            });
            return;
          }
          if (res.statusCode < 200 || res.statusCode >= 300) {
            resolve({
              ok: false,
              error: `Statut GitHub HTTP ${res.statusCode}`,
              currentVersion: APP_VERSION,
              githubRepo: GITHUB_REPO,
              repoUrl: `https://github.com/${GITHUB_REPO}/releases`
            });
            return;
          }
          try {
            const data = JSON.parse(body);
            const latestTag = String(data.tag_name || '').trim();
            const latestVersion = latestTag.replace(/^v/i, '') || APP_VERSION;
            const hasUpdate = compareSemver(latestVersion, APP_VERSION) > 0;
            const releaseAssets = Array.isArray(data.assets) ? data.assets : [];

            const findAssetUrl = (extRegex) => {
              const found = releaseAssets.find((a) => extRegex.test(String(a.name || '')));
              return found ? found.browser_download_url : null;
            };

            resolve({
              ok: true,
              currentVersion: APP_VERSION,
              latestVersion,
              hasUpdate,
              githubRepo: GITHUB_REPO,
              releaseName: data.name || `Release v${latestVersion}`,
              releaseNotes: data.body || '',
              releaseUrl: data.html_url || `https://github.com/${GITHUB_REPO}/releases`,
              publishedAt: data.published_at || null,
              assets: {
                exe: findAssetUrl(/\.exe$/i),
                dmg: findAssetUrl(/\.dmg$/i),
                streamdeck: findAssetUrl(/\.streamDeckPlugin$/i)
              }
            });
          } catch (_e) {
            resolve({
              ok: false,
              error: 'Réponse GitHub invalide',
              currentVersion: APP_VERSION,
              githubRepo: GITHUB_REPO
            });
          }
        });
      }
    );

    req.on('timeout', () => {
      req.destroy();
      resolve({
        ok: false,
        offline: true,
        error: 'Hors ligne ou délai dépassé',
        currentVersion: APP_VERSION,
        githubRepo: GITHUB_REPO
      });
    });

    req.on('error', () => {
      resolve({
        ok: false,
        offline: true,
        error: 'Impossible de joindre GitHub (mode hors-ligne)',
        currentVersion: APP_VERSION,
        githubRepo: GITHUB_REPO
      });
    });
  });
}

function downloadFileWithRedirects(url, destPath, onProgress, maxRedirects = 6) {
  return new Promise((resolve, reject) => {
    if (maxRedirects <= 0) {
      return reject(new Error('Trop de redirections HTTP'));
    }
    const req = https.get(
      url,
      {
        headers: {
          'User-Agent': `OverlayRegie/${APP_VERSION}`
        },
        timeout: 120000
      },
      (res) => {
        if (
          res.statusCode &&
          res.statusCode >= 300 &&
          res.statusCode < 400 &&
          res.headers.location
        ) {
          res.resume();
          return resolve(
            downloadFileWithRedirects(res.headers.location, destPath, onProgress, maxRedirects - 1)
          );
        }
        if (res.statusCode !== 200) {
          res.resume();
          return reject(new Error(`Statut téléchargement HTTP ${res.statusCode}`));
        }

        const totalBytes = parseInt(res.headers['content-length'] || '0', 10);
        let downloadedBytes = 0;
        const startTime = Date.now();
        let lastReport = 0;

        const fileStream = fs.createWriteStream(destPath);
        res.on('data', (chunk) => {
          downloadedBytes += chunk.length;
          const now = Date.now();
          if (typeof onProgress === 'function' && (now - lastReport > 120 || downloadedBytes === totalBytes)) {
            lastReport = now;
            const elapsedSec = Math.max(0.1, (now - startTime) / 1000);
            const speedBytesPerSec = downloadedBytes / elapsedSec;
            const percent = totalBytes > 0 ? Math.min(99, Math.round((downloadedBytes / totalBytes) * 100)) : 0;
            onProgress({
              downloadedBytes,
              totalBytes,
              percent,
              speedBytesPerSec
            });
          }
        });

        res.pipe(fileStream);
        fileStream.on('finish', () => {
          fileStream.close(() => {
            if (typeof onProgress === 'function') {
              onProgress({
                downloadedBytes,
                totalBytes,
                percent: 100,
                speedBytesPerSec: 0
              });
            }
            resolve(destPath);
          });
        });
        fileStream.on('error', (err) => {
          fs.rmSync(destPath, { force: true });
          reject(err);
        });
      }
    );
    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Délai dépassé lors du téléchargement'));
    });
  });
}

app.get('/api/info', (_req, res) => {
  const ips = getLanAddresses();
  const sdInfo = getStreamDeckStatus();
  res.json({
    version: APP_VERSION,
    githubRepo: GITHUB_REPO,
    port: PORT,
    ips,
    serverNow: Date.now(),
    isElectron: Boolean(process.versions && process.versions.electron),
    dataDir: DATA_DIR,
    overlayClients: countClientsByRole('overlay'),
    controlClients: countClientsByRole('control'),
    streamdeckClients: sdInfo.total,
    streamdeckCompatibleClients: sdInfo.compatible,
    streamdeckMismatchedVersions: sdInfo.mismatchedVersions
  });
});

app.get('/api/check-update', async (_req, res) => {
  const result = await checkGitHubRelease();
  res.json(result);
});

app.post('/api/install-update', async (_req, res) => {
  try {
    const release = await checkGitHubRelease();
    if (!release.ok) {
      return res.status(400).json({ ok: false, error: release.error || 'Release inaccessible' });
    }

    const { execFileSync, spawn } = require('child_process');
    const tmpDir = os.tmpdir();

    if (process.platform === 'darwin') {
      const dmgUrl = release.assets?.dmg;
      if (!dmgUrl) {
        return res.status(404).json({ ok: false, error: 'Aucun fichier .dmg trouvé dans la release' });
      }
      const dmgPath = path.join(tmpDir, `Overlay-Regie-v${release.latestVersion}.dmg`);
      const mountPoint = path.join(tmpDir, `overlay_regie_mnt_${Date.now()}`);

      await downloadFileWithRedirects(dmgUrl, dmgPath, (prog) => {
        const mbDown = (prog.downloadedBytes / 1048576).toFixed(1);
        const mbTot = (prog.totalBytes / 1048576).toFixed(1);
        const speedMb = (prog.speedBytesPerSec / 1048576).toFixed(1);
        io.emit('update:progress', {
          step: 'downloading',
          percent: prog.percent,
          downloadedBytes: prog.downloadedBytes,
          totalBytes: prog.totalBytes,
          speed: `${speedMb} Mo/s`,
          message: `Téléchargement : ${mbDown} / ${mbTot} Mo (${prog.percent}%) à ${speedMb} Mo/s`
        });
      });

      io.emit('update:progress', {
        step: 'installing',
        percent: 94,
        message: 'Vérification de l\'image disque et installation...'
      });

      try {
        execFileSync('xattr', ['-cr', dmgPath]);
      } catch (_e) {
        // ignore
      }

      fs.mkdirSync(mountPoint, { recursive: true });
      execFileSync('hdiutil', ['attach', dmgPath, '-nobrowse', '-readonly', '-mountpoint', mountPoint]);

      try {
        const mountedApp = path.join(mountPoint, 'Overlay Regie.app');
        const targetApp = '/Applications/Overlay Regie.app';
        if (fs.existsSync(mountedApp)) {
          fs.rmSync(targetApp, { recursive: true, force: true });
          execFileSync('cp', ['-R', mountedApp, targetApp]);
          try {
            execFileSync('xattr', ['-cr', targetApp]);
            execFileSync('codesign', ['--force', '--deep', '--sign', '-', targetApp]);
          } catch (_e) {
            // ignore
          }
        }
      } finally {
        try {
          execFileSync('hdiutil', ['detach', mountPoint, '-force']);
        } catch (_e) {
          // ignore
        }
        fs.rmSync(dmgPath, { force: true });
      }

      io.emit('update:progress', {
        step: 'ready',
        percent: 100,
        message: 'Mise à jour installée dans /Applications ! Redémarrage...'
      });

      res.json({
        ok: true,
        platform: 'darwin',
        installedVersion: release.latestVersion,
        message: 'Mise à jour installée dans /Applications/Overlay Regie.app. Redémarrage...'
      });

      setTimeout(() => {
        try {
          spawn('open', ['-n', '-a', '/Applications/Overlay Regie.app'], {
            detached: true,
            stdio: 'ignore'
          }).unref();
        } catch (_e) {
          // ignore
        }
        process.exit(0);
      }, 900);
      return;
    }

    if (process.platform === 'win32') {
      const exeUrl = release.assets?.exe;
      if (!exeUrl) {
        return res.status(404).json({ ok: false, error: 'Aucun fichier .exe trouvé dans la release' });
      }
      const exePath = path.join(tmpDir, `Overlay-Regie-Setup-v${release.latestVersion}.exe`);
      await downloadFileWithRedirects(exeUrl, exePath, (prog) => {
        const mbDown = (prog.downloadedBytes / 1048576).toFixed(1);
        const mbTot = (prog.totalBytes / 1048576).toFixed(1);
        const speedMb = (prog.speedBytesPerSec / 1048576).toFixed(1);
        io.emit('update:progress', {
          step: 'downloading',
          percent: prog.percent,
          downloadedBytes: prog.downloadedBytes,
          totalBytes: prog.totalBytes,
          speed: `${speedMb} Mo/s`,
          message: `Téléchargement : ${mbDown} / ${mbTot} Mo (${prog.percent}%) à ${speedMb} Mo/s`
        });
      });

      io.emit('update:progress', {
        step: 'ready',
        percent: 100,
        message: 'Installeur téléchargé ! Lancement de la mise à jour...'
      });

      res.json({
        ok: true,
        platform: 'win32',
        installedVersion: release.latestVersion,
        message: 'Installeur téléchargé. Lancement de la mise à jour...'
      });

      setTimeout(() => {
        try {
          spawn(exePath, [], { detached: true, stdio: 'ignore' }).unref();
        } catch (_e) {
          // ignore
        }
        process.exit(0);
      }, 900);
      return;
    }

    return res.status(400).json({ ok: false, error: 'Plateforme non supportée pour l\'installation auto' });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
});

app.get('/api/streamdeck-plugin', (_req, res) => {
  const filePath = resolveStreamDeckPluginFile();
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ ok: false, error: 'Fichier .streamDeckPlugin introuvable' });
  }
  const filename = `fr.mmitv.overlay-v${APP_VERSION}.streamDeckPlugin`;
  res.download(filePath, filename);
});

app.get('/api/export', (req, res) => {
  res.setHeader('Content-Type', 'application/json');

  if (req.query.all === '1') {
    res.setHeader('Content-Disposition', 'attachment; filename="overlay-tous-les-profils.json"');
    res.send(
      JSON.stringify(
        {
          type: 'overlay-multi-profiles',
          exportedAt: new Date().toISOString(),
          activeProfileId: store.activeProfileId,
          profiles: store.profiles
        },
        null,
        2
      )
    );
    return;
  }

  const targetId = req.query.profileId || store.activeProfileId;
  const prof = store.profiles.find((p) => p.id === targetId) || getActiveProfile();
  const slug =
    prof.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || 'profil';

  res.setHeader('Content-Disposition', `attachment; filename="profil-${slug}.json"`);
  res.send(
    JSON.stringify(
      {
        type: 'overlay-profile',
        name: prof.name,
        exportedAt: new Date().toISOString(),
        assets: prof.assets
      },
      null,
      2
    )
  );
});

// =========================================================
// Video Export Engine (.MOV with Alpha — ProRes 4444 / QTRLE)
// =========================================================
let exportVideoHandler = null;

function registerExportHandler(handler) {
  exportVideoHandler = handler;
}

function findFFmpegBinary() {
  const candidates = [
    process.env.FFMPEG_PATH,
    '/opt/homebrew/bin/ffmpeg',
    '/usr/local/bin/ffmpeg',
    '/usr/bin/ffmpeg',
    path.join(process.resourcesPath || '', 'bin', 'ffmpeg'),
    path.join(process.resourcesPath || '', 'bin', 'ffmpeg.exe'),
    'C:\\ffmpeg\\bin\\ffmpeg.exe'
  ];
  for (const c of candidates) {
    if (c && fs.existsSync(c)) return c;
  }
  try {
    const { execSync } = require('child_process');
    const cmd = process.platform === 'win32' ? 'where ffmpeg' : 'which ffmpeg';
    const out = execSync(cmd, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] }).trim().split('\n')[0];
    if (out && fs.existsSync(out)) return out;
  } catch (_e) {}
  return null;
}

app.get('/api/ffmpeg-status', (_req, res) => {
  const bin = findFFmpegBinary();
  res.json({
    available: Boolean(bin),
    path: bin,
    hasHandler: typeof exportVideoHandler === 'function'
  });
});

const exportJobs = new Map();

app.post('/api/export-video', async (req, res) => {
  const { asset, holdDuration = 3, fps = 50, codec = 'prores' } = req.body || {};
  if (!asset) {
    return res.status(400).json({ ok: false, error: 'Asset manquant' });
  }

  const ffmpegPath = findFFmpegBinary();
  if (!ffmpegPath) {
    return res.status(503).json({
      ok: false,
      error: 'FFmpeg est requis pour exporter en .MOV avec canal alpha. Veuillez installer FFmpeg (ex: brew install ffmpeg sur Mac, ou ffmpeg sous Windows).'
    });
  }

  if (typeof exportVideoHandler !== 'function') {
    return res.status(503).json({
      ok: false,
      error: 'Moteur de rendu d\'exportation indisponible. Utilisez l\'application bureau Electron.'
    });
  }

  const jobId = 'job_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
  exportJobs.set(jobId, {
    id: jobId,
    status: 'rendering',
    percent: 0,
    currentFrame: 0,
    totalFrames: 0,
    startedAt: Date.now()
  });

  res.json({ ok: true, jobId });

  (async () => {
    try {
      const result = await exportVideoHandler(
        asset,
        { holdDuration: Number(holdDuration) || 3, fps: Number(fps) || 50, codec },
        (prog) => {
          const job = exportJobs.get(jobId);
          if (job) {
            job.percent = prog.percent;
            job.currentFrame = prog.currentFrame;
            job.totalFrames = prog.totalFrames;
            job.totalDuration = prog.totalDuration;
          }
          io.emit('export:progress', { jobId, ...prog });
        }
      );

      const job = exportJobs.get(jobId);
      if (job) {
        job.status = 'done';
        job.percent = 100;
        job.outputPath = result.outputPath;
        job.filename = result.filename;
        job.sizeBytes = result.sizeBytes;
        job.downloadUrl = `/api/export-video/download/${jobId}`;
      }

      io.emit('export:done', {
        jobId,
        ok: true,
        downloadUrl: `/api/export-video/download/${jobId}`,
        filename: result.filename,
        outputPath: result.outputPath,
        sizeBytes: result.sizeBytes
      });
    } catch (err) {
      console.error('[Export Video] Erreur:', err.message);
      const job = exportJobs.get(jobId);
      if (job) {
        job.status = 'error';
        job.error = err.message;
      }
      io.emit('export:error', { jobId, ok: false, error: err.message });
    }
  })();
});

app.get('/api/export-video/status/:jobId', (req, res) => {
  const job = exportJobs.get(req.params.jobId);
  if (!job) {
    return res.status(404).json({ ok: false, error: 'Tâche d\'export introuvable' });
  }
  res.json({ ok: true, job });
});

app.get('/api/export-video/download/:jobId', (req, res) => {
  const job = exportJobs.get(req.params.jobId);
  if (!job || job.status !== 'done' || !job.outputPath || !fs.existsSync(job.outputPath)) {
    return res.status(404).send('Fichier introuvable ou export non terminé');
  }
  res.download(job.outputPath, job.filename);
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

function getStreamDeckStatus() {
  let total = 0;
  let compatible = 0;
  const mismatchedVersions = [];
  for (const [, socket] of io.of('/').sockets) {
    if (socket.data?.role === 'streamdeck') {
      total++;
      if (socket.data.compatible) {
        compatible++;
      } else {
        mismatchedVersions.push(socket.data.pluginVersion || 'inconnue');
      }
    }
  }
  return { total, compatible, mismatchedVersions };
}

function publicAirState() {
  const sdInfo = getStreamDeckStatus();
  return {
    ...airState,
    serverVersion: APP_VERSION,
    serverNow: Date.now(),
    overlayClients: countClientsByRole('overlay'),
    controlClients: countClientsByRole('control'),
    streamdeckClients: sdInfo.total,
    streamdeckCompatibleClients: sdInfo.compatible,
    streamdeckMismatchedVersions: sdInfo.mismatchedVersions
  };
}

function broadcastAirState() {
  io.emit('air:state', publicAirState());
}

function broadcastAssets() {
  io.emit('profiles:state', publicProfilesState());
  io.emit('assets:list', getActiveAssets());
  broadcastRundownState();
}

function triggerRundownNext() {
  const profile = getActiveProfile();
  const items = profile.rundown || [];
  if (items.length === 0) return;

  // Case 1: If current rundown cue is on air, pressing Next Cue initiates its exit
  if (airState.phase === 'ON_AIR' && rundownRuntime.activeCueId) {
    triggerOut();
    return;
  }

  // Case 2: During transitions, ignore duplicate triggers
  if (airState.phase === 'ENTERING' || airState.phase === 'EXITING') {
    return;
  }

  // Case 3: Off air or overriding asset -> take the next cue in line
  let targetIdx = rundownRuntime.nextIndex;
  if (targetIdx < 0 || targetIdx >= items.length) {
    targetIdx = 0;
  }

  const targetCue = items[targetIdx];
  if (!targetCue) return;

  const asset = findAssetAcrossProfiles(targetCue.assetId);
  if (!asset) return;

  rundownRuntime.currentIndex = targetIdx;
  rundownRuntime.activeCueId = targetCue.id;
  rundownRuntime.state = 'ON_AIR';

  triggerTake(asset);
  broadcastRundownState();
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

function findAssetAcrossProfiles(assetId) {
  const active = getActiveAssets().find((a) => a.id === assetId);
  if (active) return active;
  for (const prof of store.profiles) {
    const found = prof.assets.find((a) => a.id === assetId);
    if (found) return found;
  }
  return null;
}

function triggerTake(rawAsset, overrideMode) {
  if (!rawAsset) return;
  const incoming = normalizeAsset({
    ...rawAsset,
    mode: overrideMode === 'auto' || overrideMode === 'manual' ? overrideMode : rawAsset.mode
  });

  // Track if this asset is external to the active rundown cue
  if (rundownRuntime.activeCueId) {
    const activeCue = (getActiveProfile().rundown || []).find((c) => c.id === rundownRuntime.activeCueId);
    if (!activeCue || activeCue.assetId !== incoming.id) {
      rundownRuntime.activeCueId = null;
      rundownRuntime.state = 'OVERRIDDEN';
      broadcastRundownState();
    }
  }

  if (airState.phase === 'IDLE' || !airState.currentAsset) {
    runEnter(incoming);
    return;
  }

  if (airState.phase === 'EXITING') {
    airState.queuedAsset = incoming;
    broadcastAirState();
    return;
  }

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
      if (rundownRuntime.activeCueId) {
        rundownRuntime.activeCueId = null;
        const items = getActiveProfile().rundown || [];
        if (rundownRuntime.currentIndex + 1 < items.length) {
          rundownRuntime.nextIndex = rundownRuntime.currentIndex + 1;
        } else {
          rundownRuntime.nextIndex = -1;
        }
        rundownRuntime.state = rundownRuntime.nextIndex >= 0 ? 'READY' : 'IDLE';
        broadcastRundownState();
      } else if (rundownRuntime.state === 'OVERRIDDEN') {
        rundownRuntime.state = 'READY';
        broadcastRundownState();
      }
      broadcastAirState();
    }
  }, outMs + SWITCH_GAP_MS);
}

function triggerOut() {
  if (airState.phase === 'IDLE' || !airState.currentAsset) {
    airState.queuedAsset = null;
    airState.phase = 'IDLE';
    if (rundownRuntime.activeCueId) {
      rundownRuntime.activeCueId = null;
      const items = getActiveProfile().rundown || [];
      if (rundownRuntime.currentIndex + 1 < items.length) {
        rundownRuntime.nextIndex = rundownRuntime.currentIndex + 1;
      } else {
        rundownRuntime.nextIndex = -1;
      }
      rundownRuntime.state = rundownRuntime.nextIndex >= 0 ? 'READY' : 'IDLE';
      broadcastRundownState();
    } else if (rundownRuntime.state === 'OVERRIDDEN') {
      rundownRuntime.state = 'READY';
      broadcastRundownState();
    }
    broadcastAirState();
    return;
  }

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
      if (rundownRuntime.activeCueId) {
        rundownRuntime.activeCueId = null;
        const items = getActiveProfile().rundown || [];
        if (rundownRuntime.currentIndex + 1 < items.length) {
          rundownRuntime.nextIndex = rundownRuntime.currentIndex + 1;
        } else {
          rundownRuntime.nextIndex = -1;
        }
        rundownRuntime.state = rundownRuntime.nextIndex >= 0 ? 'READY' : 'IDLE';
        broadcastRundownState();
      } else if (rundownRuntime.state === 'OVERRIDDEN') {
        rundownRuntime.state = 'READY';
        broadcastRundownState();
      }
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

  if (rundownRuntime.activeCueId) {
    rundownRuntime.activeCueId = null;
    const items = getActiveProfile().rundown || [];
    if (rundownRuntime.currentIndex + 1 < items.length) {
      rundownRuntime.nextIndex = rundownRuntime.currentIndex + 1;
    } else {
      rundownRuntime.nextIndex = -1;
    }
    rundownRuntime.state = rundownRuntime.nextIndex >= 0 ? 'READY' : 'IDLE';
    broadcastRundownState();
  } else if (rundownRuntime.state === 'OVERRIDDEN') {
    rundownRuntime.state = 'READY';
    broadcastRundownState();
  }

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

  if (role === 'streamdeck') {
    const pluginVersion = String(socket.handshake.query?.pluginVersion || '').trim();
    const compatible = pluginVersion === APP_VERSION;
    socket.data.pluginVersion = pluginVersion || 'inconnue';
    socket.data.compatible = compatible;
    socket.emit('version:check', {
      serverVersion: APP_VERSION,
      pluginVersion: socket.data.pluginVersion,
      compatible
    });
  } else {
    socket.data.compatible = true;
  }

  socket.emit('profiles:state', publicProfilesState());
  socket.emit('assets:list', getActiveAssets());
  socket.emit('air:state', publicAirState());
  socket.emit('rundown:state', publicRundownState());
  broadcastAirState();

  socket.on('air:take', (payload = {}) => {
    if (socket.data.role === 'streamdeck' && !socket.data.compatible) return;
    const targetAsset = payload.assetId
      ? findAssetAcrossProfiles(payload.assetId) || payload.asset
      : payload.asset;
    triggerTake(targetAsset, payload.overrideMode);
  });

  socket.on('air:out', () => {
    if (socket.data.role === 'streamdeck' && !socket.data.compatible) return;
    triggerOut();
  });

  socket.on('air:cut', () => {
    if (socket.data.role === 'streamdeck' && !socket.data.compatible) return;
    triggerCut();
  });

  socket.on('air:hold', () => {
    if (socket.data.role === 'streamdeck' && !socket.data.compatible) return;
    triggerHoldManual();
  });

  // --- ASSETS IN ACTIVE PROFILE ---
  socket.on('asset:save', (rawAsset, ack) => {
    const normalized = normalizeAsset(rawAsset);
    const activeList = getActiveAssets();
    const idx = activeList.findIndex((a) => a.id === normalized.id);
    if (idx >= 0) {
      activeList[idx] = normalized;
    } else {
      activeList.push(normalized);
    }
    getActiveProfile().updatedAt = Date.now();
    saveStore(store);
    broadcastAssets();
    if (typeof ack === 'function') ack({ ok: true, asset: normalized });
  });

  socket.on('asset:duplicate', (sourceAssetOrId, ack) => {
    const activeList = getActiveAssets();
    let base = null;
    let insertIdx = activeList.length;

    if (typeof sourceAssetOrId === 'string') {
      const idx = activeList.findIndex((a) => a.id === sourceAssetOrId);
      if (idx >= 0) {
        base = activeList[idx];
        insertIdx = idx + 1;
      }
    } else if (sourceAssetOrId && typeof sourceAssetOrId === 'object') {
      base = sourceAssetOrId;
      const idx = activeList.findIndex((a) => a.id === base.id);
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
    activeList.splice(insertIdx, 0, copy);
    getActiveProfile().updatedAt = Date.now();
    saveStore(store);
    broadcastAssets();
    if (typeof ack === 'function') ack({ ok: true, asset: copy });
  });

  socket.on('asset:delete', (assetId, ack) => {
    const activeList = getActiveAssets();
    const idx = activeList.findIndex((a) => a.id === assetId);
    if (idx >= 0) {
      activeList.splice(idx, 1);
      getActiveProfile().updatedAt = Date.now();
      saveStore(store);
      broadcastAssets();
    }
    if (typeof ack === 'function') ack({ ok: true });
  });

  socket.on('asset:reorder', (orderedIds = [], ack) => {
    if (!Array.isArray(orderedIds)) return;
    const activeList = getActiveAssets();
    const map = new Map(activeList.map((a) => [a.id, a]));
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
    setActiveAssets(next);
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
      'shadowOffset', 'shadowColor', 'skewX', 'gap',
      'primaryBg', 'primaryColor', 'secondaryBg', 'secondaryColor',
      'accentColor', 'iconBg', 'iconColor', 'tagBg', 'tagColor', 'borderColor',
      'decor', 'decorColor', 'pattern', 'patternOpacity',
      'primaryFont', 'primarySize', 'primaryWeight', 'primaryUppercase', 'primaryItalic', 'primaryLetterSpacing',
      'secondaryFont', 'secondarySize', 'secondaryWeight', 'secondaryUppercase', 'secondaryItalic', 'secondaryLetterSpacing',
      'animStyle', 'animSpeed', 'animBounce', 'animDirection'
    ];

    const activeList = getActiveAssets();
    const next = activeList.map((item) => {
      if (scope === 'kind' && item.kind !== s.kind) return item;
      const updated = { ...item };
      for (const k of styleKeys) {
        updated[k] = s[k];
      }
      return normalizeAsset(updated);
    });

    setActiveAssets(next);
    saveStore(store);
    broadcastAssets();
    if (typeof ack === 'function') ack({ ok: true });
  });

  // --- MULTI-PROFILE MANAGEMENT ---
  socket.on('profile:switch', (profileId, ack) => {
    if (socket.data.role === 'streamdeck' && !socket.data.compatible) return;
    const found = store.profiles.find((p) => p.id === profileId);
    if (!found) {
      if (typeof ack === 'function') ack({ ok: false });
      return;
    }
    store.activeProfileId = found.id;
    saveStore(store);
    broadcastAssets();
    if (typeof ack === 'function') ack({ ok: true, profile: found });
  });

  socket.on('profile:create', ({ name, mode = 'presets', sourceProfileId } = {}, ack) => {
    const cleanName =
      typeof name === 'string' && name.trim()
        ? name.trim().slice(0, 60)
        : `Profil ${store.profiles.length + 1}`;

    let initialAssets = [];
    if (mode === 'duplicate') {
      const src =
        store.profiles.find((p) => p.id === (sourceProfileId || store.activeProfileId)) ||
        getActiveProfile();
      initialAssets = src.assets.map((a) => normalizeAsset({ ...a, id: makeId() }));
    } else if (mode === 'presets') {
      initialAssets = getDefaultPresets();
    } else {
      initialAssets = [];
    }

    const newProf = {
      id: makeId('prf_'),
      name: cleanName,
      updatedAt: Date.now(),
      assets: initialAssets
    };

    store.profiles.push(newProf);
    store.activeProfileId = newProf.id;
    saveStore(store);
    broadcastAssets();
    if (typeof ack === 'function') ack({ ok: true, profile: newProf });
  });

  socket.on('profile:rename', ({ profileId, name } = {}, ack) => {
    const target = store.profiles.find((p) => p.id === (profileId || store.activeProfileId));
    if (!target || typeof name !== 'string' || !name.trim()) {
      if (typeof ack === 'function') ack({ ok: false });
      return;
    }
    target.name = name.trim().slice(0, 60);
    target.updatedAt = Date.now();
    saveStore(store);
    broadcastAssets();
    if (typeof ack === 'function') ack({ ok: true, profile: target });
  });

  socket.on('profile:delete', (profileId, ack) => {
    if (store.profiles.length <= 1) {
      if (typeof ack === 'function') ack({ ok: false, error: 'Minimum 1 profil requis' });
      return;
    }
    const idx = store.profiles.findIndex((p) => p.id === profileId);
    if (idx < 0) {
      if (typeof ack === 'function') ack({ ok: false });
      return;
    }
    store.profiles.splice(idx, 1);
    if (store.activeProfileId === profileId) {
      store.activeProfileId = store.profiles[0].id;
    }
    saveStore(store);
    broadcastAssets();
    if (typeof ack === 'function') ack({ ok: true, activeProfileId: store.activeProfileId });
  });

  // Import 1 or multiple JSON files (as new saved profiles, or merge/replace into current profile)
  socket.on('profile:importMany', ({ files = [], importMode = 'new-profiles' } = {}, ack) => {
    if (!Array.isArray(files) || files.length === 0) {
      if (typeof ack === 'function') ack({ ok: false });
      return;
    }

    let createdProfiles = 0;
    let importedAssets = 0;
    let lastCreatedId = null;

    for (const fileItem of files) {
      const data = fileItem?.data;
      const fallbackName = String(fileItem?.fileName || 'Profil importé')
        .replace(/\.json$/i, '')
        .replace(/[-_]+/g, ' ')
        .trim();

      if (!data) continue;

      // Case 1: Full multi-profile archive { profiles: [...] }
      if (Array.isArray(data.profiles)) {
        for (const rawProf of data.profiles) {
          if (!rawProf || !Array.isArray(rawProf.assets)) continue;
          if (importMode === 'merge') {
            const activeList = getActiveAssets();
            for (const a of rawProf.assets) {
              activeList.push(normalizeAsset({ ...a, id: makeId() }));
              importedAssets++;
            }
          } else {
            const np = normalizeProfile(
              {
                id: makeId('prf_'),
                name: rawProf.name || fallbackName || 'Profil importé',
                assets: rawProf.assets.map((a) => normalizeAsset({ ...a, id: makeId() }))
              },
              store.profiles.length
            );
            store.profiles.push(np);
            lastCreatedId = np.id;
            createdProfiles++;
            importedAssets += np.assets.length;
          }
        }
        continue;
      }

      // Case 2: Single profile object { name?, assets: [...] } or raw array [...]
      const rawList = Array.isArray(data) ? data : Array.isArray(data.assets) ? data.assets : null;
      if (!rawList) continue;

      if (importMode === 'replace') {
        const normalized = rawList.map((a) => normalizeAsset(a));
        setActiveAssets(normalized);
        importedAssets += normalized.length;
      } else if (importMode === 'merge') {
        const activeList = getActiveAssets();
        for (const a of rawList) {
          activeList.push(normalizeAsset({ ...a, id: makeId() }));
          importedAssets++;
        }
        getActiveProfile().updatedAt = Date.now();
      } else {
        // Default 'new-profiles': save as a persistent new profile
        const profName =
          (typeof data.name === 'string' && data.name.trim()) ||
          fallbackName ||
          `Profil importé ${store.profiles.length + 1}`;
        const np = {
          id: makeId('prf_'),
          name: profName.slice(0, 60),
          updatedAt: Date.now(),
          assets: rawList.map((a) => normalizeAsset({ ...a, id: makeId() }))
        };
        store.profiles.push(np);
        lastCreatedId = np.id;
        createdProfiles++;
        importedAssets += np.assets.length;
      }
    }

    if (lastCreatedId && importMode === 'new-profiles') {
      store.activeProfileId = lastCreatedId;
    }

    saveStore(store);
    broadcastAssets();
    if (typeof ack === 'function') {
      ack({
        ok: true,
        createdProfiles,
        importedAssets,
        activeProfileId: store.activeProfileId
      });
    }
  });

  // Backwards-compatible store:import
  socket.on('store:import', (payload = {}, ack) => {
    if (!Array.isArray(payload.assets)) {
      if (typeof ack === 'function') ack({ ok: false });
      return;
    }
    const next = payload.assets.map(normalizeAsset);
    setActiveAssets(next);
    saveStore(store);
    broadcastAssets();
    if (typeof ack === 'function') ack({ ok: true, count: next.length });
  });

  // --- FOLDER MANAGEMENT ---
  socket.on('folder:create', ({ name, color } = {}, ack) => {
    const prof = getActiveProfile();
    prof.folders = prof.folders || [];
    const newFolder = normalizeFolder({
      name: name || `Dossier ${prof.folders.length + 1}`,
      color: color || '#FAB001'
    }, prof.folders.length);
    prof.folders.push(newFolder);
    prof.updatedAt = Date.now();
    saveStore(store);
    broadcastAssets();
    if (typeof ack === 'function') ack({ ok: true, folder: newFolder });
  });

  socket.on('folder:rename', ({ id, name, color } = {}, ack) => {
    const prof = getActiveProfile();
    const folder = (prof.folders || []).find((f) => f.id === id);
    if (folder) {
      if (typeof name === 'string' && name.trim()) folder.name = name.trim().slice(0, 50);
      if (typeof color === 'string' && /^#[0-9A-Fa-f]{6}$/.test(color)) folder.color = color.toUpperCase();
      prof.updatedAt = Date.now();
      saveStore(store);
      broadcastAssets();
    }
    if (typeof ack === 'function') ack({ ok: true, folder });
  });

  socket.on('folder:toggleCollapse', ({ id, collapsed } = {}, ack) => {
    const prof = getActiveProfile();
    const folder = (prof.folders || []).find((f) => f.id === id);
    if (folder) {
      folder.collapsed = typeof collapsed === 'boolean' ? collapsed : !folder.collapsed;
      prof.updatedAt = Date.now();
      saveStore(store);
      broadcastAssets();
    }
    if (typeof ack === 'function') ack({ ok: true, folder });
  });

  socket.on('folder:delete', ({ id, deleteAssets = false } = {}, ack) => {
    const prof = getActiveProfile();
    prof.folders = prof.folders || [];
    const idx = prof.folders.findIndex((f) => f.id === id);
    if (idx >= 0) {
      prof.folders.splice(idx, 1);
      if (deleteAssets) {
        prof.assets = prof.assets.filter((a) => a.folderId !== id);
      } else {
        prof.assets.forEach((a) => {
          if (a.folderId === id) a.folderId = null;
        });
      }
      prof.updatedAt = Date.now();
      saveStore(store);
      broadcastAssets();
    }
    if (typeof ack === 'function') ack({ ok: true });
  });

  socket.on('asset:moveToFolder', ({ assetId, folderId, targetIndex } = {}, ack) => {
    const activeList = getActiveAssets();
    const asset = activeList.find((a) => a.id === assetId);
    if (asset) {
      asset.folderId = folderId || null;
      if (typeof targetIndex === 'number' && targetIndex >= 0) {
        const curIdx = activeList.indexOf(asset);
        if (curIdx >= 0) {
          activeList.splice(curIdx, 1);
          activeList.splice(Math.min(activeList.length, targetIndex), 0, asset);
        }
      }
      getActiveProfile().updatedAt = Date.now();
      saveStore(store);
      broadcastAssets();
    }
    if (typeof ack === 'function') ack({ ok: true });
  });

  // --- CONDUCTEUR / RUNDOWN PLAYLIST ---
  socket.on('rundown:next', () => {
    if (socket.data.role === 'streamdeck' && !socket.data.compatible) return;
    triggerRundownNext();
  });

  socket.on('rundown:jump', ({ index, cueId } = {}, ack) => {
    if (socket.data.role === 'streamdeck' && !socket.data.compatible) return;
    const items = getActiveProfile().rundown || [];
    let targetIdx = -1;
    if (typeof index === 'number') {
      targetIdx = index;
    } else if (cueId) {
      targetIdx = items.findIndex((c) => c.id === cueId);
    }
    if (targetIdx >= 0 && targetIdx < items.length) {
      rundownRuntime.nextIndex = targetIdx;
      rundownRuntime.state = 'READY';
      broadcastRundownState();
    }
    if (typeof ack === 'function') ack({ ok: true, nextIndex: rundownRuntime.nextIndex });
  });

  socket.on('rundown:reset', (_payload, ack) => {
    if (socket.data.role === 'streamdeck' && !socket.data.compatible) return;
    rundownRuntime.currentIndex = -1;
    rundownRuntime.nextIndex = 0;
    rundownRuntime.activeCueId = null;
    rundownRuntime.state = 'READY';
    broadcastRundownState();
    if (typeof ack === 'function') ack({ ok: true });
  });

  socket.on('rundown:addItem', ({ assetId, note = '' } = {}, ack) => {
    if (!assetId) {
      if (typeof ack === 'function') ack({ ok: false });
      return;
    }
    const prof = getActiveProfile();
    prof.rundown = prof.rundown || [];
    const newItem = normalizeRundownItem({ assetId, note });
    prof.rundown.push(newItem);
    prof.updatedAt = Date.now();
    saveStore(store);
    broadcastRundownState();
    if (typeof ack === 'function') ack({ ok: true, item: newItem });
  });

  socket.on('rundown:addMany', ({ assetIds = [] } = {}, ack) => {
    if (!Array.isArray(assetIds) || assetIds.length === 0) {
      if (typeof ack === 'function') ack({ ok: false });
      return;
    }
    const prof = getActiveProfile();
    prof.rundown = prof.rundown || [];
    for (const assetId of assetIds) {
      prof.rundown.push(normalizeRundownItem({ assetId }));
    }
    prof.updatedAt = Date.now();
    saveStore(store);
    broadcastRundownState();
    if (typeof ack === 'function') ack({ ok: true, count: assetIds.length });
  });

  socket.on('rundown:removeItem', (cueId, ack) => {
    const prof = getActiveProfile();
    prof.rundown = prof.rundown || [];
    const idx = prof.rundown.findIndex((c) => c.id === cueId);
    if (idx >= 0) {
      prof.rundown.splice(idx, 1);
      if (rundownRuntime.nextIndex >= prof.rundown.length) {
        rundownRuntime.nextIndex = Math.max(0, prof.rundown.length - 1);
      }
      prof.updatedAt = Date.now();
      saveStore(store);
      broadcastRundownState();
    }
    if (typeof ack === 'function') ack({ ok: true });
  });

  socket.on('rundown:reorder', (orderedCueIds = [], ack) => {
    if (!Array.isArray(orderedCueIds)) return;
    const prof = getActiveProfile();
    prof.rundown = prof.rundown || [];
    const map = new Map(prof.rundown.map((c) => [c.id, c]));
    const next = [];
    for (const id of orderedCueIds) {
      if (map.has(id)) {
        next.push(map.get(id));
        map.delete(id);
      }
    }
    for (const rem of map.values()) {
      next.push(rem);
    }
    prof.rundown = next;
    prof.updatedAt = Date.now();
    saveStore(store);
    broadcastRundownState();
    if (typeof ack === 'function') ack({ ok: true });
  });

  socket.on('rundown:updateNote', ({ cueId, note } = {}, ack) => {
    const prof = getActiveProfile();
    const item = (prof.rundown || []).find((c) => c.id === cueId);
    if (item) {
      item.note = String(note || '').slice(0, 100);
      prof.updatedAt = Date.now();
      saveStore(store);
      broadcastRundownState();
    }
    if (typeof ack === 'function') ack({ ok: true });
  });

  socket.on('rundown:clear', (_payload, ack) => {
    const prof = getActiveProfile();
    prof.rundown = [];
    prof.updatedAt = Date.now();
    rundownRuntime.currentIndex = -1;
    rundownRuntime.nextIndex = 0;
    rundownRuntime.activeCueId = null;
    rundownRuntime.state = 'READY';
    saveStore(store);
    broadcastRundownState();
    if (typeof ack === 'function') ack({ ok: true });
  });

  socket.on('disconnect', () => {
    broadcastAirState();
  });
});

server.on('error', (err) => {
  if (err && err.code === 'EADDRINUSE') {
    console.log(`[Overlay Régie] Port ${PORT} déjà actif, réutilisation du serveur existant.`);
  } else {
    console.error('[Overlay Régie] Erreur serveur HTTP:', err);
  }
});

server.listen({ port: PORT, host: '::', ipv6Only: false }, () => {
  const ips = getLanAddresses();
  const hostLocal = os.hostname().replace(/\.local$/i, '') + '.local';
  console.log('\n======================================================');
  console.log(`  OVERLAY BROADCAST SYSTEM v${APP_VERSION} — PRÊT`);
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

module.exports = {
  app,
  server,
  io,
  PORT,
  APP_VERSION,
  GITHUB_REPO,
  DATA_DIR,
  STORE_PATH,
  resolveStreamDeckPluginFile,
  getLanAddresses,
  triggerOut,
  triggerCut,
  triggerHoldManual,
  getAirState: publicAirState,
  checkGitHubRelease,
  registerExportHandler,
  findFFmpegBinary,
  publicRundownState,
  triggerRundownNext
};
