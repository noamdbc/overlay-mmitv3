(function () {
  'use strict';

  const params = new URLSearchParams(window.location.search);
  if (params.get('mode') === 'key') {
    document.documentElement.classList.add('key-matte');
  }

  const stage = document.getElementById('stage');
  const renderer = new window.OverlayRenderer(stage);

  let lastTransitionId = null;
  let initializedFromState = false;

  const socket = window.io({
    query: { role: 'overlay' },
    reconnection: true,
    reconnectionDelay: 300,
    reconnectionDelayMax: 1500
  });

  socket.on('connect', () => {
    initializedFromState = false;
  });

  socket.on('air:state', (state) => {
    if (initializedFromState) return;
    initializedFromState = true;

    if (!state || state.phase === 'IDLE' || !state.currentAsset) {
      renderer.cut();
      lastTransitionId = state?.transitionId ?? null;
      return;
    }

    if (lastTransitionId !== state.transitionId) {
      lastTransitionId = state.transitionId;
      if (state.phase === 'ON_AIR') {
        renderer.renderStatic(state.currentAsset);
      } else if (state.phase === 'ENTERING') {
        renderer.playIn(state.currentAsset);
      }
    }
  });

  socket.on('overlay:cmd', (cmd) => {
    if (!cmd) return;
    initializedFromState = true;
    lastTransitionId = cmd.transitionId ?? lastTransitionId;

    if (cmd.type === 'ANIMATE_IN') {
      renderer.playIn(cmd.asset);
    } else if (cmd.type === 'ANIMATE_OUT') {
      renderer.playOut();
    } else if (cmd.type === 'CUT') {
      renderer.cut();
    }
  });
})();
