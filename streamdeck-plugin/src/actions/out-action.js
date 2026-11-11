import { SingletonAction } from '@elgato/streamdeck';
import { bridge } from '../bridge.js';
import { renderOutKey } from '../svg-renderer.js';

export class OutAction extends SingletonAction {
  manifestId = 'fr.mmitv.overlay.out';

  constructor() {
    super();
    this.lastSvg = new Map();

    bridge.onStateChange(() => this.refreshAll());
    bridge.onCountdownTick(() => this.refreshAll());
  }

  onWillAppear(ev) {
    this.lastSvg.delete(ev.action.id);
    this.renderSingle(ev.action);
  }

  onWillDisappear(ev) {
    this.lastSvg.delete(ev.action.id);
  }

  onKeyDown(ev) {
    if (!bridge.connected || bridge.versionMismatch) {
      ev.action.showAlert();
      return;
    }
    bridge.triggerOut();
  }

  refreshAll() {
    for (const action of this.actions) {
      this.renderSingle(action);
    }
  }

  renderSingle(action) {
    if (!action.isKey()) return;
    const svgUri = renderOutKey({
      connected: bridge.connected,
      airState: bridge.airState,
      nowServer: bridge.getNowServer(),
      versionMismatch: bridge.versionMismatch,
      pluginVersion: bridge.pluginVersion,
      serverVersion: bridge.serverVersion
    });
    if (this.lastSvg.get(action.id) !== svgUri) {
      this.lastSvg.set(action.id, svgUri);
      action.setImage(svgUri);
    }
  }
}
