import { SingletonAction } from '@elgato/streamdeck';
import { bridge } from '../bridge.js';
import { renderAssetKey } from '../svg-renderer.js';

const LONG_PRESS_MS = 450;

export class AssetAction extends SingletonAction {
  manifestId = 'fr.mmitv.overlay.asset';

  constructor() {
    super();
    this.settingsByContext = new Map();
    this.lastSvgByContext = new Map();
    this.pressByContext = new Map();

    bridge.onStateChange(() => {
      this.refreshAll(true);
    });

    bridge.onCountdownTick(() => {
      this.refreshCountdownKeys();
    });
  }

  onWillAppear(ev) {
    this.settingsByContext.set(ev.action.id, ev.payload.settings || {});
    this.lastSvgByContext.delete(ev.action.id);
    this.renderSingle(ev.action, true);
  }

  onWillDisappear(ev) {
    this.clearPress(ev.action.id);
    this.settingsByContext.delete(ev.action.id);
    this.lastSvgByContext.delete(ev.action.id);
  }

  onDidReceiveSettings(ev) {
    const settings = ev.payload.settings || {};
    this.settingsByContext.set(ev.action.id, settings);

    // Sync snapshot if asset exists on server
    const liveAsset = bridge.getAssetById(settings.assetId);
    if (liveAsset && !this.sameSnapshot(settings.assetSnapshot, liveAsset)) {
      const updated = { ...settings, assetSnapshot: this.pickSnapshot(liveAsset) };
      this.settingsByContext.set(ev.action.id, updated);
      ev.action.setSettings(updated);
    }

    this.renderSingle(ev.action, false);
  }

  onKeyDown(ev) {
    this.clearPress(ev.action.id);

    if (!bridge.connected) {
      ev.action.showAlert();
      return;
    }

    const settings = this.settingsByContext.get(ev.action.id) || ev.payload.settings || {};
    const asset = bridge.getAssetById(settings.assetId) || settings.assetSnapshot;

    if (!asset || !settings.assetId) {
      ev.action.showAlert();
      return;
    }

    const air = bridge.airState;
    const isThisOnAir =
      (air?.phase === 'ENTERING' || air?.phase === 'ON_AIR') &&
      air?.currentAsset?.id === settings.assetId;
    const isThisQueued =
      air?.phase === 'EXITING' && air?.queuedAsset?.id === settings.assetId;

    // Already active (Manual OR Auto counting down) -> immediate disappearance
    if (isThisOnAir || isThisQueued) {
      bridge.triggerOut();
      this.pressByContext.set(ev.action.id, {
        timer: null,
        longFired: false,
        ignoreKeyUp: true,
        asset
      });
      return;
    }

    // Off-air (or another asset is on-air): distinguish short click vs long press (>= 450ms -> Manual)
    const state = {
      timer: null,
      longFired: false,
      ignoreKeyUp: false,
      asset
    };

    state.timer = setTimeout(() => {
      state.timer = null;
      state.longFired = true;
      bridge.triggerTake(settings.assetId, asset, 'manual');
    }, LONG_PRESS_MS);

    this.pressByContext.set(ev.action.id, state);
  }

  onKeyUp(ev) {
    const state = this.pressByContext.get(ev.action.id);
    this.pressByContext.delete(ev.action.id);
    if (!state) return;

    if (state.timer) {
      clearTimeout(state.timer);
      state.timer = null;
    }

    if (state.ignoreKeyUp || state.longFired) {
      return;
    }

    const settings = this.settingsByContext.get(ev.action.id) || ev.payload.settings || {};
    if (!settings.assetId || !bridge.connected) return;

    bridge.triggerTake(settings.assetId, state.asset);
  }

  clearPress(contextId) {
    const state = this.pressByContext.get(contextId);
    if (state?.timer) {
      clearTimeout(state.timer);
    }
    this.pressByContext.delete(contextId);
  }

  pickSnapshot(a) {
    return {
      id: a.id,
      kind: a.kind,
      primaryText: a.primaryText,
      secondaryText: a.secondaryText,
      mode: a.mode,
      duration: a.duration,
      accentColor: a.accentColor,
      primaryBg: a.primaryBg
    };
  }

  sameSnapshot(s1, s2) {
    if (!s1 || !s2) return false;
    return (
      s1.primaryText === s2.primaryText &&
      s1.secondaryText === s2.secondaryText &&
      s1.mode === s2.mode &&
      s1.duration === s2.duration &&
      s1.kind === s2.kind &&
      s1.accentColor === s2.accentColor &&
      s1.primaryBg === s2.primaryBg
    );
  }

  refreshAll(syncSnapshots = false) {
    for (const action of this.actions) {
      this.renderSingle(action, syncSnapshots);
    }
  }

  refreshCountdownKeys() {
    const activeId = bridge.airState?.currentAsset?.id;
    if (!activeId) return;
    for (const action of this.actions) {
      const settings = this.settingsByContext.get(action.id);
      if (settings?.assetId === activeId) {
        this.renderSingle(action, false);
      }
    }
  }

  renderSingle(action, syncSnapshot) {
    if (!action.isKey()) return;
    const settings = this.settingsByContext.get(action.id) || {};
    const liveAsset = bridge.getAssetById(settings.assetId);

    if (syncSnapshot && liveAsset && !this.sameSnapshot(settings.assetSnapshot, liveAsset)) {
      const updated = { ...settings, assetSnapshot: this.pickSnapshot(liveAsset) };
      this.settingsByContext.set(action.id, updated);
      action.setSettings(updated);
    }

    const asset = liveAsset || (settings.assetId ? settings.assetSnapshot : null);
    const svgUri = renderAssetKey({
      asset,
      customLabel: settings.customLabel,
      connected: bridge.connected,
      airState: bridge.airState,
      nowServer: bridge.getNowServer()
    });

    if (this.lastSvgByContext.get(action.id) !== svgUri) {
      this.lastSvgByContext.set(action.id, svgUri);
      action.setImage(svgUri);
    }
  }
}
