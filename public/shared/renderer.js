/* ==========================================================================
   Shared Broadcast Overlay & Preview Renderer (1920x1080)
   Requires window.gsap
   ========================================================================== */
(function (global) {
  'use strict';

  const ANIM_TIMINGS = {
    'bouncy-rise': { in: 0.76, out: 0.46 },
    'elastic-wipe': { in: 0.82, out: 0.48 },
    'spring-cascade': { in: 0.86, out: 0.48 }
  };

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

  class OverlayRenderer {
    constructor(stageEl) {
      this.stage = stageEl;
      this.tl = null;
      this.currentAnchor = null;
      this.currentAsset = null;
    }

    killTimeline() {
      if (this.tl) {
        this.tl.kill();
        this.tl = null;
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
      const layout = ['layered', 'split', 'capsule', 'minimal'].includes(a.layout) ? a.layout : 'layered';
      const scale = Number(a.scale) || 1;
      const posX = Number(a.posX) || 0;
      const posY = Number(a.posY) || 0;
      const radius = Math.max(0, Number(a.borderRadius) ?? 10);
      const padX = Math.max(8, Number(a.paddingX) ?? 24);
      const padY = Math.max(4, Number(a.paddingY) ?? 12);
      const accentW = Math.max(0, Number(a.accentWidth) ?? 6);
      const borderW = Math.max(0, Number(a.borderWidth) ?? 0);
      const borderCss = borderW > 0 ? `${borderW}px solid ${a.borderColor || '#000000'}` : 'none';

      const iconCls = sanitizeIconClass(a.icon);
      const hasIcon = Boolean(iconCls);
      const hasSecondary = Boolean(a.secondaryText && String(a.secondaryText).trim().length > 0);
      const hasTag = Boolean(a.tagText && String(a.tagText).trim().length > 0);

      const anchor = document.createElement('div');
      anchor.className = `ov-anchor align-${align}`;
      anchor.style.bottom = `${posY}px`;

      if (align === 'left') {
        anchor.style.left = `${posX}px`;
      } else if (align === 'right') {
        anchor.style.right = `${posX}px`;
      } else {
        anchor.style.transform = `translateX(calc(-50% + ${posX}px))`;
      }

      const pTextStyle = [
        `font-size:${a.primarySize || 34}px`,
        `font-weight:${a.primaryWeight || 700}`,
        `color:${a.primaryColor || '#000000'}`,
        a.primaryUppercase ? 'text-transform:uppercase;letter-spacing:0.04em' : 'letter-spacing:-0.01em'
      ].join(';');

      const sTextStyle = [
        `font-size:${a.secondarySize || 18}px`,
        `font-weight:${a.secondaryWeight || 600}`,
        `color:${a.secondaryColor || '#000000'}`,
        a.secondaryUppercase ? 'text-transform:uppercase;letter-spacing:0.06em' : 'letter-spacing:0.005em'
      ].join(';');

      const iconSize = Math.round((a.primarySize || 34) * 0.68);
      const secPadX = Math.max(10, Math.round(padX * 0.82));
      const secPadY = Math.max(4, Math.round(padY * 0.58));
      const smallRadius = Math.max(0, Math.round(radius * 0.75));

      const tagHtml = hasTag
        ? `<div class="ov-tag-wrap">
             <div class="ov-tag" style="background:${a.tagBg || '#000000'};color:${a.tagColor || '#FAB001'};border-radius:${Math.min(radius, 8)}px;">
               <span class="ov-text-mask"><span class="ov-text-inner ov-anim-tag-text">${escapeHtml(a.tagText)}</span></span>
             </div>
           </div>`
        : '';

      let bodyHtml = '';

      if (layout === 'layered') {
        const secIndent = accentW > 0 ? accentW + 14 : 16;
        bodyHtml = `
          <div class="ov-layout-layered" style="--sec-indent:${secIndent}px;">
            ${tagHtml}
            <div class="ov-main-row">
              ${accentW > 0 ? `<div class="ov-accent" style="width:${accentW}px;background:${a.accentColor || '#FAB001'};border-radius:${Math.min(radius, 99)}px;"></div>` : ''}
              ${hasIcon ? `<div class="ov-icon-box" style="background:${a.iconBg || '#404040'};color:${a.iconColor || '#FAB001'};border-radius:${radius}px;padding:0 ${Math.round(padY * 0.95)}px;min-width:${Math.round((a.primarySize || 34) + padY * 2)}px;border:${borderCss};"><i class="${iconCls} ov-anim-icon" style="font-size:${iconSize}px;"></i></div>` : ''}
              <div class="ov-primary-plate" style="background:${a.primaryBg || '#FFFFFF'};padding:${padY}px ${padX}px;border-radius:${radius}px;border:${borderCss};">
                <span class="ov-text-mask">
                  <span class="ov-text-inner ov-anim-p-text" style="${pTextStyle}">${escapeHtml(a.primaryText)}</span>
                </span>
              </div>
            </div>
            ${hasSecondary ? `
              <div class="ov-secondary-wrap">
                <div class="ov-secondary-plate" style="background:${a.secondaryBg || '#FAB001'};padding:${secPadY}px ${secPadX}px;border-radius:${smallRadius}px;border:${borderCss};">
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
          <div class="ov-layout-split">
            ${tagHtml}
            <div class="ov-split-shell" style="border-radius:${radius}px;border:${borderCss};">
              ${accentW > 0 ? `<div class="ov-accent" style="width:${accentW}px;background:${a.accentColor || '#FAB001'};"></div>` : ''}
              ${hasIcon ? `<div class="ov-icon-box" style="background:${a.iconBg || '#000000'};color:${a.iconColor || '#FAB001'};"><i class="${iconCls} ov-anim-icon" style="font-size:${Math.round(iconSize * 1.1)}px;"></i></div>` : ''}
              <div class="ov-split-stack">
                <div class="ov-primary-plate" style="background:${a.primaryBg || '#404040'};padding:${padY}px ${padX}px;">
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
          <div class="ov-layout-capsule">
            ${tagHtml}
            <div class="ov-primary-plate" style="background:${a.primaryBg || '#000000'};padding:${Math.max(6, Math.round(padY * 0.65))}px ${padX}px ${Math.max(6, Math.round(padY * 0.65))}px ${align === 'right' ? padX : outerPadLeft}px;${align === 'right' && hasIcon ? `padding-right:${outerPadLeft}px;` : ''}border-radius:${capRadius}px;border:${borderCss};">
              ${hasIcon ? `<div class="ov-icon-box" style="width:${badgeDim}px;height:${badgeDim}px;background:${a.iconBg || '#FAB001'};color:${a.iconColor || '#000000'};"><i class="${iconCls} ov-anim-icon" style="font-size:${Math.round(iconSize * 0.92)}px;"></i></div>` : ''}
              <span class="ov-text-mask">
                <span class="ov-text-inner ov-anim-p-text" style="${pTextStyle}">${escapeHtml(a.primaryText)}</span>
              </span>
            </div>
            ${hasSecondary ? `
              <div class="ov-secondary-wrap">
                <div class="ov-secondary-plate" style="background:${a.secondaryBg || '#FFFFFF'};padding:${secPadY}px ${secPadX}px;border-radius:${capRadius}px;border:${borderCss};">
                  ${accentW > 0 ? `<span class="ov-accent-dot ov-accent" style="width:${Math.max(8, accentW + 2)}px;height:${Math.max(8, accentW + 2)}px;background:${a.accentColor || '#FAB001'};"></span>` : ''}
                  <span class="ov-text-mask">
                    <span class="ov-text-inner ov-anim-s-text" style="${sTextStyle}">${escapeHtml(a.secondaryText)}</span>
                  </span>
                </div>
              </div>
            ` : ''}
          </div>
        `;
      } else {
        // MINIMAL — Discreet Single-Bar Layout (Ideal for Bottom-Center Sequence Titles)
        const minIconSize = Math.round((a.primarySize || 24) * 0.72);
        const minIconDim = Math.round((a.primarySize || 24) + padY * 0.9);
        const bottomAccent = align === 'center' && accentW > 0;
        const sideAccent = align !== 'center' && accentW > 0;
        bodyHtml = `
          <div class="ov-layout-minimal">
            ${tagHtml}
            <div class="ov-minimal-bar ov-primary-plate" style="background:${a.primaryBg || '#404040'};border-radius:${radius}px;border:${borderCss};">
              ${sideAccent ? `<div class="ov-accent ov-accent-side" style="width:${accentW}px;background:${a.accentColor || '#FAB001'};"></div>` : ''}
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
              ${bottomAccent ? `<div class="ov-accent ov-accent-bottom" style="height:${accentW}px;background:${a.accentColor || '#FAB001'};"></div>` : ''}
            </div>
          </div>
        `;
      }

      anchor.innerHTML = `
        <div class="ov-scale-box" style="transform:scale(${scale});">
          <div class="ov-motion-rig" data-radius="${radius}" data-align="${align}" data-layout="${layout}">
            ${bodyHtml}
          </div>
        </div>
      `;

      return anchor;
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
      this.currentAnchor = el;
      this.currentAsset = asset;
    }

    getOffscreenTravelY(anchorEl, asset) {
      const scale = Math.max(0.2, Number(asset?.scale) || 1);
      const posY = Math.max(0, Number(asset?.posY) || 0);
      const rig = anchorEl.querySelector('.ov-motion-rig');
      const rigH = rig ? rig.offsetHeight : 160;
      return Math.ceil(posY / scale + rigH + 48);
    }

    playIn(asset, onComplete) {
      this.killTimeline();
      this.stage.innerHTML = '';
      if (!asset) return;

      const el = this.buildElement(asset);
      this.stage.appendChild(el);
      this.currentAnchor = el;
      this.currentAsset = asset;

      const gsap = global.gsap;
      if (!gsap) {
        if (onComplete) onComplete();
        return;
      }

      const style = ANIM_TIMINGS[asset.animStyle] ? asset.animStyle : 'bouncy-rise';
      const speed = Math.min(2, Math.max(0.5, Number(asset.animSpeed) || 1));
      const align = el.querySelector('.ov-motion-rig')?.dataset.align || 'left';
      const layout = el.querySelector('.ov-motion-rig')?.dataset.layout || 'layered';
      const radius = Number(el.querySelector('.ov-motion-rig')?.dataset.radius || 10);

      const rig = el.querySelector('.ov-motion-rig');
      const accent = el.querySelector('.ov-accent');
      const iconBox = el.querySelector('.ov-icon-box');
      const iconGlyph = el.querySelector('.ov-anim-icon');
      const splitShell = el.querySelector('.ov-split-shell');
      const primaryPlate = el.querySelector('.ov-primary-plate');
      const secondaryPlate = el.querySelector('.ov-secondary-plate');
      const pText = el.querySelector('.ov-anim-p-text');
      const sText = el.querySelector('.ov-anim-s-text');
      const tag = el.querySelector('.ov-tag');
      const tagText = el.querySelector('.ov-anim-tag-text');

      const travelY = this.getOffscreenTravelY(el, asset);

      const tl = gsap.timeline({
        defaults: { overwrite: 'auto' },
        onComplete: () => {
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

      if (style === 'bouncy-rise') {
        // Signature multi-layer bouncy broadcast entrance from bottom of 1080p screen
        tl.fromTo(
          rig,
          { y: travelY, scaleY: 1.06, scaleX: 0.97, transformOrigin: '50% 100%' },
          { y: 0, scaleY: 1, scaleX: 1, duration: 0.62 * speed, ease: 'back.out(1.68)' },
          0
        );

        if (accent) {
          const isHoriz = accent.classList.contains('ov-accent-bottom');
          tl.fromTo(
            accent,
            isHoriz
              ? { scaleX: 0, transformOrigin: align === 'center' ? '50% 50%' : '0% 50%' }
              : { scaleY: 0, transformOrigin: '50% 100%' },
            isHoriz
              ? { scaleX: 1, duration: 0.52 * speed, ease: 'back.out(1.9)' }
              : { scaleY: 1, duration: 0.48 * speed, ease: 'back.out(2.2)' },
            0.05 * speed
          );
        }

        if (iconBox) {
          tl.fromTo(
            iconBox,
            { scale: 0.55, y: 24 },
            { scale: 1, y: 0, duration: 0.48 * speed, ease: 'back.out(2.0)' },
            0.06 * speed
          );
        }
        if (iconGlyph) {
          tl.fromTo(
            iconGlyph,
            { y: 16, scale: 0.7 },
            { y: 0, scale: 1, duration: 0.44 * speed, ease: 'back.out(2.4)' },
            0.14 * speed
          );
        }

        const wipeTarget = splitShell || primaryPlate;
        if (wipeTarget) {
          tl.fromTo(
            wipeTarget,
            { clipPath: clipClosed },
            { clipPath: clipOpen, duration: 0.54 * speed, ease: 'expo.out', clearProps: 'clipPath' },
            0.06 * speed
          );
        }

        if (pText) {
          tl.fromTo(
            pText,
            { yPercent: 120 },
            { yPercent: 0, duration: 0.52 * speed, ease: 'back.out(1.45)' },
            0.14 * speed
          );
        }

        if (secondaryPlate && layout !== 'minimal') {
          tl.fromTo(
            secondaryPlate,
            { yPercent: layout === 'split' ? 105 : -115 },
            { yPercent: 0, duration: 0.5 * speed, ease: 'back.out(1.55)' },
            0.18 * speed
          );
        } else if (secondaryPlate && layout === 'minimal') {
          tl.fromTo(
            secondaryPlate,
            { scale: 0.75, y: 16 },
            { scale: 1, y: 0, duration: 0.44 * speed, ease: 'back.out(1.9)' },
            0.16 * speed
          );
        }

        if (sText) {
          tl.fromTo(
            sText,
            { yPercent: 120 },
            { yPercent: 0, duration: 0.46 * speed, ease: 'back.out(1.4)' },
            0.24 * speed
          );
        }

        if (tag) {
          tl.fromTo(
            tag,
            { yPercent: 115 },
            { yPercent: 0, duration: 0.42 * speed, ease: 'back.out(1.8)' },
            0.22 * speed
          );
        }
        if (tagText) {
          tl.fromTo(
            tagText,
            { yPercent: 115 },
            { yPercent: 0, duration: 0.38 * speed, ease: 'power3.out' },
            0.26 * speed
          );
        }
      } else if (style === 'elastic-wipe') {
        // Architectural rise from bottom + crisp horizontal spring deployment
        tl.fromTo(
          rig,
          { y: travelY },
          { y: 0, duration: 0.54 * speed, ease: 'back.out(1.55)' },
          0
        );

        const wipeTarget = splitShell || primaryPlate;
        if (wipeTarget) {
          tl.fromTo(
            wipeTarget,
            { clipPath: clipClosed, x: align === 'right' ? 22 : align === 'left' ? -22 : 0 },
            { clipPath: clipOpen, x: 0, duration: 0.62 * speed, ease: 'back.out(1.25)', clearProps: 'clipPath' },
            0.12 * speed
          );
        }

        if (accent) {
          const isHoriz = accent.classList.contains('ov-accent-bottom');
          tl.fromTo(
            accent,
            isHoriz
              ? { scaleX: 0, transformOrigin: '50% 50%' }
              : { scaleY: 0, transformOrigin: '50% 100%' },
            isHoriz
              ? { scaleX: 1, duration: 0.56 * speed, ease: 'expo.out' }
              : { scaleY: 1, duration: 0.46 * speed, ease: 'back.out(2.1)' },
            0.04 * speed
          );
        }

        if (iconBox) {
          tl.fromTo(
            iconBox,
            { yPercent: 110 },
            { yPercent: 0, duration: 0.48 * speed, ease: 'back.out(1.7)' },
            0.08 * speed
          );
        }

        if (pText) {
          tl.fromTo(
            pText,
            { yPercent: 120 },
            { yPercent: 0, duration: 0.5 * speed, ease: 'back.out(1.4)' },
            0.2 * speed
          );
        }

        if (secondaryPlate) {
          const sRadius = Math.max(0, Math.round(radius * 0.75));
          const sClipClosed =
            align === 'center'
              ? `inset(0% 50% 0% 50% round ${sRadius}px)`
              : align === 'right'
              ? `inset(0% 0% 0% 100% round ${sRadius}px)`
              : `inset(0% 100% 0% 0% round ${sRadius}px)`;
          const sClipOpen = `inset(0% 0% 0% 0% round ${sRadius}px)`;
          tl.fromTo(
            secondaryPlate,
            { clipPath: sClipClosed },
            { clipPath: sClipOpen, duration: 0.52 * speed, ease: 'expo.out', clearProps: 'clipPath' },
            0.24 * speed
          );
        }

        if (sText) {
          tl.fromTo(
            sText,
            { yPercent: 120 },
            { yPercent: 0, duration: 0.46 * speed, ease: 'back.out(1.35)' },
            0.28 * speed
          );
        }

        if (tag) {
          tl.fromTo(
            tag,
            { yPercent: 120 },
            { yPercent: 0, duration: 0.4 * speed, ease: 'back.out(1.7)' },
            0.26 * speed
          );
        }
      } else {
        // spring-cascade: Each flat module springs independently from below the bottom of the screen
        const parts = [accent, iconBox, splitShell || primaryPlate, secondaryPlate, tag].filter(Boolean);
        // Deduplicate if minimal secondaryPlate is inside primaryPlate
        const topLevelParts = parts.filter((node) => {
          return !parts.some((other) => other !== node && other.contains(node));
        });

        tl.set(rig, { y: 0 });
        tl.fromTo(
          topLevelParts,
          { y: travelY, scaleY: 1.08, transformOrigin: '50% 100%' },
          {
            y: 0,
            scaleY: 1,
            duration: 0.68 * speed,
            stagger: 0.065 * speed,
            ease: 'back.out(1.88)'
          },
          0
        );

        if (iconGlyph) {
          tl.fromTo(
            iconGlyph,
            { scale: 0.4, rotation: -12 },
            { scale: 1, rotation: 0, duration: 0.5 * speed, ease: 'back.out(2.5)' },
            0.16 * speed
          );
        }

        if (pText) {
          tl.fromTo(
            pText,
            { yPercent: 120 },
            { yPercent: 0, duration: 0.48 * speed, ease: 'back.out(1.5)' },
            0.18 * speed
          );
        }

        if (sText) {
          tl.fromTo(
            sText,
            { yPercent: 120 },
            { yPercent: 0, duration: 0.48 * speed, ease: 'back.out(1.5)' },
            0.26 * speed
          );
        }
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

      const speed = Math.min(2, Math.max(0.5, Number(asset?.animSpeed) || 1));
      const rig = el.querySelector('.ov-motion-rig');
      const pText = el.querySelector('.ov-anim-p-text');
      const sText = el.querySelector('.ov-anim-s-text');
      const secondaryPlate = el.querySelector('.ov-secondary-plate');
      const tag = el.querySelector('.ov-tag');
      const layout = rig?.dataset.layout || 'layered';

      const travelY = this.getOffscreenTravelY(el, asset);

      const tl = gsap.timeline({
        defaults: { overwrite: 'auto' },
        onComplete: () => {
          this.cut();
          if (onComplete) onComplete();
        }
      });
      this.tl = tl;

      // Subtle upward anticipation (-9px) then crisp plunge below bottom of 1920x1080 screen
      if (tag) {
        tl.to(tag, { yPercent: 115, duration: 0.16 * speed, ease: 'power2.in' }, 0);
      }
      if (sText) {
        tl.to(sText, { yPercent: 115, duration: 0.18 * speed, ease: 'power2.in' }, 0);
      }
      if (secondaryPlate && layout !== 'minimal' && layout !== 'split') {
        tl.to(secondaryPlate, { yPercent: -105, duration: 0.22 * speed, ease: 'power2.in' }, 0.02 * speed);
      }
      if (pText) {
        tl.to(pText, { yPercent: 110, duration: 0.22 * speed, ease: 'power2.in' }, 0.05 * speed);
      }

      tl.to(rig, { y: -9, duration: 0.11 * speed, ease: 'power2.out' }, 0);
      tl.to(
        rig,
        { y: travelY, scaleY: 1.04, duration: 0.34 * speed, ease: 'power3.in' },
        0.11 * speed
      );
    }
  }

  global.OverlayRenderer = OverlayRenderer;
})(window);
