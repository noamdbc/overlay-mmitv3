import { io } from 'socket.io-client';

const DEFAULT_SERVER_URL = 'http://localhost:3000';
const PLUGIN_VERSION = typeof __PLUGIN_VERSION__ !== 'undefined' ? __PLUGIN_VERSION__ : '1.0.0';

export class OverlayBridge {
  constructor() {
    this.serverUrl = DEFAULT_SERVER_URL;
    this.pluginVersion = PLUGIN_VERSION;
    this.serverVersion = null;
    this.versionMismatch = false;
    this.socket = null;
    this.connected = false;
    this.assets = [];
    this.profiles = [];
    this.activeProfileId = null;
    this.airState = {
      phase: 'IDLE',
      currentAsset: null,
      queuedAsset: null,
      autoHideAt: null,
      autoDurationMs: null
    };
    this.rundownState = {
      items: [],
      currentIndex: -1,
      nextIndex: 0,
      activeCueId: null,
      state: 'READY',
      currentCue: null,
      nextCue: null
    };
    this.clockOffsetMs = 0;
    this.tickInterval = null;

    this.stateListeners = new Set();
    this.tickListeners = new Set();
  }

  normalizeUrl(raw) {
    const trimmed = String(raw || '').trim().replace(/\/+$/, '');
    if (!trimmed) return DEFAULT_SERVER_URL;
    if (!/^https?:\/\//i.test(trimmed)) {
      return 'http://' + trimmed;
    }
    return trimmed;
  }

  connect(rawUrl) {
    const nextUrl = this.normalizeUrl(rawUrl || this.serverUrl);
    if (this.socket && this.serverUrl === nextUrl) {
      return;
    }

    this.serverUrl = nextUrl;

    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
    }

    this.connected = false;
    this.serverVersion = null;
    this.versionMismatch = false;
    this.stopTicker();
    this.notifyState();

    this.socket = io(this.serverUrl, {
      query: {
        role: 'streamdeck',
        pluginVersion: this.pluginVersion
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 500,
      reconnectionDelayMax: 2500,
      timeout: 4000
    });

    this.socket.on('connect', () => {
      this.connected = true;
      this.syncTicker();
      this.notifyState();
    });

    this.socket.on('disconnect', () => {
      this.connected = false;
      this.versionMismatch = false;
      this.stopTicker();
      this.notifyState();
    });

    this.socket.on('connect_error', () => {
      if (this.connected) {
        this.connected = false;
        this.versionMismatch = false;
        this.stopTicker();
        this.notifyState();
      }
    });

    this.socket.on('version:check', ({ serverVersion, compatible } = {}) => {
      if (serverVersion) {
        this.serverVersion = String(serverVersion);
        this.versionMismatch = compatible === false || this.serverVersion !== this.pluginVersion;
        if (this.versionMismatch) {
          this.stopTicker();
        }
        this.notifyState();
      }
    });

    this.socket.on('assets:list', (list) => {
      this.assets = Array.isArray(list) ? list : [];
      this.notifyState();
    });

    this.socket.on('profiles:state', (state) => {
      if (!state) return;
      this.profiles = Array.isArray(state.profiles) ? state.profiles : [];
      this.activeProfileId = state.activeProfileId || null;
      this.notifyState();
    });

    this.socket.on('air:state', (state) => {
      if (!state) return;
      if (state.serverNow) {
        this.clockOffsetMs = state.serverNow - Date.now();
      }
      if (state.serverVersion) {
        this.serverVersion = String(state.serverVersion);
        this.versionMismatch = this.serverVersion !== this.pluginVersion;
      }
      this.airState = state;
      this.syncTicker();
      this.notifyState();
    });

    this.socket.on('rundown:state', (state) => {
      if (!state) return;
      this.rundownState = state;
      this.notifyState();
    });
  }

  getNowServer() {
    return Date.now() + this.clockOffsetMs;
  }

  getAssetById(id) {
    if (!id) return null;
    return this.assets.find((a) => a.id === id) || null;
  }

  hasActiveCountdown() {
    return Boolean(
      this.connected &&
        !this.versionMismatch &&
        this.airState?.phase === 'ON_AIR' &&
        this.airState?.autoHideAt &&
        this.airState?.autoDurationMs > 0
    );
  }

  syncTicker() {
    if (this.hasActiveCountdown()) {
      if (!this.tickInterval) {
        this.tickInterval = setInterval(() => {
          if (!this.hasActiveCountdown()) {
            this.stopTicker();
            return;
          }
          for (const fn of this.tickListeners) {
            fn();
          }
        }, 100);
      }
    } else {
      this.stopTicker();
    }
  }

  stopTicker() {
    if (this.tickInterval) {
      clearInterval(this.tickInterval);
      this.tickInterval = null;
    }
  }

  onStateChange(fn) {
    this.stateListeners.add(fn);
    return () => this.stateListeners.delete(fn);
  }

  onCountdownTick(fn) {
    this.tickListeners.add(fn);
    return () => this.tickListeners.delete(fn);
  }

  notifyState() {
    for (const fn of this.stateListeners) {
      fn();
    }
  }

  triggerTake(assetId, fallbackAsset, overrideMode) {
    if (!this.socket || !this.connected || this.versionMismatch) return false;
    this.socket.emit('air:take', {
      assetId,
      asset: fallbackAsset,
      overrideMode
    });
    return true;
  }

  triggerOut() {
    if (!this.socket || !this.connected || this.versionMismatch) return false;
    this.socket.emit('air:out');
    return true;
  }

  triggerCut() {
    if (!this.socket || !this.connected || this.versionMismatch) return false;
    this.socket.emit('air:cut');
    return true;
  }

  triggerHold() {
    if (!this.socket || !this.connected || this.versionMismatch) return false;
    this.socket.emit('air:hold');
    return true;
  }

  triggerRundownNext() {
    if (!this.socket || !this.connected || this.versionMismatch) return false;
    this.socket.emit('rundown:next');
    return true;
  }

  switchProfile(profileId) {
    if (!this.socket || !this.connected || this.versionMismatch || !profileId) return false;
    this.socket.emit('profile:switch', profileId);
    return true;
  }

  getInspectorPayload() {
    return {
      type: 'bridge:state',
      serverUrl: this.serverUrl,
      connected: this.connected,
      pluginVersion: this.pluginVersion,
      serverVersion: this.serverVersion,
      versionMismatch: this.versionMismatch,
      assets: this.assets,
      profiles: this.profiles,
      activeProfileId: this.activeProfileId,
      airState: this.airState,
      rundownState: this.rundownState
    };
  }
}

export const bridge = new OverlayBridge();
