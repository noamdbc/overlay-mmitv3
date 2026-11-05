import { SingletonAction } from '@elgato/streamdeck';
import { bridge } from '../bridge.js';
import { renderCutKey } from '../svg-renderer.js';

export class CutAction extends SingletonAction {
  manifestId = 'fr.mmitv.overlay.cut';

  constructor() {
    super();
    this.lastSvg = new Map();

    bridge.onStateChange(() => this.refreshAll());
  }

  onWillAppear(ev) {
    this.lastSvg.delete(ev.action.id);
    this.renderSingle(ev.action);
  }

  onWillDisappear(ev) {
    this.lastSvg.delete(ev.action.id);
  }

  onKeyDown(ev) {
    if (!bridge.connected) {
      ev.action.showAlert();
      return;
    }
    bridge.triggerCut();
  }

  refreshAll() {
    for (const action of this.actions) {
      this.renderSingle(action);
    }
  }

  renderSingle(action) {
    if (!action.isKey()) return;
    const svgUri = renderCutKey({
      connected: bridge.connected,
      airState: bridge.airState
    });
    if (this.lastSvg.get(action.id) !== svgUri) {
      this.lastSvg.set(action.id, svgUri);
      action.setImage(svgUri);
    }
  }
}
