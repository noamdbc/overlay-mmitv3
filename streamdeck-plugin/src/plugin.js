import streamDeck from '@elgato/streamdeck';
import { bridge } from './bridge.js';
import { AssetAction } from './actions/asset-action.js';
import { OutAction } from './actions/out-action.js';
import { CutAction } from './actions/cut-action.js';
import { HoldAction } from './actions/hold-action.js';

const DEFAULT_SERVER_URL = 'http://localhost:3000';

// Compatible with Stream Deck 6.4, 6.8, and 7.x+
streamDeck.settings.useLegacySettingsBehavior = true;

streamDeck.actions.registerAction(new AssetAction());
streamDeck.actions.registerAction(new OutAction());
streamDeck.actions.registerAction(new CutAction());
streamDeck.actions.registerAction(new HoldAction());

function pushStateToInspector() {
  if (streamDeck.ui.action) {
    streamDeck.ui.sendToPropertyInspector(bridge.getInspectorPayload()).catch(() => {});
  }
}

bridge.onStateChange(() => {
  pushStateToInspector();
});

streamDeck.ui.onDidAppear(() => {
  pushStateToInspector();
});

streamDeck.ui.onSendToPlugin(async (ev) => {
  const payload = ev.payload || {};
  if (payload.cmd === 'requestState') {
    pushStateToInspector();
  } else if (payload.cmd === 'setServerUrl') {
    const cleanUrl = bridge.normalizeUrl(payload.serverUrl || DEFAULT_SERVER_URL);
    await streamDeck.settings.setGlobalSettings({ serverUrl: cleanUrl });
    bridge.connect(cleanUrl);
    pushStateToInspector();
  } else if (payload.cmd === 'switchProfile') {
    bridge.switchProfile(payload.profileId);
  }
});

streamDeck.settings.onDidReceiveGlobalSettings((ev) => {
  const url = ev.settings?.serverUrl || DEFAULT_SERVER_URL;
  bridge.connect(url);
});

streamDeck
  .connect()
  .then(async () => {
    const globalSettings = await streamDeck.settings.getGlobalSettings();
    const url = globalSettings?.serverUrl || DEFAULT_SERVER_URL;
    bridge.connect(url);
  })
  .catch((err) => {
    streamDeck.logger.error('Stream Deck connect error:', err);
  });
