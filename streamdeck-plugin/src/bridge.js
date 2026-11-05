import { io } from 'socket.io-client';

const DEFAULT_SERVER_URL = 'http://localhost:3000';

export class OverlayBridge {
  constructor() {
    this.serverUrl = DEFAULT_SERVER_URL;
    this.socket = null;
    this.connected = false;
    this.assets = [];
    this.airState = {
      phase: 'IDLE',
      currentAsset: null,
      queuedAsset: null,
      autoHideAt: null,
      autoDurationMs: null
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
    this.stopTicker();
    this.notifyState();

    this.socket = io(this.serverUrl, {
      query: { role: 'streamdeck' },
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
      this.stopTicker();
      this.notifyState();
    });

    this.socket.on('connect_error', () => {
      if (this.connected) {
        this.connected = false;
        this.stopTicker();
        this.notifyState();
      }
    });

    this.socket.on('assets:list', (list) => {
      this.assets = Array.isArray(list) ? list : [];
      this.notifyState();
    });

    this.socket.on('air:state', (state) => {
      if (!state) return;
      if (state.serverNow) {
        this.clockOffsetMs = state.serverNow - Date.now();
      }
      this.airState = state;
      this.syncTicker();
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
    if (!this.socket || !this.connected) return false;
    this.socket.emit('air:take', {
      assetId,
      asset: fallbackAsset,
      overrideMode
    });
    return true;
  }

  triggerOut() {
    if (!this.socket || !this.connected) return false;
    this.socket.emit('air:out');
    return true;
  }

  triggerCut() {
    if (!this.socket || !this.connected) return false;
    this.socket.emit('air:cut');
    return true;
  }

  triggerHold() {
    if (!this.socket || !this.connected) return false;
    this.socket.emit('air:hold');
    return true;
  }

  getInspectorPayload() {
    return {
      type: 'bridge:state',
      serverUrl: this.serverUrl,
      connected: this.connected,
      assets: this.assets,
      airState: this.airState
    };
  }
}

export const bridge = new OverlayBridge();
