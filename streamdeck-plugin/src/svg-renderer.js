/**
 * Dynamic 144x144 Flat Broadcast SVG Key Renderer for Elgato Stream Deck
 */

function esc(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function truncate(str, max) {
  const s = String(str ?? '').trim();
  if (s.length <= max) return s;
  return s.slice(0, Math.max(1, max - 1)).trimEnd() + '…';
}

function wrapText(raw, maxCharsPerLine, maxLines) {
  const clean = String(raw ?? '').trim().replace(/\s+/g, ' ');
  if (!clean) return ['Sans titre'];

  const words = clean.split(' ');
  const lines = [];
  let current = '';

  for (const word of words) {
    if (!current) {
      if (word.length > maxCharsPerLine) {
        lines.push(word.slice(0, maxCharsPerLine - 1) + '…');
      } else {
        current = word;
      }
    } else if (current.length + 1 + word.length <= maxCharsPerLine) {
      current += ' ' + word;
    } else {
      lines.push(current);
      current = word.length > maxCharsPerLine ? word.slice(0, maxCharsPerLine - 1) + '…' : word;
    }

    if (lines.length === maxLines) {
      return lines;
    }
  }

  if (current) {
    if (lines.length < maxLines) {
      lines.push(current);
    } else {
      lines[maxLines - 1] = truncate(lines[maxLines - 1] + ' ' + current, maxCharsPerLine);
    }
  }

  if (words.length > 0 && lines.length === maxLines) {
    const joinedLen = lines.join(' ').replace(/…/g, '').length;
    if (joinedLen + 2 < clean.length && !lines[maxLines - 1].endsWith('…')) {
      lines[maxLines - 1] = truncate(lines[maxLines - 1], maxCharsPerLine - 1);
    }
  }

  return lines;
}

function toDataUri(svg) {
  return 'data:image/svg+xml;charset=utf8,' + encodeURIComponent(svg);
}

function renderLinesSvg(lines, centerX, centerY, color = '#FFFFFF') {
  const count = lines.length;
  const fontSize = count === 1 ? (lines[0].length <= 9 ? 21 : 18) : count === 2 ? 17.5 : 15;
  const lineHeight = fontSize * 1.22;
  const startY = centerY - ((count - 1) * lineHeight) / 2 + fontSize * 0.34;

  return lines
    .map((line, i) => {
      const y = (startY + i * lineHeight).toFixed(1);
      return `<text x="${centerX}" y="${y}" fill="${color}" font-family="Quicksand, Segoe UI, Arial, sans-serif" font-size="${fontSize}" font-weight="700" text-anchor="middle">${esc(line)}</text>`;
    })
    .join('');
}

export function renderAssetKey({ asset, customLabel, connected, airState, nowServer }) {
  // 1. Unconfigured key
  if (!asset) {
    return toDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 144 144">
        <rect width="144" height="144" fill="#141414"/>
        <rect x="10" y="10" width="124" height="124" rx="14" fill="none" stroke="#404040" stroke-width="3" stroke-dasharray="7 6"/>
        <circle cx="72" cy="54" r="17" fill="#242424"/>
        <path d="M72 45V63M63 54H81" stroke="#FAB001" stroke-width="4" stroke-linecap="round"/>
        <text x="72" y="95" fill="#FFFFFF" font-family="Segoe UI, Arial, sans-serif" font-size="14" font-weight="700" text-anchor="middle">CHOISIR</text>
        <text x="72" y="114" fill="#9A9A9A" font-family="Segoe UI, Arial, sans-serif" font-size="13" font-weight="600" text-anchor="middle">UN ASSET</text>
      </svg>
    `);
  }

  const displayTitle = (customLabel && String(customLabel).trim()) || asset.primaryText || 'Asset';
  const maxChars = displayTitle.length <= 12 ? 12 : 14;
  const lines = wrapText(displayTitle, maxChars, 3);
  const subText = truncate(asset.secondaryText || (asset.kind === 'titre' ? 'Titre centré' : 'Synthé'), 18);
  const accent = asset.accentColor || '#FAB001';
  const kindLabel = asset.kind === 'titre' ? 'TITRE' : 'SYNTHÉ';

  // 2. Offline server state
  if (!connected) {
    return toDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 144 144">
        <rect width="144" height="144" fill="#121212"/>
        <rect width="144" height="30" fill="#262626"/>
        <circle cx="18" cy="15" r="4.5" fill="#777777"/>
        <text x="28" y="19" fill="#9E9E9E" font-family="Segoe UI, Arial, sans-serif" font-size="11.5" font-weight="700">HORS LIGNE</text>
        <rect x="0" y="30" width="6" height="114" fill="#404040"/>
        ${renderLinesSvg(lines, 75, 78, '#8A8A8A')}
        <text x="75" y="128" fill="#5E5E5E" font-family="Segoe UI, Arial, sans-serif" font-size="11.5" font-weight="600" text-anchor="middle">${esc(subText)}</text>
      </svg>
    `);
  }

  const phase = airState?.phase || 'IDLE';
  const isCurrent = airState?.currentAsset?.id === asset.id;
  const isQueued = airState?.queuedAsset?.id === asset.id;

  // 3. Queued (waiting for previous asset OUT animation to complete)
  if (isQueued) {
    return toDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 144 144">
        <rect width="144" height="144" fill="#292005"/>
        <rect width="144" height="32" fill="#FAB001"/>
        <text x="72" y="21" fill="#000000" font-family="Segoe UI, Arial, sans-serif" font-size="13" font-weight="800" text-anchor="middle">▶ SUIVANT</text>
        <rect x="2" y="2" width="140" height="140" rx="14" fill="none" stroke="#FAB001" stroke-width="4"/>
        ${renderLinesSvg(lines, 72, 79, '#FFFFFF')}
        <text x="72" y="128" fill="#FAB001" font-family="Segoe UI, Arial, sans-serif" font-size="11.5" font-weight="700" text-anchor="middle">TRANSITION...</text>
      </svg>
    `);
  }

  // 4. Entering on screen
  if (isCurrent && phase === 'ENTERING') {
    return toDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 144 144">
        <rect width="144" height="144" fill="#2E1608"/>
        <rect width="144" height="32" fill="#FAB001"/>
        <text x="72" y="21" fill="#000000" font-family="Segoe UI, Arial, sans-serif" font-size="13" font-weight="800" text-anchor="middle">▲ ENTRÉE</text>
        <rect x="2" y="2" width="140" height="140" rx="14" fill="none" stroke="#FAB001" stroke-width="4"/>
        ${renderLinesSvg(lines, 72, 79, '#FFFFFF')}
        <rect x="0" y="122" width="144" height="22" fill="#EF3333"/>
      </svg>
    `);
  }

  // 5. ON AIR (Auto with live sliding red/gold countdown bar OR Manual toggle)
  if (isCurrent && phase === 'ON_AIR') {
    const isAutoTimer = Boolean(airState.autoHideAt && airState.autoDurationMs > 0);

    if (isAutoTimer) {
      const remMs = Math.max(0, airState.autoHideAt - nowServer);
      const ratio = Math.min(1, Math.max(0, remMs / airState.autoDurationMs));
      const barWidth = Math.max(0, Math.round(144 * ratio));
      const tipX = Math.max(0, barWidth - 5);
      const secStr = (remMs / 1000).toFixed(1) + 's';

      return toDataUri(`
        <svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 144 144">
          <rect width="144" height="144" fill="#320B0B"/>
          <rect width="144" height="33" fill="#EF3333"/>
          <circle cx="16" cy="16.5" r="5" fill="#FFFFFF"/>
          <text x="27" y="21" fill="#FFFFFF" font-family="Segoe UI, Arial, sans-serif" font-size="12" font-weight="800">LIVE</text>
          <text x="134" y="22" fill="#FFFFFF" font-family="Segoe UI, Arial, sans-serif" font-size="15" font-weight="800" text-anchor="end">${secStr}</text>

          ${renderLinesSvg(lines, 72, 76, '#FFFFFF')}

          <!-- Sliding countdown bar -->
          <rect x="0" y="118" width="144" height="26" fill="#170505"/>
          <line x1="0" y1="118" x2="144" y2="118" stroke="#5A1A1A" stroke-width="1.5"/>
          <rect x="0" y="119" width="${barWidth}" height="25" fill="#EF3333"/>
          ${barWidth > 3 ? `<rect x="${tipX}" y="119" width="5" height="25" fill="#FAB001"/>` : ''}
          <rect x="2" y="2" width="140" height="140" rx="14" fill="none" stroke="#EF3333" stroke-width="3.5"/>
        </svg>
      `);
    }

    // Manual ON AIR
    return toDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 144 144">
        <rect width="144" height="144" fill="#320B0B"/>
        <rect width="144" height="33" fill="#EF3333"/>
        <circle cx="16" cy="16.5" r="5" fill="#FFFFFF"/>
        <text x="27" y="21" fill="#FFFFFF" font-family="Segoe UI, Arial, sans-serif" font-size="12" font-weight="800">ON AIR</text>
        <rect x="95" y="7" width="40" height="19" rx="5" fill="#000000"/>
        <text x="115" y="20" fill="#FAB001" font-family="Segoe UI, Arial, sans-serif" font-size="11" font-weight="800" text-anchor="middle">MAN</text>

        ${renderLinesSvg(lines, 72, 77, '#FFFFFF')}

        <rect x="20" y="115" width="104" height="20" rx="5" fill="#4D1414"/>
        <text x="72" y="129" fill="#FFB3B3" font-family="Segoe UI, Arial, sans-serif" font-size="11" font-weight="700" text-anchor="middle">CLIC = SORTIR</text>
        <rect x="2" y="2" width="140" height="140" rx="14" fill="none" stroke="#EF3333" stroke-width="4"/>
      </svg>
    `);
  }

  // 6. Exiting screen
  if (isCurrent && phase === 'EXITING') {
    return toDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 144 144">
        <rect width="144" height="144" fill="#201616"/>
        <rect width="144" height="31" fill="#404040"/>
        <text x="72" y="20" fill="#FAB001" font-family="Segoe UI, Arial, sans-serif" font-size="12.5" font-weight="800" text-anchor="middle">▼ SORTIE...</text>
        ${renderLinesSvg(lines, 72, 79, '#CFCFCF')}
      </svg>
    `);
  }

  // 7. Ready / Off-Air (Default IDLE state for this asset)
  const isAuto = asset.mode === 'auto';
  const badgeBg = isAuto ? '#FAB001' : '#404040';
  const badgeFg = isAuto ? '#000000' : '#FFFFFF';
  const badgeTxt = isAuto ? `${asset.duration}s` : 'MAN';

  return toDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 144 144">
      <rect width="144" height="144" fill="#171717"/>
      <rect width="144" height="31" fill="#232323"/>
      <text x="12" y="20" fill="#A8A8A8" font-family="Segoe UI, Arial, sans-serif" font-size="11" font-weight="800" letter-spacing="0.5">${kindLabel}</text>

      <rect x="90" y="6" width="44" height="19" rx="5" fill="${badgeBg}"/>
      <text x="112" y="19.5" fill="${badgeFg}" font-family="Segoe UI, Arial, sans-serif" font-size="11.5" font-weight="800" text-anchor="middle">${esc(badgeTxt)}</text>

      <!-- Asset's actual flat color signature -->
      <rect x="0" y="31" width="8" height="113" fill="${esc(accent)}"/>
      <rect x="8" y="31" width="3" height="113" fill="${esc(asset.primaryBg || '#FFFFFF')}" opacity="0.65"/>

      ${renderLinesSvg(lines, 76, 77, '#FFFFFF')}

      <text x="76" y="129" fill="#909090" font-family="Segoe UI, Arial, sans-serif" font-size="11.5" font-weight="600" text-anchor="middle">${esc(subText)}</text>
    </svg>
  `);
}

export function renderOutKey({ connected, airState, nowServer }) {
  if (!connected) {
    return toDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 144 144">
        <rect width="144" height="144" fill="#141414"/>
        <path d="M72 36V80M72 80L54 62M72 80L90 62" stroke="#555555" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
        <text x="72" y="114" fill="#666666" font-family="Segoe UI, Arial, sans-serif" font-size="15" font-weight="800" text-anchor="middle">SORTIR</text>
        <text x="72" y="131" fill="#555555" font-family="Segoe UI, Arial, sans-serif" font-size="10.5" font-weight="700" text-anchor="middle">HORS LIGNE</text>
      </svg>
    `);
  }

  const phase = airState?.phase || 'IDLE';
  const active = (phase === 'ON_AIR' || phase === 'ENTERING') && airState?.currentAsset;

  if (!active) {
    return toDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 144 144">
        <rect width="144" height="144" fill="#181818"/>
        <path d="M72 36V80M72 80L54 62M72 80L90 62" stroke="#686868" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
        <rect x="46" y="90" width="52" height="6" rx="3" fill="#484848"/>
        <text x="72" y="122" fill="#8E8E8E" font-family="Segoe UI, Arial, sans-serif" font-size="16" font-weight="800" text-anchor="middle">SORTIR</text>
      </svg>
    `);
  }

  const name = truncate(airState.currentAsset.primaryText || 'Actif', 16);
  let barSvg = '';
  if (phase === 'ON_AIR' && airState.autoHideAt && airState.autoDurationMs > 0) {
    const remMs = Math.max(0, airState.autoHideAt - nowServer);
    const ratio = Math.min(1, Math.max(0, remMs / airState.autoDurationMs));
    barSvg = `
      <rect x="0" y="134" width="144" height="10" fill="#171204"/>
      <rect x="0" y="134" width="${Math.round(144 * ratio)}" height="10" fill="#FAB001"/>
    `;
  }

  return toDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 144 144">
      <rect width="144" height="144" fill="#292005"/>
      <rect width="144" height="28" fill="#FAB001"/>
      <text x="72" y="19" fill="#000000" font-family="Segoe UI, Arial, sans-serif" font-size="11.5" font-weight="800" text-anchor="middle">ACTIF À L&apos;ANTENNE</text>
      <path d="M72 40V78M72 78L55 61M72 78L89 61" stroke="#FAB001" stroke-width="7.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
      <text x="72" y="104" fill="#FFFFFF" font-family="Segoe UI, Arial, sans-serif" font-size="17" font-weight="800" text-anchor="middle">SORTIR</text>
      <text x="72" y="124" fill="#D8C488" font-family="Segoe UI, Arial, sans-serif" font-size="11.5" font-weight="600" text-anchor="middle">${esc(name)}</text>
      ${barSvg}
      <rect x="2" y="2" width="140" height="140" rx="14" fill="none" stroke="#FAB001" stroke-width="3.5"/>
    </svg>
  `);
}

export function renderCutKey({ connected, airState }) {
  const phase = airState?.phase || 'IDLE';
  const active = connected && phase !== 'IDLE';

  if (!active) {
    return toDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 144 144">
        <rect width="144" height="144" fill="#191111"/>
        <path d="M78 30L48 71H71L67 99L97 58H74L78 30Z" fill="${connected ? '#8E3535' : '#4A2A2A'}"/>
        <text x="72" y="124" fill="${connected ? '#B87070' : '#665050'}" font-family="Segoe UI, Arial, sans-serif" font-size="17" font-weight="800" text-anchor="middle">CUT</text>
      </svg>
    `);
  }

  return toDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 144 144">
      <rect width="144" height="144" fill="#380B0B"/>
      <rect width="144" height="28" fill="#EF3333"/>
      <text x="72" y="19" fill="#FFFFFF" font-family="Segoe UI, Arial, sans-serif" font-size="11.5" font-weight="800" text-anchor="middle">COUPURE DIRECTE</text>
      <path d="M78 36L48 76H71L67 103L97 63H74L78 36Z" fill="#FAB001"/>
      <text x="72" y="127" fill="#FFFFFF" font-family="Segoe UI, Arial, sans-serif" font-size="19" font-weight="800" text-anchor="middle">CUT</text>
      <rect x="2" y="2" width="140" height="140" rx="14" fill="none" stroke="#EF3333" stroke-width="4"/>
    </svg>
  `);
}

export function renderHoldKey({ connected, airState, nowServer }) {
  const phase = airState?.phase || 'IDLE';
  const hasAuto = connected && phase === 'ON_AIR' && airState?.autoHideAt && airState?.autoDurationMs > 0;
  const isManualAir = connected && phase === 'ON_AIR' && airState?.currentAsset && !hasAuto;

  if (hasAuto) {
    const remMs = Math.max(0, airState.autoHideAt - nowServer);
    const ratio = Math.min(1, Math.max(0, remMs / airState.autoDurationMs));
    const secStr = (remMs / 1000).toFixed(1) + 's';

    return toDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 144 144">
        <rect width="144" height="144" fill="#2B2105"/>
        <rect width="144" height="30" fill="#FAB001"/>
        <text x="72" y="20" fill="#000000" font-family="Segoe UI, Arial, sans-serif" font-size="12.5" font-weight="800" text-anchor="middle">TIMER ${secStr}</text>
        <rect x="52" y="58" width="40" height="31" rx="6" stroke="#FAB001" stroke-width="6" fill="none"/>
        <path d="M60 58V48C60 41.4 65.4 36 72 36C78.6 36 84 41.4 84 48V58" stroke="#FAB001" stroke-width="6" stroke-linecap="round" fill="none"/>
        <text x="72" y="114" fill="#FFFFFF" font-family="Segoe UI, Arial, sans-serif" font-size="14.5" font-weight="800" text-anchor="middle">MAINTENIR</text>
        <rect x="0" y="126" width="144" height="18" fill="#171204"/>
        <rect x="0" y="126" width="${Math.round(144 * ratio)}" height="18" fill="#EF3333"/>
        <rect x="2" y="2" width="140" height="140" rx="14" fill="none" stroke="#FAB001" stroke-width="3.5"/>
      </svg>
    `);
  }

  if (isManualAir) {
    return toDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 144 144">
        <rect width="144" height="144" fill="#10261A"/>
        <rect x="52" y="44" width="40" height="32" rx="6" fill="#25C26E"/>
        <path d="M60 44V34C60 27.4 65.4 22 72 22C78.6 22 84 27.4 84 34V44" stroke="#25C26E" stroke-width="6" stroke-linecap="round" fill="none"/>
        <text x="72" y="105" fill="#FFFFFF" font-family="Segoe UI, Arial, sans-serif" font-size="14" font-weight="800" text-anchor="middle">EN MANUEL</text>
        <text x="72" y="124" fill="#7BE0A8" font-family="Segoe UI, Arial, sans-serif" font-size="11.5" font-weight="700" text-anchor="middle">VERROUILLÉ</text>
      </svg>
    `);
  }

  return toDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 144 144">
      <rect width="144" height="144" fill="#171717"/>
      <rect x="52" y="44" width="40" height="32" rx="6" stroke="#5A5A5A" stroke-width="6" fill="none"/>
      <path d="M60 44V34C60 27.4 65.4 22 72 22C78.6 22 84 27.4 84 34V44" stroke="#5A5A5A" stroke-width="6" stroke-linecap="round" fill="none"/>
      <text x="72" y="114" fill="#888888" font-family="Segoe UI, Arial, sans-serif" font-size="14.5" font-weight="800" text-anchor="middle">MAINTENIR</text>
    </svg>
  `);
}
