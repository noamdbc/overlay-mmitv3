/**
 * Dynamic 144x144 Broadcast Hardware Key SVG Renderer for Elgato Stream Deck
 * High-contrast, ultra-legible, color-coded studio key design
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
  return 'data:image/svg+xml;charset=utf8,' + encodeURIComponent(svg.trim());
}

function renderLinesSvg(lines, centerX, centerY, color = '#FFFFFF', maxFont = 22) {
  const count = lines.length;
  const fontSize =
    count === 1
      ? lines[0].length <= 8
        ? maxFont
        : lines[0].length <= 11
        ? 19.5
        : 17.5
      : count === 2
      ? 18
      : 15.5;
  const lineHeight = fontSize * 1.18;
  const startY = centerY - ((count - 1) * lineHeight) / 2 + fontSize * 0.35;

  return lines
    .map((line, i) => {
      const y = (startY + i * lineHeight).toFixed(1);
      return `
        <text x="${centerX}" y="${(Number(y) + 1.5).toFixed(1)}" fill="#000000" opacity="0.65" font-family="Quicksand, Segoe UI, Arial, sans-serif" font-size="${fontSize}" font-weight="800" text-anchor="middle">${esc(line)}</text>
        <text x="${centerX}" y="${y}" fill="${color}" font-family="Quicksand, Segoe UI, Arial, sans-serif" font-size="${fontSize}" font-weight="800" text-anchor="middle">${esc(line)}</text>
      `;
    })
    .join('');
}

export function renderVersionMismatchKey({ pluginVersion, serverVersion }) {
  const pVer = esc(pluginVersion || '?');
  const sVer = esc(serverVersion || '?');
  return toDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 144 144">
      <defs>
        <linearGradient id="bgErr" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#4A0A10"/>
          <stop offset="100%" stop-color="#1E0406"/>
        </linearGradient>
      </defs>
      <rect width="144" height="144" rx="22" fill="url(#bgErr)"/>
      <rect width="144" height="33" fill="#EF233C"/>
      <text x="72" y="21.5" fill="#FFFFFF" font-family="Segoe UI, Arial, sans-serif" font-size="11.5" font-weight="900" text-anchor="middle">⚠ DÉFAUT VERSION</text>

      <text x="72" y="61" fill="#FAB001" font-family="Segoe UI, Arial, sans-serif" font-size="14" font-weight="900" text-anchor="middle">INCOMPATIBLE</text>
      <text x="72" y="83" fill="#FFFFFF" font-family="Segoe UI, Arial, sans-serif" font-size="12.5" font-weight="800" text-anchor="middle">Plugin v${pVer}</text>
      <text x="72" y="102" fill="#FF99A5" font-family="Segoe UI, Arial, sans-serif" font-size="12.5" font-weight="800" text-anchor="middle">Serveur v${sVer}</text>

      <rect x="12" y="113" width="120" height="21" rx="6" fill="#000000" fill-opacity="0.55" stroke="#FAB001" stroke-width="1.5"/>
      <text x="72" y="127" fill="#FAB001" font-family="Segoe UI, Arial, sans-serif" font-size="10.5" font-weight="900" text-anchor="middle">MAJ PLUGIN REQUISE</text>
      <rect x="2.5" y="2.5" width="139" height="139" rx="19" fill="none" stroke="#EF233C" stroke-width="4"/>
    </svg>
  `);
}

export function renderAssetKey({
  asset,
  customLabel,
  connected,
  airState,
  nowServer,
  versionMismatch,
  pluginVersion,
  serverVersion
}) {
  if (connected && versionMismatch) {
    return renderVersionMismatchKey({ pluginVersion, serverVersion });
  }
  // 1. Unconfigured key
  if (!asset) {
    return toDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 144 144">
        <defs>
          <linearGradient id="bgEmpty" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#1E222B"/>
            <stop offset="100%" stop-color="#111318"/>
          </linearGradient>
        </defs>
        <rect width="144" height="144" rx="22" fill="url(#bgEmpty)"/>
        <rect x="8" y="8" width="128" height="128" rx="16" fill="none" stroke="#FAB001" stroke-opacity="0.45" stroke-width="2.5" stroke-dasharray="7 5"/>
        <circle cx="72" cy="52" r="21" fill="#262B36" stroke="#FAB001" stroke-width="2"/>
        <path d="M72 42V62M62 52H82" stroke="#FAB001" stroke-width="4" stroke-linecap="round"/>
        <text x="72" y="96" fill="#FFFFFF" font-family="Segoe UI, Arial, sans-serif" font-size="15" font-weight="800" text-anchor="middle">ASSIGNER</text>
        <text x="72" y="115" fill="#FAB001" font-family="Segoe UI, Arial, sans-serif" font-size="12.5" font-weight="700" text-anchor="middle">UN ASSET</text>
      </svg>
    `);
  }

  const displayTitle = (customLabel && String(customLabel).trim()) || asset.primaryText || 'Asset';
  const maxChars = displayTitle.length <= 10 ? 11 : 13;
  const lines = wrapText(displayTitle, maxChars, 3);
  const isTitre = asset.kind === 'titre' || asset.align === 'center';
  const subText = truncate(
    asset.secondaryText || (isTitre ? 'Séquence Centrée' : 'Synthé Bas-Gauche'),
    16
  );
  const accent = asset.accentColor || '#FAB001';
  const primaryBg = asset.primaryBg || '#FFFFFF';
  const secondaryBg = asset.secondaryBg || '#FAB001';
  const kindLabel = isTitre ? 'TITRE' : 'SYNTHÉ';

  // 2. Offline server state
  if (!connected) {
    return toDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 144 144">
        <rect width="144" height="144" rx="22" fill="#121418"/>
        <rect x="3" y="3" width="138" height="138" rx="19" fill="none" stroke="#2D323E" stroke-width="2"/>
        <rect x="0" y="0" width="144" height="32" fill="#20242C"/>
        <circle cx="18" cy="16" r="5" fill="#FF5C5C"/>
        <text x="30" y="20.5" fill="#B0B7C3" font-family="Segoe UI, Arial, sans-serif" font-size="11.5" font-weight="800">SERVEUR OFF</text>
        <rect x="0" y="32" width="8" height="112" fill="#3E4452"/>
        ${renderLinesSvg(lines, 76, 77, '#7D8594', 20)}
        <rect x="16" y="113" width="118" height="22" rx="6" fill="#1B1E26"/>
        <text x="75" y="128" fill="#687080" font-family="Segoe UI, Arial, sans-serif" font-size="11.5" font-weight="700" text-anchor="middle">${esc(subText)}</text>
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
        <defs>
          <linearGradient id="bgQueue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#3D2D04"/>
            <stop offset="100%" stop-color="#1C1402"/>
          </linearGradient>
        </defs>
        <rect width="144" height="144" rx="22" fill="url(#bgQueue)"/>
        <rect width="144" height="34" fill="#FAB001"/>
        <text x="72" y="22.5" fill="#000000" font-family="Segoe UI, Arial, sans-serif" font-size="13.5" font-weight="900" text-anchor="middle">▶ EN ATTENTE</text>
        ${renderLinesSvg(lines, 72, 76, '#FFFFFF', 21)}
        <rect x="12" y="111" width="120" height="23" rx="7" fill="#000000" fill-opacity="0.55" stroke="#FAB001" stroke-width="1.5"/>
        <text x="72" y="126.5" fill="#FAB001" font-family="Segoe UI, Arial, sans-serif" font-size="11.5" font-weight="800" text-anchor="middle">ENTRÉE IMMINENTE</text>
        <rect x="2.5" y="2.5" width="139" height="139" rx="19" fill="none" stroke="#FAB001" stroke-width="4"/>
      </svg>
    `);
  }

  // 4. Entering on screen
  if (isCurrent && phase === 'ENTERING') {
    return toDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 144 144">
        <defs>
          <linearGradient id="bgEnter" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#4A1D05"/>
            <stop offset="100%" stop-color="#210902"/>
          </linearGradient>
        </defs>
        <rect width="144" height="144" rx="22" fill="url(#bgEnter)"/>
        <rect width="144" height="34" fill="#FF9F1C"/>
        <text x="72" y="22.5" fill="#000000" font-family="Segoe UI, Arial, sans-serif" font-size="13.5" font-weight="900" text-anchor="middle">▲ ANIMATION IN</text>
        ${renderLinesSvg(lines, 72, 76, '#FFFFFF', 21)}
        <rect x="12" y="111" width="120" height="23" rx="7" fill="#EF233C"/>
        <text x="72" y="126.5" fill="#FFFFFF" font-family="Segoe UI, Arial, sans-serif" font-size="11.5" font-weight="800" text-anchor="middle">EN DIRECT...</text>
        <rect x="2.5" y="2.5" width="139" height="139" rx="19" fill="none" stroke="#FF9F1C" stroke-width="4"/>
      </svg>
    `);
  }

  // 5. ON AIR (Auto with live sliding red/gold countdown bar OR Manual toggle)
  if (isCurrent && phase === 'ON_AIR') {
    const isAutoTimer = Boolean(airState.autoHideAt && airState.autoDurationMs > 0);

    if (isAutoTimer) {
      const remMs = Math.max(0, airState.autoHideAt - nowServer);
      const ratio = Math.min(1, Math.max(0, remMs / airState.autoDurationMs));
      const barWidth = Math.max(0, Math.round(136 * ratio));
      const tipX = Math.max(4, 4 + barWidth - 6);
      const secStr = (remMs / 1000).toFixed(1) + 's';

      return toDataUri(`
        <svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 144 144">
          <defs>
            <linearGradient id="bgLiveAuto" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#52090E"/>
              <stop offset="100%" stop-color="#220305"/>
            </linearGradient>
            <linearGradient id="barGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stop-color="#EF233C"/>
              <stop offset="100%" stop-color="#FF6B35"/>
            </linearGradient>
          </defs>
          <rect width="144" height="144" rx="22" fill="url(#bgLiveAuto)"/>

          <!-- Top Tally Banner -->
          <rect width="144" height="35" fill="#EF233C"/>
          <circle cx="16" cy="17.5" r="5.5" fill="#FFFFFF"/>
          <text x="27" y="22.5" fill="#FFFFFF" font-family="Segoe UI, Arial, sans-serif" font-size="13" font-weight="900">ON AIR</text>

          <!-- Countdown Pill -->
          <rect x="82" y="5" width="54" height="25" rx="7" fill="#1A0305"/>
          <text x="109" y="22.5" fill="#FAB001" font-family="Segoe UI, Arial, sans-serif" font-size="15.5" font-weight="900" text-anchor="middle">${secStr}</text>

          ${renderLinesSvg(lines, 72, 74, '#FFFFFF', 21.5)}

          <!-- High-visibility Sliding Countdown Track -->
          <rect x="4" y="111" width="136" height="29" rx="9" fill="#140203" stroke="#5E1119" stroke-width="1.5"/>
          <rect x="4" y="111" width="${barWidth}" height="29" rx="8" fill="url(#barGrad)"/>
          ${barWidth > 6 ? `<rect x="${tipX}" y="111" width="6" height="29" rx="2" fill="#FAB001"/>` : ''}
          <text x="72" y="129.5" fill="#FFFFFF" font-family="Segoe UI, Arial, sans-serif" font-size="11" font-weight="800" letter-spacing="0.5" text-anchor="middle">▼ CLIC = SORTIR</text>

          <rect x="2.5" y="2.5" width="139" height="139" rx="19" fill="none" stroke="#FF2A44" stroke-width="4.5"/>
        </svg>
      `);
    }

    // Manual ON AIR
    return toDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 144 144">
        <defs>
          <linearGradient id="bgLiveMan" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#52090E"/>
            <stop offset="100%" stop-color="#220305"/>
          </linearGradient>
        </defs>
        <rect width="144" height="144" rx="22" fill="url(#bgLiveMan)"/>
        <rect width="144" height="35" fill="#EF233C"/>
        <circle cx="16" cy="17.5" r="5.5" fill="#FFFFFF"/>
        <text x="27" y="22.5" fill="#FFFFFF" font-family="Segoe UI, Arial, sans-serif" font-size="13" font-weight="900">ON AIR</text>
        <rect x="86" y="6" width="50" height="23" rx="6" fill="#1A0305"/>
        <text x="111" y="21.5" fill="#FAB001" font-family="Segoe UI, Arial, sans-serif" font-size="11.5" font-weight="900" text-anchor="middle">MANUEL</text>

        ${renderLinesSvg(lines, 72, 74, '#FFFFFF', 21.5)}

        <rect x="10" y="111" width="124" height="25" rx="8" fill="#EF233C"/>
        <text x="72" y="127.5" fill="#FFFFFF" font-family="Segoe UI, Arial, sans-serif" font-size="12" font-weight="900" text-anchor="middle">▼ CLIC = SORTIR</text>
        <rect x="2.5" y="2.5" width="139" height="139" rx="19" fill="none" stroke="#FF2A44" stroke-width="4.5"/>
      </svg>
    `);
  }

  // 6. Exiting screen
  if (isCurrent && phase === 'EXITING') {
    return toDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 144 144">
        <rect width="144" height="144" rx="22" fill="#1D1518"/>
        <rect width="144" height="34" fill="#3B2830"/>
        <text x="72" y="22" fill="#FAB001" font-family="Segoe UI, Arial, sans-serif" font-size="13" font-weight="900" text-anchor="middle">▼ SORTIE...</text>
        ${renderLinesSvg(lines, 72, 78, '#D0D5DD', 20)}
        <rect x="2.5" y="2.5" width="139" height="139" rx="19" fill="none" stroke="#6E4756" stroke-width="3"/>
      </svg>
    `);
  }

  // 7. Ready / Off-Air (Rich Broadcast Studio Key with Theme Color Signature)
  const isAuto = asset.mode === 'auto';
  const badgeBg = isAuto ? '#FAB001' : '#323846';
  const badgeFg = isAuto ? '#000000' : '#FFFFFF';
  const badgeTxt = isAuto ? `${asset.duration}s` : 'MAN';
  const kindPillBg = isTitre ? '#1E3A5F' : '#2B2512';
  const kindPillFg = isTitre ? '#70D6FF' : '#FAB001';

  return toDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 144 144">
      <defs>
        <linearGradient id="bgReady" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#1E222D"/>
          <stop offset="100%" stop-color="#101218"/>
        </linearGradient>
      </defs>
      <rect width="144" height="144" rx="22" fill="url(#bgReady)"/>

      <!-- Top Header Bar -->
      <rect width="144" height="34" fill="#151821"/>
      <line x1="0" y1="34" x2="144" y2="34" stroke="#2A3040" stroke-width="1.5"/>

      <!-- Kind Pill (SYNTHÉ vs TITRE) -->
      <rect x="8" y="6" width="66" height="22" rx="6" fill="${kindPillBg}" stroke="${kindPillFg}" stroke-opacity="0.4" stroke-width="1"/>
      <text x="41" y="21" fill="${kindPillFg}" font-family="Segoe UI, Arial, sans-serif" font-size="11.5" font-weight="900" letter-spacing="0.4" text-anchor="middle">${kindLabel}</text>

      <!-- Mode / Duration Pill -->
      <rect x="84" y="6" width="52" height="22" rx="6" fill="${badgeBg}"/>
      <text x="110" y="21" fill="${badgeFg}" font-family="Segoe UI, Arial, sans-serif" font-size="12.5" font-weight="900" text-anchor="middle">${esc(badgeTxt)}</text>

      <!-- Asset Theme Color Signature Strip on Left -->
      <rect x="0" y="34" width="9" height="110" fill="${esc(accent)}"/>
      <rect x="9" y="34" width="4" height="110" fill="${esc(primaryBg)}" opacity="0.8"/>

      <!-- Main Title (Multi-line, High-Contrast) -->
      ${renderLinesSvg(lines, 77, 74, '#FFFFFF', 21.5)}

      <!-- Bottom Role / Subtitle Capsule -->
      <rect x="17" y="111" width="119" height="24" rx="7" fill="#181C26" stroke="${esc(secondaryBg)}" stroke-opacity="0.55" stroke-width="1.5"/>
      <circle cx="27" cy="123" r="4" fill="${esc(secondaryBg)}"/>
      <text x="80" y="127" fill="#D5DBE6" font-family="Segoe UI, Arial, sans-serif" font-size="11.5" font-weight="700" text-anchor="middle">${esc(subText)}</text>

      <!-- Subtle Outer Bezel -->
      <rect x="1.5" y="1.5" width="141" height="141" rx="20" fill="none" stroke="#FFFFFF" stroke-opacity="0.1" stroke-width="1.5"/>
    </svg>
  `);
}

export function renderOutKey({
  connected,
  airState,
  nowServer,
  versionMismatch,
  pluginVersion,
  serverVersion
}) {
  if (connected && versionMismatch) {
    return renderVersionMismatchKey({ pluginVersion, serverVersion });
  }
  if (!connected) {
    return toDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 144 144">
        <rect width="144" height="144" rx="22" fill="#121418"/>
        <circle cx="72" cy="54" r="24" fill="#1C2029"/>
        <path d="M72 38V68M72 68L58 54M72 68L86 54" stroke="#5A6275" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
        <text x="72" y="106" fill="#6E778A" font-family="Segoe UI, Arial, sans-serif" font-size="16" font-weight="900" text-anchor="middle">SORTIR</text>
        <text x="72" y="125" fill="#4D5566" font-family="Segoe UI, Arial, sans-serif" font-size="11" font-weight="700" text-anchor="middle">HORS LIGNE</text>
      </svg>
    `);
  }

  const phase = airState?.phase || 'IDLE';
  const active = (phase === 'ON_AIR' || phase === 'ENTERING') && airState?.currentAsset;

  if (!active) {
    return toDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 144 144">
        <defs>
          <linearGradient id="bgOutIdle" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#1E222D"/>
            <stop offset="100%" stop-color="#12151C"/>
          </linearGradient>
        </defs>
        <rect width="144" height="144" rx="22" fill="url(#bgOutIdle)"/>
        <circle cx="72" cy="52" r="25" fill="#252A38" stroke="#384054" stroke-width="2"/>
        <path d="M72 37V66M72 66L58 52M72 66L86 52" stroke="#9BA3B5" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
        <text x="72" y="103" fill="#E2E6F0" font-family="Segoe UI, Arial, sans-serif" font-size="17" font-weight="900" text-anchor="middle">SORTIR</text>
        <rect x="26" y="113" width="92" height="20" rx="6" fill="#181B24"/>
        <text x="72" y="126.5" fill="#7B8499" font-family="Segoe UI, Arial, sans-serif" font-size="10.5" font-weight="800" text-anchor="middle">HORS ANTENNE</text>
        <rect x="1.5" y="1.5" width="141" height="141" rx="20" fill="none" stroke="#FFFFFF" stroke-opacity="0.08" stroke-width="1.5"/>
      </svg>
    `);
  }

  const name = truncate(airState.currentAsset.primaryText || 'Actif', 15);
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
      <defs>
        <linearGradient id="bgOutAct" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#3D2E05"/>
          <stop offset="100%" stop-color="#1A1302"/>
        </linearGradient>
      </defs>
      <rect width="144" height="144" rx="22" fill="url(#bgOutAct)"/>
      <rect width="144" height="31" fill="#FAB001"/>
      <text x="72" y="20.5" fill="#000000" font-family="Segoe UI, Arial, sans-serif" font-size="12" font-weight="900" text-anchor="middle">● À L&apos;ANTENNE</text>
      <circle cx="72" cy="61" r="22" fill="#000000" fill-opacity="0.45" stroke="#FAB001" stroke-width="2.5"/>
      <path d="M72 48V73M72 73L60 61M72 73L84 61" stroke="#FAB001" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
      <text x="72" y="105" fill="#FFFFFF" font-family="Segoe UI, Arial, sans-serif" font-size="17.5" font-weight="900" text-anchor="middle">SORTIR</text>
      <text x="72" y="124" fill="#FDE08D" font-family="Segoe UI, Arial, sans-serif" font-size="11.5" font-weight="700" text-anchor="middle">${esc(name)}</text>
      ${barSvg}
      <rect x="2.5" y="2.5" width="139" height="139" rx="19" fill="none" stroke="#FAB001" stroke-width="4"/>
    </svg>
  `);
}

export function renderCutKey({
  connected,
  airState,
  versionMismatch,
  pluginVersion,
  serverVersion
}) {
  if (connected && versionMismatch) {
    return renderVersionMismatchKey({ pluginVersion, serverVersion });
  }
  const phase = airState?.phase || 'IDLE';
  const active = connected && phase !== 'IDLE';

  if (!active) {
    return toDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 144 144">
        <defs>
          <linearGradient id="bgCutIdle" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#291215"/>
            <stop offset="100%" stop-color="#14080A"/>
          </linearGradient>
        </defs>
        <rect width="144" height="144" rx="22" fill="url(#bgCutIdle)"/>
        <circle cx="72" cy="54" r="25" fill="#38171C" stroke="#5E232B" stroke-width="2"/>
        <path d="M77 34L54 60H71L67 78L90 52H73L77 34Z" fill="${connected ? '#FF5C6C' : '#6E4046'}"/>
        <text x="72" y="106" fill="${connected ? '#FFD6DA' : '#7D5B5F'}" font-family="Segoe UI, Arial, sans-serif" font-size="18" font-weight="900" text-anchor="middle">CUT</text>
        <text x="72" y="124" fill="${connected ? '#B86B74' : '#5E4246'}" font-family="Segoe UI, Arial, sans-serif" font-size="10.5" font-weight="800" text-anchor="middle">COUPURE 0ms</text>
        <rect x="1.5" y="1.5" width="141" height="141" rx="20" fill="none" stroke="#FF4D5E" stroke-opacity="0.2" stroke-width="1.5"/>
      </svg>
    `);
  }

  return toDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 144 144">
      <defs>
        <linearGradient id="bgCutAct" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#610A13"/>
          <stop offset="100%" stop-color="#290307"/>
        </linearGradient>
      </defs>
      <rect width="144" height="144" rx="22" fill="url(#bgCutAct)"/>
      <rect width="144" height="31" fill="#EF233C"/>
      <text x="72" y="20.5" fill="#FFFFFF" font-family="Segoe UI, Arial, sans-serif" font-size="12" font-weight="900" text-anchor="middle">⚡ URGENCE 0ms</text>
      <circle cx="72" cy="64" r="24" fill="#2B0408" stroke="#FAB001" stroke-width="2.5"/>
      <path d="M77 43L54 69H71L67 87L90 61H73L77 43Z" fill="#FAB001"/>
      <text x="72" y="116" fill="#FFFFFF" font-family="Segoe UI, Arial, sans-serif" font-size="20" font-weight="900" text-anchor="middle">CUT</text>
      <rect x="2.5" y="2.5" width="139" height="139" rx="19" fill="none" stroke="#FF2A44" stroke-width="4.5"/>
    </svg>
  `);
}

export function renderHoldKey({
  connected,
  airState,
  nowServer,
  versionMismatch,
  pluginVersion,
  serverVersion
}) {
  if (connected && versionMismatch) {
    return renderVersionMismatchKey({ pluginVersion, serverVersion });
  }
  const phase = airState?.phase || 'IDLE';
  const hasAuto = connected && phase === 'ON_AIR' && airState?.autoHideAt && airState?.autoDurationMs > 0;
  const isManualAir = connected && phase === 'ON_AIR' && airState?.currentAsset && !hasAuto;

  if (hasAuto) {
    const remMs = Math.max(0, airState.autoHideAt - nowServer);
    const ratio = Math.min(1, Math.max(0, remMs / airState.autoDurationMs));
    const secStr = (remMs / 1000).toFixed(1) + 's';

    return toDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 144 144">
        <defs>
          <linearGradient id="bgHoldAct" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#3D2E05"/>
            <stop offset="100%" stop-color="#1A1302"/>
          </linearGradient>
        </defs>
        <rect width="144" height="144" rx="22" fill="url(#bgHoldAct)"/>
        <rect width="144" height="31" fill="#FAB001"/>
        <text x="72" y="20.5" fill="#000000" font-family="Segoe UI, Arial, sans-serif" font-size="12.5" font-weight="900" text-anchor="middle">⏱ TIMER ${secStr}</text>
        <rect x="52" y="57" width="40" height="30" rx="6" fill="#FAB001"/>
        <path d="M60 57V47C60 40.4 65.4 35 72 35C78.6 35 84 40.4 84 47V57" stroke="#FAB001" stroke-width="5.5" stroke-linecap="round" fill="none"/>
        <circle cx="72" cy="72" r="4" fill="#000000"/>
        <text x="72" y="110" fill="#FFFFFF" font-family="Segoe UI, Arial, sans-serif" font-size="15.5" font-weight="900" text-anchor="middle">MAINTENIR</text>
        <rect x="0" y="124" width="144" height="20" fill="#171204"/>
        <rect x="0" y="124" width="${Math.round(144 * ratio)}" height="20" fill="#EF233C"/>
        <rect x="2.5" y="2.5" width="139" height="139" rx="19" fill="none" stroke="#FAB001" stroke-width="4"/>
      </svg>
    `);
  }

  if (isManualAir) {
    return toDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 144 144">
        <defs>
          <linearGradient id="bgHoldLocked" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#0B3B24"/>
            <stop offset="100%" stop-color="#051C11"/>
          </linearGradient>
        </defs>
        <rect width="144" height="144" rx="22" fill="url(#bgHoldLocked)"/>
        <rect width="144" height="31" fill="#25C26E"/>
        <text x="72" y="20.5" fill="#000000" font-family="Segoe UI, Arial, sans-serif" font-size="12" font-weight="900" text-anchor="middle">● VERROUILLÉ</text>
        <rect x="52" y="58" width="40" height="30" rx="6" fill="#25C26E"/>
        <path d="M60 58V48C60 41.4 65.4 36 72 36C78.6 36 84 41.4 84 48V58" stroke="#25C26E" stroke-width="5.5" stroke-linecap="round" fill="none"/>
        <circle cx="72" cy="73" r="4" fill="#051C11"/>
        <text x="72" y="111" fill="#FFFFFF" font-family="Segoe UI, Arial, sans-serif" font-size="15.5" font-weight="900" text-anchor="middle">EN MANUEL</text>
        <text x="72" y="128" fill="#7BE0A8" font-family="Segoe UI, Arial, sans-serif" font-size="11" font-weight="700" text-anchor="middle">FIXÉ À L&apos;ANTENNE</text>
        <rect x="2.5" y="2.5" width="139" height="139" rx="19" fill="none" stroke="#25C26E" stroke-width="4"/>
      </svg>
    `);
  }

  return toDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 144 144">
      <defs>
        <linearGradient id="bgHoldIdle" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#1E222D"/>
          <stop offset="100%" stop-color="#12151C"/>
        </linearGradient>
      </defs>
      <rect width="144" height="144" rx="22" fill="url(#bgHoldIdle)"/>
      <rect x="52" y="48" width="40" height="30" rx="6" stroke="#7E879B" stroke-width="5" fill="none"/>
      <path d="M60 48V38C60 31.4 65.4 26 72 26C78.6 26 84 31.4 84 38V48" stroke="#7E879B" stroke-width="5" stroke-linecap="round" fill="none"/>
      <text x="72" y="106" fill="#E2E6F0" font-family="Segoe UI, Arial, sans-serif" font-size="15.5" font-weight="900" text-anchor="middle">MAINTENIR</text>
      <text x="72" y="124" fill="#7B8499" font-family="Segoe UI, Arial, sans-serif" font-size="10.5" font-weight="800" text-anchor="middle">BLOQUER TIMER</text>
      <rect x="1.5" y="1.5" width="141" height="141" rx="20" fill="none" stroke="#FFFFFF" stroke-opacity="0.08" stroke-width="1.5"/>
    </svg>
  `);
}

/**
 * Dynamic 144x144 Broadcast Key for "Conducteur (NEXT CUE)"
 * Displays live cue state, upcoming cue precharge, and countdown
 */
export function renderRundownNextKey({
  connected,
  versionMismatch,
  pluginVersion,
  serverVersion,
  rundownState,
  airState,
  nowServer = Date.now()
}) {
  if (connected && versionMismatch) {
    return renderVersionMismatchKey({ pluginVersion, serverVersion });
  }

  if (!connected) {
    return toDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 144 144">
        <defs>
          <linearGradient id="bgRndOffline" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#2D1115"/>
            <stop offset="100%" stop-color="#14080A"/>
          </linearGradient>
        </defs>
        <rect width="144" height="144" rx="22" fill="url(#bgRndOffline)"/>
        <rect width="144" height="30" fill="#D90429"/>
        <text x="72" y="20" fill="#FFFFFF" font-family="Segoe UI, Arial, sans-serif" font-size="11" font-weight="900" text-anchor="middle">CONDUCTEUR</text>
        <circle cx="72" cy="72" r="18" fill="none" stroke="#FF5C72" stroke-width="3" stroke-dasharray="4 4"/>
        <text x="72" y="78" fill="#FF5C72" font-family="Segoe UI, Arial, sans-serif" font-size="16" font-weight="900" text-anchor="middle">OFF</text>
        <text x="72" y="115" fill="#FFFFFF" font-family="Segoe UI, Arial, sans-serif" font-size="12" font-weight="800" text-anchor="middle">HORS LIGNE</text>
        <rect x="2" y="2" width="140" height="140" rx="20" fill="none" stroke="#D90429" stroke-width="3"/>
      </svg>
    `);
  }

  const items = rundownState?.items || [];
  const currIdx = typeof rundownState?.currentIndex === 'number' ? rundownState.currentIndex : -1;
  const nextIdx = typeof rundownState?.nextIndex === 'number' ? rundownState.nextIndex : -1;
  const activeCue = rundownState?.currentCue || (currIdx >= 0 && items[currIdx]);
  const nextCue = rundownState?.nextCue || (nextIdx >= 0 && items[nextIdx]);

  const phase = airState?.phase || 'IDLE';
  const isCueOnAir = Boolean(rundownState?.activeCueId && (phase === 'ON_AIR' || phase === 'ENTERING'));
  const isTransition = phase === 'EXITING' || phase === 'ENTERING';

  // 1. A Cue from the Conductor is currently ON AIR
  if (isCueOnAir && activeCue) {
    const asset = activeCue.asset || {};
    const title = asset.primaryText || 'Sans titre';
    const lines = wrapText(title, 11, 2);
    const hasAuto = phase === 'ON_AIR' && airState?.autoHideAt && airState?.autoDurationMs > 0;
    let timerSec = '';
    let progressRatio = 0;

    if (hasAuto) {
      const remMs = Math.max(0, airState.autoHideAt - nowServer);
      progressRatio = Math.min(1, Math.max(0, remMs / airState.autoDurationMs));
      timerSec = (remMs / 1000).toFixed(1) + 's';
    }

    return toDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 144 144">
        <defs>
          <linearGradient id="bgRndLive" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#3D0B0F"/>
            <stop offset="100%" stop-color="#1F0407"/>
          </linearGradient>
        </defs>
        <rect width="144" height="144" rx="22" fill="url(#bgRndLive)"/>
        
        <!-- Live Header Bar -->
        <rect width="144" height="28" fill="#EF233C"/>
        <text x="72" y="19" fill="#FFFFFF" font-family="Segoe UI, Arial, sans-serif" font-size="11.5" font-weight="900" text-anchor="middle">● EN DIRECT • CUE #${currIdx + 1}</text>

        <!-- Center Cue Title -->
        ${renderLinesSvg(lines, 72, 60, '#FFFFFF', 18)}

        <!-- Countdown or Mode Indicator -->
        ${
          hasAuto
            ? `
            <rect x="22" y="85" width="100" height="18" rx="5" fill="#5E0B12"/>
            <rect x="22" y="85" width="${Math.round(100 * progressRatio)}" height="18" rx="5" fill="#EF233C"/>
            <text x="72" y="98.5" fill="#FFFFFF" font-family="Segoe UI, Arial, sans-serif" font-size="11.5" font-weight="900" text-anchor="middle">⏱ ${timerSec}</text>
          `
            : `
            <rect x="26" y="85" width="92" height="18" rx="5" fill="#5E0B12" stroke="#EF233C" stroke-width="1.5"/>
            <text x="72" y="98.5" fill="#FF8591" font-family="Segoe UI, Arial, sans-serif" font-size="11" font-weight="900" text-anchor="middle">MANUEL (CLIC SORT)</text>
          `
        }

        <!-- Bottom Action Bar -->
        <rect x="0" y="116" width="144" height="28" fill="#140204"/>
        <text x="72" y="134" fill="#FF8591" font-family="Segoe UI, Arial, sans-serif" font-size="10.5" font-weight="900" text-anchor="middle">CLIC : SORTIR / SUIVANT</text>

        <rect x="2.5" y="2.5" width="139" height="139" rx="19.5" fill="none" stroke="#EF233C" stroke-width="4"/>
      </svg>
    `);
  }

  // 2. In Transition
  if (isTransition) {
    return toDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 144 144">
        <defs>
          <linearGradient id="bgRndTrans" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#3A2A03"/>
            <stop offset="100%" stop-color="#1A1301"/>
          </linearGradient>
        </defs>
        <rect width="144" height="144" rx="22" fill="url(#bgRndTrans)"/>
        <rect width="144" height="28" fill="#FAB001"/>
        <text x="72" y="19" fill="#000000" font-family="Segoe UI, Arial, sans-serif" font-size="12" font-weight="900" text-anchor="middle">TRANSITION...</text>
        <path d="M50 72L94 72M76 56L94 72L76 88" stroke="#FAB001" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
        <text x="72" y="122" fill="#FFFFFF" font-family="Segoe UI, Arial, sans-serif" font-size="13" font-weight="800" text-anchor="middle">EN COURS</text>
        <rect x="2" y="2" width="140" height="140" rx="20" fill="none" stroke="#FAB001" stroke-width="3"/>
      </svg>
    `);
  }

  // 3. Ready / Next Cue is Precharged
  if (nextCue) {
    const asset = nextCue.asset || {};
    const title = asset.primaryText || 'Sans titre';
    const lines = wrapText(title, 11, 2);
    const modeStr = asset.mode === 'auto' ? `AUTO ${asset.duration || 6}s` : 'MANUEL';

    return toDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 144 144">
        <defs>
          <linearGradient id="bgRndNext" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#1F281E"/>
            <stop offset="100%" stop-color="#0E140E"/>
          </linearGradient>
        </defs>
        <rect width="144" height="144" rx="22" fill="url(#bgRndNext)"/>

        <!-- Header: Next Cue Index -->
        <rect width="144" height="28" fill="#FAB001"/>
        <text x="72" y="19" fill="#000000" font-family="Segoe UI, Arial, sans-serif" font-size="12" font-weight="900" text-anchor="middle">PRÊT ▶ CUE #${nextIdx + 1}</text>

        <!-- Center: Asset Name -->
        ${renderLinesSvg(lines, 72, 60, '#FFFFFF', 18)}

        <!-- Specs Badge -->
        <rect x="28" y="86" width="88" height="17" rx="4" fill="#141414" stroke="#FAB001" stroke-width="1.2"/>
        <text x="72" y="98.5" fill="#FAB001" font-family="Segoe UI, Arial, sans-serif" font-size="10.5" font-weight="800" text-anchor="middle">${esc(modeStr)}</text>

        <!-- Bottom: Action prompt -->
        <rect x="0" y="116" width="144" height="28" fill="#121812"/>
        <text x="72" y="134" fill="#69F0AE" font-family="Segoe UI, Arial, sans-serif" font-size="11.5" font-weight="900" text-anchor="middle">CLIC : NEXT CUE ▶</text>

        <rect x="2" y="2" width="140" height="140" rx="20" fill="none" stroke="#25C26E" stroke-width="3"/>
      </svg>
    `);
  }

  // 4. End of Conductor (All cues completed)
  if (items.length > 0 && nextIdx < 0) {
    return toDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 144 144">
        <defs>
          <linearGradient id="bgRndDone" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#0E331E"/>
            <stop offset="100%" stop-color="#07190F"/>
          </linearGradient>
        </defs>
        <rect width="144" height="144" rx="22" fill="url(#bgRndDone)"/>
        <rect width="144" height="28" fill="#25C26E"/>
        <text x="72" y="19" fill="#000000" font-family="Segoe UI, Arial, sans-serif" font-size="11.5" font-weight="900" text-anchor="middle">✔ CONDUCTEUR FINI</text>
        <circle cx="72" cy="66" r="16" fill="#25C26E"/>
        <path d="M64 66L70 72L80 59" stroke="#000000" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
        <text x="72" y="100" fill="#FFFFFF" font-family="Segoe UI, Arial, sans-serif" font-size="13" font-weight="800" text-anchor="middle">${items.length} Cues joués</text>
        <rect x="0" y="116" width="144" height="28" fill="#07190F"/>
        <text x="72" y="134" fill="#FAB001" font-family="Segoe UI, Arial, sans-serif" font-size="10.5" font-weight="900" text-anchor="middle">CLIC : RECOMMENCER</text>
        <rect x="2" y="2" width="140" height="140" rx="20" fill="none" stroke="#25C26E" stroke-width="3"/>
      </svg>
    `);
  }

  // 5. Empty Rundown
  return toDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 144 144">
      <defs>
        <linearGradient id="bgRndEmpty" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#1B1E26"/>
          <stop offset="100%" stop-color="#101217"/>
        </linearGradient>
      </defs>
      <rect width="144" height="144" rx="22" fill="url(#bgRndEmpty)"/>
      <rect width="144" height="28" fill="#404040"/>
      <text x="72" y="19" fill="#FFFFFF" font-family="Segoe UI, Arial, sans-serif" font-size="11.5" font-weight="900" text-anchor="middle">CONDUCTEUR</text>
      <rect x="52" y="52" width="40" height="30" rx="4" fill="none" stroke="#6C757D" stroke-width="3"/>
      <path d="M60 62H84M60 72H76" stroke="#6C757D" stroke-width="2.5" stroke-linecap="round"/>
      <text x="72" y="106" fill="#CED4DA" font-family="Segoe UI, Arial, sans-serif" font-size="13.5" font-weight="800" text-anchor="middle">VIDE (0 CUE)</text>
      <text x="72" y="125" fill="#6C757D" font-family="Segoe UI, Arial, sans-serif" font-size="10.5" font-weight="700" text-anchor="middle">Ajouter en Régie</text>
      <rect x="2" y="2" width="140" height="140" rx="20" fill="none" stroke="#FFFFFF" stroke-opacity="0.1" stroke-width="2"/>
    </svg>
  `);
}
