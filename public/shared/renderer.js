/* ==========================================================================
   Shared Broadcast Overlay & Preview Renderer (1920x1080 + Auto-Fit Thumbnail)
   Requires window.gsap
   ========================================================================== */
(function (global) {
  'use strict';

  const ANIM_TIMINGS = {
    'bouncy-rise': { in: 0.76, out: 0.46 },
    'elastic-wipe': { in: 0.82, out: 0.48 },
    'spring-cascade': { in: 0.86, out: 0.48 },
    'origami-unfold': { in: 0.84, out: 0.48 },
    'kinetic-slide': { in: 0.72, out: 0.44 },
    'shutter-reveal': { in: 0.78, out: 0.46 },
    'pop-elastic': { in: 0.82, out: 0.45 },
    'wave-stagger': { in: 0.88, out: 0.48 },
    'glitch-snap': { in: 0.64, out: 0.38 },
    'velvet-glide': { in: 0.92, out: 0.52 },
    'festive-sparkle': { in: 0.94, out: 0.50 },
    'snow-bounce': { in: 0.90, out: 0.48 },
    'whip-skew': { in: 0.70, out: 0.42 },
    'flip-3d': { in: 0.84, out: 0.46 }
  };

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

  function escapeHtml(str) {
    return String(str ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function sanitizeIconClass(icon) {
    if (!icon || typeof icon !== 'string') return '';
    return icon.replace(/[^a-zA-Z0-9\-\s]/g, '').trim();
  }

  function buildPatternLayer(pattern, color, opacity) {
    if (!pattern || pattern === 'none') return '';
    const op = Math.min(0.6, Math.max(0.04, Number(opacity) || 0.16));
    return `<span class="ov-pattern-overlay ov-pat-${escapeHtml(pattern)}" style="color:${color || '#000000'};--pat-opacity:${op};"></span>`;
  }

  // Crisp flat vector SVG & FontAwesome festive decorations (100% hard-edge for Fill & Key)
  function buildDecorHtml(decor, decorColor, accentColor) {
    if (!decor || decor === 'none') return '';
    const c1 = decorColor || '#FAB001';
    const c2 = accentColor || '#FFFFFF';

    if (decor === 'christmas') {
      const hollySvg = `
        <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M22 24C14 14 6 18 4 10C12 8 16 2 22 14Z" fill="#1B7A3E" stroke="#000" stroke-width="2"/>
          <path d="M22 24C30 14 38 18 40 10C32 8 28 2 22 14Z" fill="#239B56" stroke="#000" stroke-width="2"/>
          <circle cx="22" cy="21" r="5" fill="#E63946" stroke="#000" stroke-width="2"/>
          <circle cx="17" cy="26" r="4.5" fill="#D62828" stroke="#000" stroke-width="2"/>
          <circle cx="27" cy="26" r="4.5" fill="#E63946" stroke="#000" stroke-width="2"/>
        </svg>`;
      return `
        <div class="ov-decor-layer" data-decor="christmas">
          <div class="ov-garland-bar">
            <span class="ov-garland-bulb ov-decor-particle" style="background:#E63946"></span>
            <span class="ov-garland-bulb ov-decor-particle" style="background:#FAB001"></span>
            <span class="ov-garland-bulb ov-decor-particle" style="background:#2ECC71"></span>
            <span class="ov-garland-bulb ov-decor-particle" style="background:#FFFFFF"></span>
            <span class="ov-garland-bulb ov-decor-particle" style="background:#E63946"></span>
            <span class="ov-garland-bulb ov-decor-particle" style="background:#FAB001"></span>
          </div>
          <div class="ov-decor-badge pos-top-left" style="transform:rotate(-14deg);">${hollySvg}</div>
          <div class="ov-decor-particle" style="top:0px;right:18px;color:${c1};font-size:20px;"><i class="fa-solid fa-snowflake"></i></div>
          <div class="ov-decor-particle" style="bottom:4px;right:4px;color:#FFFFFF;font-size:16px;"><i class="fa-solid fa-snowflake"></i></div>
          <div class="ov-decor-particle" style="top:14px;left:-4px;color:#FFFFFF;font-size:14px;"><i class="fa-solid fa-star"></i></div>
        </div>`;
    }

    if (decor === 'christmas-hat') {
      const hatSvg = `
        <svg width="56" height="48" viewBox="0 0 56 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M8 34C12 14 28 6 46 18C38 22 32 28 36 34H8Z" fill="#D62828" stroke="#000" stroke-width="2.5" stroke-linejoin="round"/>
          <rect x="4" y="31" width="34" height="10" rx="5" fill="#FFFFFF" stroke="#000" stroke-width="2.5"/>
          <circle cx="47" cy="19" r="6.5" fill="#FFFFFF" stroke="#000" stroke-width="2.5"/>
        </svg>`;
      return `
        <div class="ov-decor-layer" data-decor="christmas-hat">
          <div class="ov-decor-badge pos-top-left" style="top:-6px;left:4px;transform:rotate(-12deg);">${hatSvg}</div>
          <div class="ov-decor-particle" style="top:4px;right:14px;color:${c1};font-size:22px;"><i class="fa-solid fa-snowflake"></i></div>
          <div class="ov-decor-particle" style="bottom:8px;right:2px;color:#FFFFFF;font-size:16px;"><i class="fa-solid fa-snowflake"></i></div>
        </div>`;
    }

    if (decor === 'snowflakes') {
      return `
        <div class="ov-decor-layer" data-decor="snowflakes">
          <div class="ov-decor-badge pos-top-left" style="color:${c1};font-size:26px;"><i class="fa-solid fa-snowflake"></i></div>
          <div class="ov-decor-particle" style="top:2px;right:14px;color:#FFFFFF;font-size:22px;"><i class="fa-solid fa-snowflake"></i></div>
          <div class="ov-decor-particle" style="bottom:4px;right:28px;color:${c1};font-size:16px;"><i class="fa-solid fa-snowflake"></i></div>
          <div class="ov-decor-particle" style="bottom:8px;left:22px;color:#FFFFFF;font-size:14px;"><i class="fa-solid fa-snowflake"></i></div>
        </div>`;
    }

    if (decor === 'newyear') {
      return `
        <div class="ov-decor-layer" data-decor="newyear">
          <div class="ov-decor-badge pos-top-left" style="color:${c1};font-size:26px;"><i class="fa-solid fa-champagne-glasses"></i></div>
          <div class="ov-decor-particle" style="top:0px;right:12px;color:${c1};font-size:22px;"><i class="fa-solid fa-wand-magic-sparkles"></i></div>
          <div class="ov-decor-particle" style="bottom:4px;right:6px;color:${c2};font-size:18px;"><i class="fa-solid fa-star"></i></div>
          <div class="ov-decor-particle" style="top:10px;right:48px;color:#FFFFFF;font-size:13px;"><i class="fa-solid fa-star"></i></div>
          <div class="ov-decor-particle" style="bottom:2px;left:18px;color:${c1};font-size:15px;"><i class="fa-solid fa-star"></i></div>
        </div>`;
    }

    if (decor === 'halloween') {
      return `
        <div class="ov-decor-layer" data-decor="halloween">
          <div class="ov-decor-badge pos-top-left" style="color:#FF6B00;font-size:26px;"><i class="fa-solid fa-ghost"></i></div>
          <div class="ov-decor-particle" style="top:0px;right:14px;color:${c1};font-size:22px;"><i class="fa-solid fa-spider"></i></div>
          <div class="ov-decor-particle" style="bottom:4px;right:8px;color:#9B5DE5;font-size:18px;"><i class="fa-solid fa-moon"></i></div>
          <div class="ov-decor-particle" style="top:8px;right:46px;color:#FF6B00;font-size:14px;"><i class="fa-solid fa-bolt"></i></div>
        </div>`;
    }

    if (decor === 'valentines') {
      return `
        <div class="ov-decor-layer" data-decor="valentines">
          <div class="ov-decor-badge pos-top-left" style="color:#FF2A6D;font-size:26px;transform:rotate(-12deg);"><i class="fa-solid fa-heart"></i></div>
          <div class="ov-decor-particle" style="top:2px;right:12px;color:#FF758F;font-size:20px;transform:rotate(14deg);"><i class="fa-solid fa-heart"></i></div>
          <div class="ov-decor-particle" style="bottom:6px;right:6px;color:${c1};font-size:16px;"><i class="fa-solid fa-heart"></i></div>
          <div class="ov-decor-particle" style="top:12px;right:42px;color:#FFFFFF;font-size:13px;"><i class="fa-solid fa-star"></i></div>
        </div>`;
    }

    if (decor === 'easter') {
      return `
        <div class="ov-decor-layer" data-decor="easter">
          <div class="ov-decor-badge pos-top-left" style="color:${c1};font-size:25px;transform:rotate(-10deg);"><i class="fa-solid fa-egg"></i></div>
          <div class="ov-decor-particle" style="top:2px;right:14px;color:#FF85A1;font-size:20px;"><i class="fa-solid fa-seedling"></i></div>
          <div class="ov-decor-particle" style="bottom:6px;right:8px;color:#70D6FF;font-size:17px;transform:rotate(18deg);"><i class="fa-solid fa-egg"></i></div>
        </div>`;
    }

    if (decor === 'summer') {
      return `
        <div class="ov-decor-layer" data-decor="summer">
          <div class="ov-decor-badge pos-top-left" style="color:#FFB703;font-size:28px;"><i class="fa-solid fa-sun"></i></div>
          <div class="ov-decor-particle" style="top:2px;right:14px;color:#00BBF9;font-size:20px;"><i class="fa-solid fa-umbrella-beach"></i></div>
          <div class="ov-decor-particle" style="bottom:4px;right:10px;color:${c1};font-size:16px;"><i class="fa-solid fa-water"></i></div>
        </div>`;
    }

    if (decor === 'confetti') {
      return `
        <div class="ov-decor-layer" data-decor="confetti">
          <span class="ov-decor-particle" style="top:4px;left:14px;width:12px;height:6px;background:#FF2A6D;border:1.5px solid #000;transform:rotate(-25deg);"></span>
          <span class="ov-decor-particle" style="top:2px;right:24px;width:10px;height:10px;border-radius:50%;background:#00F5D4;border:1.5px solid #000;"></span>
          <span class="ov-decor-particle" style="bottom:6px;right:10px;width:13px;height:6px;background:#FAB001;border:1.5px solid #000;transform:rotate(30deg);"></span>
          <span class="ov-decor-particle" style="top:14px;right:6px;width:9px;height:9px;background:#9B5DE5;border:1.5px solid #000;transform:rotate(15deg);"></span>
          <span class="ov-decor-particle" style="bottom:4px;left:28px;width:10px;height:5px;background:#00BBF9;border:1.5px solid #000;transform:rotate(-15deg);"></span>
        </div>`;
    }

    if (decor === 'trophy') {
      return `
        <div class="ov-decor-layer" data-decor="trophy">
          <div class="ov-decor-badge pos-top-left" style="color:${c1};font-size:25px;transform:rotate(-10deg);"><i class="fa-solid fa-crown"></i></div>
          <div class="ov-decor-particle" style="top:2px;right:14px;color:${c1};font-size:20px;"><i class="fa-solid fa-trophy"></i></div>
          <div class="ov-decor-particle" style="bottom:6px;right:8px;color:#FFFFFF;font-size:15px;"><i class="fa-solid fa-star"></i></div>
        </div>`;
    }

    if (decor === 'music') {
      return `
        <div class="ov-decor-layer" data-decor="music">
          <div class="ov-decor-badge pos-top-left" style="color:${c1};font-size:24px;"><i class="fa-solid fa-music"></i></div>
          <div class="ov-decor-particle" style="top:0px;right:16px;color:${c2};font-size:20px;"><i class="fa-solid fa-headphones"></i></div>
          <div class="ov-decor-particle" style="bottom:6px;right:8px;color:${c1};font-size:16px;"><i class="fa-solid fa-compact-disc"></i></div>
        </div>`;
    }

    if (decor === 'retro') {
      return `
        <div class="ov-decor-layer" data-decor="retro">
          <div class="ov-decor-badge pos-top-left" style="color:#00F5D4;font-size:24px;"><i class="fa-solid fa-gamepad"></i></div>
          <div class="ov-decor-particle" style="top:2px;right:14px;color:#FF2A6D;font-size:20px;"><i class="fa-solid fa-bolt"></i></div>
          <div class="ov-decor-particle" style="bottom:6px;right:8px;color:#FAB001;font-size:16px;"><i class="fa-solid fa-star"></i></div>
        </div>`;
    }

    if (decor === 'campus') {
      return `
        <div class="ov-decor-layer" data-decor="campus">
          <div class="ov-decor-badge pos-top-left" style="color:${c1};font-size:25px;transform:rotate(-8deg);"><i class="fa-solid fa-graduation-cap"></i></div>
          <div class="ov-decor-particle" style="top:4px;right:14px;color:${c1};font-size:18px;"><i class="fa-solid fa-award"></i></div>
        </div>`;
    }

    if (decor === 'fire') {
      return `
        <div class="ov-decor-layer" data-decor="fire">
          <div class="ov-decor-badge pos-top-left" style="color:#FF5400;font-size:26px;"><i class="fa-solid fa-fire-flame-curved"></i></div>
          <div class="ov-decor-particle" style="top:2px;right:14px;color:#FAB001;font-size:20px;"><i class="fa-solid fa-fire"></i></div>
          <div class="ov-decor-particle" style="bottom:6px;right:8px;color:#FF0054;font-size:16px;"><i class="fa-solid fa-bolt"></i></div>
        </div>`;
    }

    return '';
  }

  class OverlayRenderer {
    constructor(stageEl, options = {}) {
      this.stage = stageEl;
      this.isThumbnail = Boolean(options.thumbnail);
      this.tl = null;
      this.idleTl = null;
      this.currentAnchor = null;
      this.currentAsset = null;
    }

    killTimeline() {
      if (this.tl) {
        this.tl.kill();
        this.tl = null;
      }
      if (this.idleTl) {
        this.idleTl.kill();
        this.idleTl = null;
      }
    }

    cut() {
      this.killTimeline();
      this.stage.innerHTML = '';
      this.currentAnchor = null;
      this.currentAsset = null;
    }

    buildElement(asset) {
      const a = asset;
      const align = ['left', 'center', 'right'].includes(a.align) ? a.align : 'left';
      const layout = VALID_LAYOUTS.includes(a.layout) ? a.layout : 'layered';
      const scale = Number(a.scale) || 1;
      const posX = Number(a.posX) || 0;
      const posY = Number(a.posY) || 0;
      const radius = Math.max(0, Number(a.borderRadius) ?? 10);
      const padX = Math.max(8, Number(a.paddingX) ?? 24);
      const padY = Math.max(4, Number(a.paddingY) ?? 12);
      const accentW = Math.max(0, Number(a.accentWidth) ?? 6);
      const borderW = Math.max(0, Number(a.borderWidth) ?? 0);
      const borderCss = borderW > 0 ? `${borderW}px solid ${a.borderColor || '#000000'}` : 'none';

      const shadowOffset = Math.max(0, Number(a.shadowOffset) ?? 0);
      const shadowColor = a.shadowColor || '#000000';
      const shadowCss = shadowOffset > 0 ? `box-shadow:${shadowOffset}px ${shadowOffset}px 0px ${shadowColor};` : '';

      const skewX = Number(a.skewX) || 0;
      const gap = Math.max(0, Number(a.gap) ?? 6);

      const pFont = a.primaryFont ? `'${a.primaryFont}', 'Quicksand', sans-serif` : `'Quicksand', sans-serif`;
      const sFont = a.secondaryFont ? `'${a.secondaryFont}', 'Quicksand', sans-serif` : `'Quicksand', sans-serif`;

      const pLS = Number.isFinite(Number(a.primaryLetterSpacing))
        ? `${(Number(a.primaryLetterSpacing) / 100).toFixed(3)}em`
        : (a.primaryUppercase ? '0.04em' : '-0.01em');
      const sLS = Number.isFinite(Number(a.secondaryLetterSpacing))
        ? `${(Number(a.secondaryLetterSpacing) / 100).toFixed(3)}em`
        : (a.secondaryUppercase ? '0.06em' : '0.01em');

      const iconCls = sanitizeIconClass(a.icon);
      const hasIcon = Boolean(iconCls);
      const hasSecondary = Boolean(a.secondaryText && String(a.secondaryText).trim().length > 0);
      const hasTag = Boolean(a.tagText && String(a.tagText).trim().length > 0);

      const patternHtml = buildPatternLayer(a.pattern, a.primaryColor, a.patternOpacity);
      const patternCls = a.pattern && a.pattern !== 'none' ? 'ov-has-pattern' : '';
      const decorHtml = buildDecorHtml(a.decor, a.decorColor || a.accentColor, a.accentColor);

      const anchor = document.createElement('div');
      anchor.className = `ov-anchor align-${align}`;

      if (!this.isThumbnail) {
        anchor.style.bottom = `${posY}px`;
        if (align === 'left') {
          anchor.style.left = `${posX}px`;
        } else if (align === 'right') {
          anchor.style.right = `${posX}px`;
        } else {
          anchor.style.transform = `translateX(calc(-50% + ${posX}px))`;
        }
      } else {
        anchor.style.position = 'relative';
        anchor.style.left = 'auto';
        anchor.style.right = 'auto';
        anchor.style.bottom = 'auto';
      }

      const pTextStyle = [
        `font-family:${pFont}`,
        `font-size:${a.primarySize || 34}px`,
        `font-weight:${a.primaryWeight || 700}`,
        `color:${a.primaryColor || '#000000'}`,
        `letter-spacing:${pLS}`,
        a.primaryItalic ? 'font-style:italic' : 'font-style:normal',
        a.primaryUppercase ? 'text-transform:uppercase' : ''
      ].filter(Boolean).join(';');

      const sTextStyle = [
        `font-family:${sFont}`,
        `font-size:${a.secondarySize || 18}px`,
        `font-weight:${a.secondaryWeight || 600}`,
        `color:${a.secondaryColor || '#000000'}`,
        `letter-spacing:${sLS}`,
        a.secondaryItalic ? 'font-style:italic' : 'font-style:normal',
        a.secondaryUppercase ? 'text-transform:uppercase' : ''
      ].filter(Boolean).join(';');

      const iconSize = Math.round((a.primarySize || 34) * 0.68);
      const secPadX = Math.max(10, Math.round(padX * 0.82));
      const secPadY = Math.max(4, Math.round(padY * 0.58));
      const smallRadius = Math.max(0, Math.round(radius * 0.75));
      const accentBg = a.pattern === 'candy'
        ? 'repeating-linear-gradient(-45deg, #D62828 0px, #D62828 8px, #FFFFFF 8px, #FFFFFF 16px)'
        : (a.accentColor || '#FAB001');

      const tagHtml = hasTag
        ? `<div class="ov-tag-wrap">
             <div class="ov-tag" style="background:${a.tagBg || '#000000'};color:${a.tagColor || '#FAB001'};border-radius:${Math.min(radius, 8)}px;font-family:${sFont};border:${borderCss};${shadowCss}">
               <span class="ov-text-mask"><span class="ov-text-inner ov-anim-tag-text">${escapeHtml(a.tagText)}</span></span>
             </div>
           </div>`
        : '';

      let bodyHtml = '';

      if (layout === 'layered') {
        const secIndent = accentW > 0 ? accentW + 14 : 16;
        bodyHtml = `
          <div class="ov-layout-layered" style="--sec-indent:${secIndent}px;--ov-gap:${gap}px;">
            ${tagHtml}
            <div class="ov-main-row">
              ${accentW > 0 ? `<div class="ov-accent" style="width:${accentW}px;background:${accentBg};border-radius:${Math.min(radius, 99)}px;${shadowCss}"></div>` : ''}
              ${hasIcon ? `<div class="ov-icon-box" style="background:${a.iconBg || '#404040'};color:${a.iconColor || '#FAB001'};border-radius:${radius}px;padding:0 ${Math.round(padY * 0.95)}px;min-width:${Math.round((a.primarySize || 34) + padY * 2)}px;border:${borderCss};${shadowCss}"><i class="${iconCls} ov-anim-icon" style="font-size:${iconSize}px;"></i></div>` : ''}
              <div class="ov-primary-plate ${patternCls}" style="background:${a.primaryBg || '#FFFFFF'};padding:${padY}px ${padX}px;border-radius:${radius}px;border:${borderCss};${shadowCss}">
                ${patternHtml}
                <span class="ov-text-mask">
                  <span class="ov-text-inner ov-anim-p-text" style="${pTextStyle}">${escapeHtml(a.primaryText)}</span>
                </span>
              </div>
            </div>
            ${hasSecondary ? `
              <div class="ov-secondary-wrap">
                <div class="ov-secondary-plate" style="background:${a.secondaryBg || '#FAB001'};padding:${secPadY}px ${secPadX}px;border-radius:${smallRadius}px;border:${borderCss};${shadowCss}">
                  <span class="ov-text-mask">
                    <span class="ov-text-inner ov-anim-s-text" style="${sTextStyle}">${escapeHtml(a.secondaryText)}</span>
                  </span>
                </div>
              </div>
            ` : ''}
          </div>
        `;
      } else if (layout === 'split') {
        bodyHtml = `
          <div class="ov-layout-split" style="--ov-gap:${gap}px;">
            ${tagHtml}
            <div class="ov-split-shell" style="border-radius:${radius}px;border:${borderCss};${shadowCss}">
              ${accentW > 0 ? `<div class="ov-accent" style="width:${accentW}px;background:${accentBg};"></div>` : ''}
              ${hasIcon ? `<div class="ov-icon-box" style="background:${a.iconBg || '#000000'};color:${a.iconColor || '#FAB001'};"><i class="${iconCls} ov-anim-icon" style="font-size:${Math.round(iconSize * 1.1)}px;"></i></div>` : ''}
              <div class="ov-split-stack">
                <div class="ov-primary-plate ${patternCls}" style="background:${a.primaryBg || '#404040'};padding:${padY}px ${padX}px;">
                  ${patternHtml}
                  <span class="ov-text-mask">
                    <span class="ov-text-inner ov-anim-p-text" style="${pTextStyle}">${escapeHtml(a.primaryText)}</span>
                  </span>
                </div>
                ${hasSecondary ? `
                  <div class="ov-secondary-plate" style="background:${a.secondaryBg || '#FAB001'};padding:${secPadY}px ${padX}px;">
                    <span class="ov-text-mask">
                      <span class="ov-text-inner ov-anim-s-text" style="${sTextStyle}">${escapeHtml(a.secondaryText)}</span>
                    </span>
                  </div>
                ` : ''}
              </div>
            </div>
          </div>
        `;
      } else if (layout === 'capsule') {
        const capRadius = Math.max(radius, 28);
        const badgeDim = Math.round((a.primarySize || 34) + padY * 1.15);
        const outerPadLeft = hasIcon ? Math.max(8, Math.round(padY * 0.55)) : padX;
        bodyHtml = `
          <div class="ov-layout-capsule" style="--ov-gap:${gap}px;">
            ${tagHtml}
            <div class="ov-primary-plate ${patternCls}" style="background:${a.primaryBg || '#000000'};padding:${Math.max(6, Math.round(padY * 0.65))}px ${padX}px ${Math.max(6, Math.round(padY * 0.65))}px ${align === 'right' ? padX : outerPadLeft}px;${align === 'right' && hasIcon ? `padding-right:${outerPadLeft}px;` : ''}border-radius:${capRadius}px;border:${borderCss};${shadowCss}">
              ${patternHtml}
              ${hasIcon ? `<div class="ov-icon-box" style="width:${badgeDim}px;height:${badgeDim}px;background:${a.iconBg || '#FAB001'};color:${a.iconColor || '#000000'};"><i class="${iconCls} ov-anim-icon" style="font-size:${Math.round(iconSize * 0.92)}px;"></i></div>` : ''}
              <span class="ov-text-mask">
                <span class="ov-text-inner ov-anim-p-text" style="${pTextStyle}">${escapeHtml(a.primaryText)}</span>
              </span>
            </div>
            ${hasSecondary ? `
              <div class="ov-secondary-wrap">
                <div class="ov-secondary-plate" style="background:${a.secondaryBg || '#FFFFFF'};padding:${secPadY}px ${secPadX}px;border-radius:${capRadius}px;border:${borderCss};${shadowCss}">
                  ${accentW > 0 ? `<span class="ov-accent-dot ov-accent" style="width:${Math.max(8, accentW + 2)}px;height:${Math.max(8, accentW + 2)}px;background:${accentBg};"></span>` : ''}
                  <span class="ov-text-mask">
                    <span class="ov-text-inner ov-anim-s-text" style="${sTextStyle}">${escapeHtml(a.secondaryText)}</span>
                  </span>
                </div>
              </div>
            ` : ''}
          </div>
        `;
      } else if (layout === 'minimal') {
        const minIconSize = Math.round((a.primarySize || 24) * 0.72);
        const minIconDim = Math.round((a.primarySize || 24) + padY * 0.9);
        const bottomAccent = align === 'center' && accentW > 0;
        const sideAccent = align !== 'center' && accentW > 0;
        bodyHtml = `
          <div class="ov-layout-minimal" style="--ov-gap:${gap}px;">
            ${tagHtml}
            <div class="ov-minimal-bar ov-primary-plate ${patternCls}" style="background:${a.primaryBg || '#404040'};border-radius:${radius}px;border:${borderCss};${shadowCss}">
              ${patternHtml}
              ${sideAccent ? `<div class="ov-accent ov-accent-side" style="width:${accentW}px;background:${accentBg};"></div>` : ''}
              <div class="ov-minimal-inner" style="padding:${padY}px ${padX}px ${bottomAccent ? padY + Math.max(2, Math.round(accentW * 0.6)) : padY}px ${padX}px;">
                ${hasIcon ? `<div class="ov-icon-box" style="width:${minIconDim}px;height:${minIconDim}px;background:${a.iconBg || '#FAB001'};color:${a.iconColor || '#000000'};border-radius:${Math.min(radius, 99)}px;"><i class="${iconCls} ov-anim-icon" style="font-size:${minIconSize}px;"></i></div>` : ''}
                ${hasSecondary ? `
                  <div class="ov-secondary-badge ov-secondary-plate" style="background:${a.secondaryBg || '#FAB001'};border-radius:${Math.max(4, Math.min(smallRadius, 99))}px;">
                    <span class="ov-text-mask">
                      <span class="ov-text-inner ov-anim-s-text" style="${sTextStyle}">${escapeHtml(a.secondaryText)}</span>
                    </span>
                  </div>
                ` : ''}
                <span class="ov-text-mask">
                  <span class="ov-text-inner ov-anim-p-text" style="${pTextStyle}">${escapeHtml(a.primaryText)}</span>
                </span>
              </div>
              ${bottomAccent ? `<div class="ov-accent ov-accent-bottom" style="height:${accentW}px;background:${accentBg};"></div>` : ''}
            </div>
          </div>
        `;
      } else if (layout === 'editorial') {
        bodyHtml = `
          <div class="ov-layout-editorial" style="--ov-gap:${gap}px;">
            ${tagHtml}
            <div class="ov-ed-body">
              <div class="ov-accent" style="width:${Math.max(6, accentW)}px;background:${accentBg};margin-right:${align === 'right' ? 0 : 12}px;margin-left:${align === 'right' ? 12 : 0}px;border-radius:3px;"></div>
              <div class="ov-ed-plates">
                <div class="ov-primary-plate ${patternCls}" style="background:${a.primaryBg || '#FFFFFF'};padding:${padY}px ${padX}px;border-radius:${radius}px ${radius}px 0 0;border:${borderCss};${shadowCss}">
                  ${patternHtml}
                  ${hasIcon ? `<i class="${iconCls} ov-anim-icon" style="font-size:${iconSize}px;color:${a.iconColor || a.accentColor || '#FAB001'};z-index:2;"></i>` : ''}
                  <span class="ov-text-mask">
                    <span class="ov-text-inner ov-anim-p-text" style="${pTextStyle}">${escapeHtml(a.primaryText)}</span>
                  </span>
                </div>
                <div class="ov-ed-rule" style="background:${accentBg};"></div>
                ${hasSecondary ? `
                  <div class="ov-secondary-plate" style="background:${a.secondaryBg || '#000000'};padding:${secPadY}px ${secPadX}px;border-radius:0 0 ${smallRadius}px ${smallRadius}px;border:${borderCss};${shadowCss}">
                    <span class="ov-text-mask">
                      <span class="ov-text-inner ov-anim-s-text" style="${sTextStyle}">${escapeHtml(a.secondaryText)}</span>
                    </span>
                  </div>
                ` : ''}
              </div>
            </div>
          </div>
        `;
      } else if (layout === 'brutalist') {
        const bBorder = `${Math.max(3, borderW || 3)}px solid ${a.borderColor || '#000000'}`;
        const bShadow = `box-shadow:${Math.max(6, shadowOffset || 7)}px ${Math.max(6, shadowOffset || 7)}px 0px ${shadowColor};`;
        bodyHtml = `
          <div class="ov-layout-brutalist" style="--ov-gap:${gap}px;">
            ${tagHtml}
            <div class="ov-brut-top">
              ${hasIcon ? `<div class="ov-icon-box" style="background:${a.iconBg || '#FAB001'};color:${a.iconColor || '#000000'};border:${bBorder};border-radius:${radius}px;padding:0 ${Math.round(padY * 1.05)}px;${bShadow}"><i class="${iconCls} ov-anim-icon" style="font-size:${iconSize}px;"></i></div>` : ''}
              <div class="ov-primary-plate ${patternCls}" style="background:${a.primaryBg || '#FFFFFF'};padding:${padY}px ${padX}px;border:${bBorder};border-radius:${radius}px;${bShadow}">
                ${patternHtml}
                <span class="ov-text-mask">
                  <span class="ov-text-inner ov-anim-p-text" style="${pTextStyle}">${escapeHtml(a.primaryText)}</span>
                </span>
              </div>
            </div>
            ${hasSecondary ? `
              <div class="ov-secondary-plate" style="background:${a.secondaryBg || '#FAB001'};padding:${secPadY}px ${secPadX}px;border:${bBorder};border-radius:${smallRadius}px;${bShadow}">
                <span class="ov-text-mask">
                  <span class="ov-text-inner ov-anim-s-text" style="${sTextStyle}">${escapeHtml(a.secondaryText)}</span>
                </span>
              </div>
            ` : ''}
          </div>
        `;
      } else if (layout === 'ribbon') {
        bodyHtml = `
          <div class="ov-layout-ribbon" style="--ov-gap:${gap}px;">
            ${tagHtml}
            <div class="ov-rib-main" style="${shadowCss}">
              ${accentW > 0 ? `<div class="ov-accent" style="width:${Math.max(8, accentW)}px;background:${accentBg};"></div>` : ''}
              ${hasIcon ? `<div class="ov-icon-box" style="background:${a.iconBg || '#000000'};color:${a.iconColor || '#FAB001'};padding:0 20px;display:inline-flex;align-items:center;"><i class="${iconCls} ov-anim-icon" style="font-size:${iconSize}px;"></i></div>` : ''}
              <div class="ov-primary-plate ${patternCls}" style="background:${a.primaryBg || '#FFFFFF'};padding:${padY}px ${padX + 14}px ${padY}px ${padX}px;">
                ${patternHtml}
                <span class="ov-text-mask">
                  <span class="ov-text-inner ov-anim-p-text" style="${pTextStyle}">${escapeHtml(a.primaryText)}</span>
                </span>
              </div>
            </div>
            ${hasSecondary ? `
              <div class="ov-secondary-plate" style="background:${a.secondaryBg || '#FAB001'};padding:${secPadY}px ${secPadX + 12}px ${secPadY}px ${secPadX}px;${shadowCss}">
                <span class="ov-text-mask">
                  <span class="ov-text-inner ov-anim-s-text" style="${sTextStyle}">${escapeHtml(a.secondaryText)}</span>
                </span>
              </div>
            ` : ''}
          </div>
        `;
      } else if (layout === 'floating') {
        const floatDim = Math.round((a.primarySize || 34) + padY * 1.9);
        bodyHtml = `
          <div class="ov-layout-floating" style="--ov-gap:${Math.max(8, gap)}px;">
            ${tagHtml}
            <div class="ov-float-row">
              ${hasIcon ? `<div class="ov-icon-box" style="width:${floatDim}px;height:${floatDim}px;background:${a.iconBg || '#FAB001'};color:${a.iconColor || '#000000'};border-radius:${Math.max(radius, 16)}px;border:${borderCss};${shadowCss}"><i class="${iconCls} ov-anim-icon" style="font-size:${iconSize}px;"></i></div>` : ''}
              <div class="ov-primary-plate ${patternCls}" style="background:${a.primaryBg || '#FFFFFF'};padding:${padY}px ${padX}px;border-radius:${Math.max(radius, 14)}px;border:${borderCss};${shadowCss}">
                ${patternHtml}
                <span class="ov-text-mask">
                  <span class="ov-text-inner ov-anim-p-text" style="${pTextStyle}">${escapeHtml(a.primaryText)}</span>
                </span>
              </div>
            </div>
            ${hasSecondary ? `
              <div class="ov-float-row">
                ${accentW > 0 ? `<div class="ov-accent" style="width:${Math.max(18, accentW * 2)}px;height:${Math.max(8, accentW)}px;background:${accentBg};border-radius:99px;"></div>` : ''}
                <div class="ov-secondary-plate" style="background:${a.secondaryBg || '#404040'};padding:${secPadY}px ${secPadX}px;border-radius:${Math.max(smallRadius, 10)}px;border:${borderCss};${shadowCss}">
                  <span class="ov-text-mask">
                    <span class="ov-text-inner ov-anim-s-text" style="${sTextStyle}">${escapeHtml(a.secondaryText)}</span>
                  </span>
                </div>
              </div>
            ` : ''}
          </div>
        `;
      } else if (layout === 'frame') {
        const frameBorder = `2px solid ${a.accentColor || '#FAB001'}`;
        bodyHtml = `
          <div class="ov-layout-frame" style="--ov-gap:${gap}px;">
            ${tagHtml}
            <div class="ov-frame-outer" style="border:${frameBorder};border-radius:${radius + 4}px;background:rgba(0,0,0,0.85);${shadowCss}">
              <div class="ov-frame-inner ov-primary-plate ${patternCls}" style="background:${a.primaryBg || '#141414'};padding:${padY}px ${padX}px;border-radius:${radius}px;border:1px solid ${a.accentColor || '#FAB001'};">
                ${patternHtml}
                ${hasIcon ? `<div class="ov-icon-box" style="width:${Math.round(iconSize * 1.7)}px;height:${Math.round(iconSize * 1.7)}px;background:${a.iconBg || '#FAB001'};color:${a.iconColor || '#000000'};border-radius:50%;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;z-index:2;"><i class="${iconCls} ov-anim-icon" style="font-size:${iconSize}px;"></i></div>` : ''}
                <div class="ov-frame-texts" style="z-index:2;">
                  <span class="ov-text-mask">
                    <span class="ov-text-inner ov-anim-p-text" style="${pTextStyle}">${escapeHtml(a.primaryText)}</span>
                  </span>
                  ${hasSecondary ? `
                    <div class="ov-secondary-badge ov-secondary-plate" style="background:${a.secondaryBg || '#FAB001'};padding:${Math.max(3, Math.round(secPadY * 0.65))}px ${secPadX}px;border-radius:${smallRadius}px;">
                      <span class="ov-text-mask">
                        <span class="ov-text-inner ov-anim-s-text" style="${sTextStyle}">${escapeHtml(a.secondaryText)}</span>
                      </span>
                    </div>
                  ` : ''}
                </div>
              </div>
            </div>
          </div>
        `;
      } else if (layout === 'banner') {
        bodyHtml = `
          <div class="ov-layout-banner" style="--ov-gap:${gap}px;">
            ${tagHtml}
            <div class="ov-banner-shell ov-split-shell" style="border-radius:${radius}px;border:${borderCss};${shadowCss}">
              <div class="ov-accent" style="height:${Math.max(4, accentW)}px;width:100%;background:${accentBg};"></div>
              <div class="ov-banner-top">
                ${hasIcon ? `<div class="ov-icon-box" style="background:${a.iconBg || '#FAB001'};color:${a.iconColor || '#000000'};padding:0 20px;"><i class="${iconCls} ov-anim-icon" style="font-size:${iconSize}px;"></i></div>` : ''}
                <div class="ov-primary-plate ${patternCls}" style="background:${a.primaryBg || '#FFFFFF'};padding:${padY}px ${padX}px;">
                  ${patternHtml}
                  <span class="ov-text-mask">
                    <span class="ov-text-inner ov-anim-p-text" style="${pTextStyle}">${escapeHtml(a.primaryText)}</span>
                  </span>
                </div>
              </div>
              ${hasSecondary ? `
                <div class="ov-banner-bottom ov-secondary-plate" style="background:${a.secondaryBg || '#000000'};padding:${secPadY}px ${padX}px;">
                  <span class="ov-text-mask">
                    <span class="ov-text-inner ov-anim-s-text" style="${sTextStyle}">${escapeHtml(a.secondaryText)}</span>
                  </span>
                  <span style="width:10px;height:10px;border-radius:50%;background:${a.accentColor || '#FAB001'};"></span>
                </div>
              ` : ''}
            </div>
          </div>
        `;
      } else if (layout === 'badge-card') {
        const medDim = Math.round((a.primarySize || 36) * 1.9 + padY);
        bodyHtml = `
          <div class="ov-layout-badge-card" style="--ov-gap:${gap}px;">
            ${tagHtml}
            <div class="ov-bcard-row">
              ${hasIcon ? `<div class="ov-icon-box" style="width:${medDim}px;height:${medDim}px;border-radius:50%;background:${a.iconBg || '#FAB001'};color:${a.iconColor || '#000000'};border:4px solid ${a.accentColor || '#FFFFFF'};${shadowCss}"><i class="${iconCls} ov-anim-icon" style="font-size:${Math.round(iconSize * 1.18)}px;"></i></div>` : ''}
              <div class="ov-bcard-body">
                <div class="ov-primary-plate ${patternCls}" style="background:${a.primaryBg || '#404040'};padding:${padY}px ${padX}px ${padY}px ${hasIcon && align !== 'right' ? padX + 16 : padX}px;border-radius:${radius}px;border:${borderCss};${shadowCss}">
                  ${patternHtml}
                  <span class="ov-text-mask">
                    <span class="ov-text-inner ov-anim-p-text" style="${pTextStyle}">${escapeHtml(a.primaryText)}</span>
                  </span>
                </div>
                ${hasSecondary ? `
                  <div class="ov-secondary-plate" style="background:${a.secondaryBg || '#FAB001'};padding:${secPadY}px ${secPadX}px;margin-top:${Math.max(4, gap)}px;margin-left:${hasIcon && align === 'left' ? 20 : 0}px;border-radius:${smallRadius}px;border:${borderCss};${shadowCss}">
                    <span class="ov-text-mask">
                      <span class="ov-text-inner ov-anim-s-text" style="${sTextStyle}">${escapeHtml(a.secondaryText)}</span>
                    </span>
                  </div>
                ` : ''}
              </div>
            </div>
          </div>
        `;
      } else {
        bodyHtml = `
          <div class="ov-layout-ticket" style="--ov-gap:${gap}px;">
            ${tagHtml}
            <div class="ov-ticket-shell ov-split-shell" style="border-radius:${radius}px;border:${Math.max(2, borderW || 2)}px solid ${a.borderColor || a.accentColor || '#FAB001'};overflow:hidden;${shadowCss}">
              <div class="ov-ticket-stub ov-icon-box" style="background:${a.iconBg || a.accentColor || '#FAB001'};color:${a.iconColor || '#000000'};padding:0 22px;">
                <i class="${hasIcon ? iconCls : 'fa-solid fa-ticket'} ov-anim-icon" style="font-size:${Math.round(iconSize * 1.15)}px;"></i>
              </div>
              <div class="ov-ticket-main ov-primary-plate ${patternCls}" style="background:${a.primaryBg || '#FFFFFF'};padding:${padY}px ${padX}px;">
                ${patternHtml}
                <span class="ov-text-mask">
                  <span class="ov-text-inner ov-anim-p-text" style="${pTextStyle}">${escapeHtml(a.primaryText)}</span>
                </span>
                ${hasSecondary ? `
                  <div class="ov-secondary-plate" style="background:${a.secondaryBg || '#000000'};padding:${Math.max(3, Math.round(secPadY * 0.7))}px ${secPadX}px;margin-top:6px;border-radius:${smallRadius}px;align-self:flex-start;">
                    <span class="ov-text-mask">
                      <span class="ov-text-inner ov-anim-s-text" style="${sTextStyle}">${escapeHtml(a.secondaryText)}</span>
                    </span>
                  </div>
                ` : ''}
              </div>
            </div>
          </div>
        `;
      }

      anchor.innerHTML = `
        <div class="ov-scale-box" style="${this.isThumbnail ? 'transform-origin:center center;' : `transform:scale(${scale});`}">
          <div class="ov-motion-rig" data-radius="${radius}" data-align="${align}" data-layout="${layout}">
            <div class="ov-skew-wrap" style="${skewX !== 0 ? `transform:skewX(${skewX}deg);` : ''}">
              ${decorHtml}
              ${bodyHtml}
            </div>
          </div>
        </div>
      `;

      return anchor;
    }

    fitThumbnail(anchorEl) {
      if (!this.isThumbnail || !anchorEl) return;
      const scaleBox = anchorEl.querySelector('.ov-scale-box');
      const rig = anchorEl.querySelector('.ov-motion-rig');
      if (!scaleBox || !rig) return;

      scaleBox.style.transform = 'scale(1)';
      const parentW = this.stage.clientWidth || 360;
      const parentH = this.stage.clientHeight || 166;
      const rigW = Math.max(180, rig.offsetWidth + 56);
      const rigH = Math.max(70, rig.offsetHeight + 44);

      const availW = Math.max(160, parentW - 28);
      const availH = Math.max(70, parentH - 42);
      const fitScale = Math.min(0.55, availW / rigW, availH / rigH);

      scaleBox.style.transformOrigin = 'center center';
      scaleBox.style.transform = `scale(${fitScale.toFixed(4)})`;
    }

    renderStatic(asset) {
      this.killTimeline();
      this.stage.innerHTML = '';
      if (!asset) {
        this.currentAnchor = null;
        this.currentAsset = null;
        return;
      }
      const el = this.buildElement(asset);
      this.stage.appendChild(el);
      if (this.isThumbnail) {
        this.fitThumbnail(el);
      }
      this.currentAnchor = el;
      this.currentAsset = asset;
    }

    getOffscreenTravel(anchorEl, asset) {
      const scale = Math.max(0.2, Number(asset?.scale) || 1);
      const posY = Math.max(0, Number(asset?.posY) || 0);
      const posX = Math.max(0, Number(asset?.posX) || 0);
      const rig = anchorEl.querySelector('.ov-motion-rig');
      const rigH = rig ? rig.offsetHeight : 160;
      const rigW = rig ? rig.offsetWidth : 520;
      if (this.isThumbnail) {
        return {
          y: Math.ceil(rigH + 90),
          x: Math.ceil(rigW + 120)
        };
      }
      return {
        y: Math.ceil(posY / scale + rigH + 64),
        x: Math.ceil(posX / scale + rigW + 90)
      };
    }

    startDecorIdleLoop(el, gsap) {
      const particles = el.querySelectorAll('.ov-decor-particle');
      const badge = el.querySelector('.ov-decor-badge');
      if (!particles.length && !badge) return;

      this.idleTl = gsap.timeline({ repeat: -1, yoyo: true });
      if (badge) {
        this.idleTl.to(
          badge,
          { rotation: '+=8', y: -3, duration: 1.4, ease: 'sine.inOut' },
          0
        );
      }
      if (particles.length) {
        this.idleTl.to(
          particles,
          {
            y: -4,
            scale: 1.12,
            rotation: '+=15',
            duration: 1.1,
            stagger: 0.15,
            ease: 'sine.inOut'
          },
          0
        );
      }
    }

    playIn(asset, onComplete) {
      this.killTimeline();
      this.stage.innerHTML = '';
      if (!asset) return;

      const el = this.buildElement(asset);
      this.stage.appendChild(el);
      if (this.isThumbnail) {
        this.fitThumbnail(el);
      }
      this.currentAnchor = el;
      this.currentAsset = asset;

      const gsap = global.gsap;
      if (!gsap) {
        if (onComplete) onComplete();
        return;
      }

      const style = ANIM_TIMINGS[asset.animStyle] ? asset.animStyle : 'bouncy-rise';
      const speed = Math.min(2.2, Math.max(0.4, Number(asset.animSpeed) || 1));
      const bounce = Math.min(2.4, Math.max(0.4, Number(asset.animBounce) || 1));
      const dir = ['bottom', 'left', 'right', 'top', 'scale'].includes(asset.animDirection)
        ? asset.animDirection
        : 'bottom';

      const rig = el.querySelector('.ov-motion-rig');
      const align = rig?.dataset.align || 'left';
      const layout = rig?.dataset.layout || 'layered';
      const radius = Number(rig?.dataset.radius || 10);

      const accent = el.querySelector('.ov-accent');
      const iconBox = el.querySelector('.ov-icon-box');
      const iconGlyph = el.querySelector('.ov-anim-icon');
      const splitShell = el.querySelector('.ov-split-shell');
      const primaryPlate = el.querySelector('.ov-primary-plate');
      const secondaryPlate = el.querySelector('.ov-secondary-plate');
      const pText = el.querySelector('.ov-anim-p-text');
      const sText = el.querySelector('.ov-anim-s-text');
      const tag = el.querySelector('.ov-tag');
      const decorBadge = el.querySelector('.ov-decor-badge');
      const decorParticles = el.querySelectorAll('.ov-decor-particle');

      const travel = this.getOffscreenTravel(el, asset);
      const fromVec = { x: 0, y: 0 };
      if (dir === 'bottom') fromVec.y = travel.y;
      else if (dir === 'top') fromVec.y = -travel.y;
      else if (dir === 'left') fromVec.x = -travel.x;
      else if (dir === 'right') fromVec.x = travel.x;

      const backMain = `back.out(${(1.68 * bounce).toFixed(2)})`;
      const backSoft = `back.out(${(1.42 * bounce).toFixed(2)})`;
      const backStrong = `back.out(${(2.2 * bounce).toFixed(2)})`;
      const elasticOut = `elastic.out(${(1.05 * Math.min(1.5, bounce)).toFixed(2)}, ${Math.max(0.28, (0.48 / bounce)).toFixed(2)})`;

      const tl = gsap.timeline({
        defaults: { overwrite: 'auto' },
        onComplete: () => {
          this.startDecorIdleLoop(el, gsap);
          if (onComplete) onComplete();
        }
      });
      this.tl = tl;

      const clipClosed =
        align === 'center'
          ? `inset(0% 50% 0% 50% round ${radius}px)`
          : align === 'right'
          ? `inset(0% 0% 0% 100% round ${radius}px)`
          : `inset(0% 100% 0% 0% round ${radius}px)`;
      const clipOpen = `inset(0% 0% 0% 0% round ${radius}px)`;

      if (decorBadge) {
        tl.fromTo(
          decorBadge,
          { scale: 0, rotation: -35 },
          { scale: 1, rotation: -10, duration: 0.55 * speed, ease: backStrong },
          0.22 * speed
        );
      }
      if (decorParticles.length > 0) {
        tl.fromTo(
          decorParticles,
          { scale: 0, y: 18, rotation: -45 },
          { scale: 1, y: 0, rotation: 0, duration: 0.5 * speed, stagger: 0.04 * speed, ease: backStrong },
          0.26 * speed
        );
      }

      if (style === 'bouncy-rise') {
        tl.fromTo(
          rig,
          dir === 'scale'
            ? { scale: 0.2, transformOrigin: '50% 100%' }
            : { x: fromVec.x, y: fromVec.y, scaleY: 1.06, scaleX: 0.96, transformOrigin: '50% 100%' },
          { x: 0, y: 0, scale: 1, scaleY: 1, scaleX: 1, duration: 0.62 * speed, ease: backMain },
          0
        );

        if (accent) {
          const isHoriz = accent.classList.contains('ov-accent-bottom');
          tl.fromTo(
            accent,
            isHoriz ? { scaleX: 0 } : { scaleY: 0, transformOrigin: '50% 100%' },
            isHoriz
              ? { scaleX: 1, duration: 0.52 * speed, ease: backStrong }
              : { scaleY: 1, duration: 0.48 * speed, ease: backStrong },
            0.05 * speed
          );
        }

        if (iconBox) {
          tl.fromTo(
            iconBox,
            { scale: 0.5, y: 24 },
            { scale: 1, y: 0, duration: 0.48 * speed, ease: backStrong },
            0.06 * speed
          );
        }
        if (iconGlyph) {
          tl.fromTo(
            iconGlyph,
            { y: 16, scale: 0.65 },
            { y: 0, scale: 1, duration: 0.44 * speed, ease: backStrong },
            0.14 * speed
          );
        }

        const wipeTarget = splitShell || primaryPlate;
        if (wipeTarget && layout !== 'ribbon') {
          tl.fromTo(
            wipeTarget,
            { clipPath: clipClosed },
            { clipPath: clipOpen, duration: 0.54 * speed, ease: 'expo.out', clearProps: 'clipPath' },
            0.06 * speed
          );
        }

        if (pText) {
          tl.fromTo(pText, { yPercent: 120 }, { yPercent: 0, duration: 0.52 * speed, ease: backSoft }, 0.14 * speed);
        }
        if (secondaryPlate) {
          tl.fromTo(
            secondaryPlate,
            { y: 20, scale: 0.9 },
            { y: 0, scale: 1, duration: 0.48 * speed, ease: backSoft },
            0.18 * speed
          );
        }
        if (sText) {
          tl.fromTo(sText, { yPercent: 120 }, { yPercent: 0, duration: 0.46 * speed, ease: backSoft }, 0.24 * speed);
        }
        if (tag) {
          tl.fromTo(tag, { y: 18, scale: 0.8 }, { y: 0, scale: 1, duration: 0.42 * speed, ease: backStrong }, 0.22 * speed);
        }
      } else if (style === 'elastic-wipe') {
        tl.fromTo(
          rig,
          { x: fromVec.x, y: fromVec.y },
          { x: 0, y: 0, duration: 0.54 * speed, ease: backSoft },
          0
        );

        const wipeTarget = splitShell || primaryPlate;
        if (wipeTarget && layout !== 'ribbon') {
          tl.fromTo(
            wipeTarget,
            { clipPath: clipClosed, x: align === 'right' ? 24 : -24 },
            { clipPath: clipOpen, x: 0, duration: 0.62 * speed, ease: backSoft, clearProps: 'clipPath' },
            0.12 * speed
          );
        }
        if (iconBox) {
          tl.fromTo(iconBox, { scale: 0 }, { scale: 1, duration: 0.48 * speed, ease: backStrong }, 0.08 * speed);
        }
        if (pText) {
          tl.fromTo(pText, { yPercent: 120 }, { yPercent: 0, duration: 0.5 * speed, ease: backSoft }, 0.2 * speed);
        }
        if (secondaryPlate) {
          tl.fromTo(secondaryPlate, { scaleX: 0, transformOrigin: '0% 50%' }, { scaleX: 1, duration: 0.5 * speed, ease: 'expo.out' }, 0.22 * speed);
        }
        if (sText) {
          tl.fromTo(sText, { yPercent: 120 }, { yPercent: 0, duration: 0.46 * speed, ease: backSoft }, 0.28 * speed);
        }
      } else if (style === 'spring-cascade') {
        const parts = [accent, iconBox, splitShell || primaryPlate, secondaryPlate, tag].filter(Boolean);
        const topLevelParts = parts.filter((node) => !parts.some((other) => other !== node && other.contains(node)));

        tl.set(rig, { x: 0, y: 0 });
        tl.fromTo(
          topLevelParts,
          { x: fromVec.x, y: fromVec.y || travel.y, scaleY: 1.08, transformOrigin: '50% 100%' },
          {
            x: 0,
            y: 0,
            scaleY: 1,
            duration: 0.68 * speed,
            stagger: 0.065 * speed,
            ease: backMain
          },
          0
        );
        if (pText) tl.fromTo(pText, { yPercent: 120 }, { yPercent: 0, duration: 0.48 * speed, ease: backSoft }, 0.18 * speed);
        if (sText) tl.fromTo(sText, { yPercent: 120 }, { yPercent: 0, duration: 0.48 * speed, ease: backSoft }, 0.26 * speed);
      } else if (style === 'origami-unfold') {
        tl.fromTo(
          rig,
          { y: 60, rotationX: -85, transformOrigin: '50% 100%' },
          { y: 0, rotationX: 0, duration: 0.56 * speed, ease: backMain },
          0
        );
        if (iconBox) {
          tl.fromTo(
            iconBox,
            { rotationY: -90, transformOrigin: '100% 50%' },
            { rotationY: 0, duration: 0.5 * speed, ease: backStrong },
            0.12 * speed
          );
        }
        if (secondaryPlate) {
          tl.fromTo(
            secondaryPlate,
            { rotationX: -90, transformOrigin: '50% 0%' },
            { rotationX: 0, duration: 0.52 * speed, ease: backMain },
            0.22 * speed
          );
        }
        if (tag) {
          tl.fromTo(
            tag,
            { rotationX: 90, transformOrigin: '50% 100%' },
            { rotationX: 0, duration: 0.44 * speed, ease: backStrong },
            0.28 * speed
          );
        }
      } else if (style === 'kinetic-slide') {
        const slideX = align === 'right' ? travel.x : -travel.x;
        tl.fromTo(
          rig,
          { x: slideX, skewX: align === 'right' ? 18 : -18 },
          { x: 0, skewX: 0, duration: 0.54 * speed, ease: 'expo.out' },
          0
        );
        if (secondaryPlate) {
          tl.fromTo(
            secondaryPlate,
            { x: align === 'right' ? 90 : -90 },
            { x: 0, duration: 0.58 * speed, ease: backSoft },
            0.1 * speed
          );
        }
        if (pText) {
          tl.fromTo(pText, { x: align === 'right' ? -60 : 60 }, { x: 0, duration: 0.5 * speed, ease: 'power3.out' }, 0.12 * speed);
        }
        if (sText) {
          tl.fromTo(sText, { x: align === 'right' ? -45 : 45 }, { x: 0, duration: 0.5 * speed, ease: 'power3.out' }, 0.18 * speed);
        }
      } else if (style === 'shutter-reveal') {
        tl.fromTo(
          rig,
          { scaleY: 0, scaleX: 1.08, transformOrigin: '50% 50%' },
          { scaleY: 1, scaleX: 1, duration: 0.52 * speed, ease: backMain },
          0
        );
        if (pText) {
          tl.fromTo(pText, { yPercent: -120 }, { yPercent: 0, duration: 0.48 * speed, ease: backSoft }, 0.15 * speed);
        }
        if (sText) {
          tl.fromTo(sText, { yPercent: 120 }, { yPercent: 0, duration: 0.48 * speed, ease: backSoft }, 0.2 * speed);
        }
        if (iconGlyph) {
          tl.fromTo(iconGlyph, { scale: 0, rotation: 90 }, { scale: 1, rotation: 0, duration: 0.46 * speed, ease: backStrong }, 0.18 * speed);
        }
      } else if (style === 'pop-elastic') {
        tl.fromTo(
          rig,
          { scale: 0.15, y: 50, rotation: align === 'right' ? 6 : -6, transformOrigin: '50% 100%' },
          { scale: 1, y: 0, rotation: 0, duration: 0.8 * speed, ease: elasticOut },
          0
        );
        if (iconBox) {
          tl.fromTo(iconBox, { scale: 0.2 }, { scale: 1, duration: 0.72 * speed, ease: elasticOut }, 0.08 * speed);
        }
        if (secondaryPlate) {
          tl.fromTo(secondaryPlate, { scale: 0.4, y: 20 }, { scale: 1, y: 0, duration: 0.7 * speed, ease: elasticOut }, 0.14 * speed);
        }
      } else if (style === 'wave-stagger') {
        const els = [tag, accent, iconBox, primaryPlate, secondaryPlate].filter(Boolean);
        tl.fromTo(
          els,
          { y: travel.y * 0.75, rotation: -5, scale: 0.88 },
          {
            y: 0,
            rotation: 0,
            scale: 1,
            duration: 0.64 * speed,
            stagger: 0.07 * speed,
            ease: backMain
          },
          0
        );
        if (pText) tl.fromTo(pText, { yPercent: 130 }, { yPercent: 0, duration: 0.52 * speed, ease: backSoft }, 0.2 * speed);
        if (sText) tl.fromTo(sText, { yPercent: 130 }, { yPercent: 0, duration: 0.52 * speed, ease: backSoft }, 0.28 * speed);
      } else if (style === 'glitch-snap') {
        tl.set(rig, { x: -45, skewX: 24, scaleY: 0.2 })
          .to(rig, { x: 28, skewX: -18, scaleY: 1.15, duration: 0.07 * speed, ease: 'steps(1)' })
          .to(rig, { x: -12, skewX: 10, scaleY: 0.92, duration: 0.06 * speed, ease: 'steps(1)' })
          .to(rig, { x: 6, skewX: -4, scaleY: 1.04, duration: 0.06 * speed, ease: 'steps(1)' })
          .to(rig, { x: 0, skewX: 0, scaleY: 1, duration: 0.18 * speed, ease: 'expo.out' });

        if (pText) {
          tl.fromTo(pText, { x: -30 }, { x: 0, duration: 0.25 * speed, ease: 'steps(4)' }, 0.1 * speed);
        }
        if (sText) {
          tl.fromTo(sText, { x: 30 }, { x: 0, duration: 0.25 * speed, ease: 'steps(4)' }, 0.14 * speed);
        }
      } else if (style === 'velvet-glide') {
        tl.fromTo(
          rig,
          { y: 54 },
          { y: 0, duration: 0.86 * speed, ease: 'power4.out' },
          0
        );
        const wipeTarget = splitShell || primaryPlate;
        if (wipeTarget && layout !== 'ribbon') {
          tl.fromTo(
            wipeTarget,
            { clipPath: clipClosed },
            { clipPath: clipOpen, duration: 0.82 * speed, ease: 'power4.out', clearProps: 'clipPath' },
            0.04 * speed
          );
        }
        if (pText) tl.fromTo(pText, { yPercent: 105 }, { yPercent: 0, duration: 0.78 * speed, ease: 'power3.out' }, 0.12 * speed);
        if (sText) tl.fromTo(sText, { yPercent: 105 }, { yPercent: 0, duration: 0.78 * speed, ease: 'power3.out' }, 0.2 * speed);
      } else if (style === 'festive-sparkle') {
        tl.fromTo(
          rig,
          { y: travel.y, scale: 0.7, rotation: -6, transformOrigin: '50% 100%' },
          { y: 0, scale: 1, rotation: 0, duration: 0.68 * speed, ease: backMain },
          0
        );
        if (iconBox) {
          tl.fromTo(
            iconBox,
            { scale: 0, rotation: -25 },
            { scale: 1, rotation: 0, duration: 0.62 * speed, ease: elasticOut },
            0.12 * speed
          );
        }
        if (pText) {
          tl.fromTo(pText, { yPercent: 120, scale: 0.85 }, { yPercent: 0, scale: 1, duration: 0.56 * speed, ease: backStrong }, 0.16 * speed);
        }
        if (secondaryPlate) {
          tl.fromTo(secondaryPlate, { scale: 0.5, y: 20 }, { scale: 1, y: 0, duration: 0.56 * speed, ease: backStrong }, 0.22 * speed);
        }
      } else if (style === 'snow-bounce') {
        tl.fromTo(
          rig,
          { y: dir === 'top' ? -travel.y : travel.y, scaleX: 0.9, scaleY: 1.12, transformOrigin: '50% 100%' },
          { y: 0, scaleX: 1.04, scaleY: 0.95, duration: 0.46 * speed, ease: 'power2.out' },
          0
        ).to(
          rig,
          { scaleX: 1, scaleY: 1, duration: 0.42 * speed, ease: elasticOut },
          0.44 * speed
        );
        if (iconGlyph) {
          tl.fromTo(iconGlyph, { rotation: -180, scale: 0 }, { rotation: 0, scale: 1, duration: 0.66 * speed, ease: backStrong }, 0.14 * speed);
        }
        if (pText) tl.fromTo(pText, { yPercent: -115 }, { yPercent: 0, duration: 0.52 * speed, ease: backSoft }, 0.18 * speed);
        if (sText) tl.fromTo(sText, { yPercent: 115 }, { yPercent: 0, duration: 0.52 * speed, ease: backSoft }, 0.24 * speed);
      } else if (style === 'whip-skew') {
        const whipX = align === 'right' ? travel.x : -travel.x;
        tl.fromTo(
          rig,
          { x: whipX, skewX: align === 'right' ? -30 : 30, scaleX: 1.25 },
          { x: 0, skewX: 0, scaleX: 1, duration: 0.64 * speed, ease: elasticOut },
          0
        );
        if (pText) tl.fromTo(pText, { yPercent: 120 }, { yPercent: 0, duration: 0.42 * speed, ease: backSoft }, 0.14 * speed);
        if (sText) tl.fromTo(sText, { yPercent: 120 }, { yPercent: 0, duration: 0.42 * speed, ease: backSoft }, 0.2 * speed);
      } else if (style === 'flip-3d') {
        tl.fromTo(
          rig,
          { rotationX: 110, y: 70, scale: 0.85, transformOrigin: '50% 50%' },
          { rotationX: 0, y: 0, scale: 1, duration: 0.72 * speed, ease: backMain },
          0
        );
        if (pText) tl.fromTo(pText, { yPercent: 120 }, { yPercent: 0, duration: 0.5 * speed, ease: backSoft }, 0.18 * speed);
        if (sText) tl.fromTo(sText, { yPercent: 120 }, { yPercent: 0, duration: 0.5 * speed, ease: backSoft }, 0.25 * speed);
      }
    }

    playOut(onComplete) {
      this.killTimeline();
      const el = this.currentAnchor;
      const asset = this.currentAsset;
      const gsap = global.gsap;

      if (!el || !gsap) {
        this.cut();
        if (onComplete) onComplete();
        return;
      }

      const speed = Math.min(2.2, Math.max(0.4, Number(asset?.animSpeed) || 1));
      const dir = ['bottom', 'left', 'right', 'top', 'scale'].includes(asset?.animDirection)
        ? asset.animDirection
        : 'bottom';
      const rig = el.querySelector('.ov-motion-rig');
      const pText = el.querySelector('.ov-anim-p-text');
      const sText = el.querySelector('.ov-anim-s-text');
      const secondaryPlate = el.querySelector('.ov-secondary-plate');
      const tag = el.querySelector('.ov-tag');
      const decorLayer = el.querySelector('.ov-decor-layer');
      const layout = rig?.dataset.layout || 'layered';

      const travel = this.getOffscreenTravel(el, asset);

      const tl = gsap.timeline({
        defaults: { overwrite: 'auto' },
        onComplete: () => {
          this.cut();
          if (onComplete) onComplete();
        }
      });
      this.tl = tl;

      if (decorLayer) {
        tl.to(decorLayer, { scale: 0.5, y: 15, duration: 0.18 * speed, ease: 'power2.in' }, 0);
      }
      if (tag) {
        tl.to(tag, { yPercent: 115, duration: 0.16 * speed, ease: 'power2.in' }, 0);
      }
      if (sText) {
        tl.to(sText, { yPercent: 115, duration: 0.18 * speed, ease: 'power2.in' }, 0);
      }
      if (secondaryPlate && layout !== 'minimal' && layout !== 'split') {
        tl.to(secondaryPlate, { y: -12, scale: 0.92, duration: 0.22 * speed, ease: 'power2.in' }, 0.02 * speed);
      }
      if (pText) {
        tl.to(pText, { yPercent: 110, duration: 0.22 * speed, ease: 'power2.in' }, 0.05 * speed);
      }

      if (dir === 'left' || dir === 'right') {
        const outX = dir === 'right' ? travel.x : -travel.x;
        tl.to(rig, { x: dir === 'right' ? -12 : 12, duration: 0.1 * speed, ease: 'power2.out' }, 0);
        tl.to(rig, { x: outX, skewX: dir === 'right' ? -14 : 14, duration: 0.34 * speed, ease: 'power3.in' }, 0.1 * speed);
      } else if (dir === 'scale') {
        tl.to(rig, { scale: 1.06, duration: 0.1 * speed, ease: 'power2.out' }, 0);
        tl.to(rig, { scale: 0, y: 40, duration: 0.32 * speed, ease: 'back.in(1.6)' }, 0.1 * speed);
      } else {
        const outY = dir === 'top' ? -travel.y : travel.y;
        tl.to(rig, { y: dir === 'top' ? 9 : -9, duration: 0.11 * speed, ease: 'power2.out' }, 0);
        tl.to(rig, { y: outY, scaleY: 1.04, duration: 0.34 * speed, ease: 'power3.in' }, 0.11 * speed);
      }
    }
  }

  global.OverlayRenderer = OverlayRenderer;
})(window);
