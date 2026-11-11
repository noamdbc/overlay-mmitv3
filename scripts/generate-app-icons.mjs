import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

// CRC32 table for PNG encoding
const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function makeChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

function encodePNG(width, height, rgba) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const stride = width * 4 + 1;
  const raw = Buffer.alloc(stride * height);
  for (let y = 0; y < height; y++) {
    raw[y * stride] = 0; // filter None
    rgba.copy(raw, y * stride + 1, y * width * 4, (y + 1) * width * 4);
  }
  const idat = zlib.deflateSync(raw, { level: 9 });
  return Buffer.concat([
    sig,
    makeChunk('IHDR', ihdr),
    makeChunk('IDAT', idat),
    makeChunk('IEND', Buffer.alloc(0))
  ]);
}

function sdRoundedBox(x, y, cx, cy, hw, hh, r) {
  const qx = Math.abs(x - cx) - (hw - r);
  const qy = Math.abs(y - cy) - (hh - r);
  return Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) + Math.min(Math.max(qx, qy), 0) - r;
}

function renderAppIcon(size) {
  const rgba = Buffer.alloc(size * size * 4);
  const s = size / 1024;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const px = x / s;
      const py = y / s;
      const idx = (y * size + x) * 4;

      // Outer rounded squircle (896x896 centered at 512,512)
      const dOuter = sdRoundedBox(px, py, 512, 512, 440, 440, 190);
      if (dOuter > 1.5) {
        rgba[idx + 3] = 0;
        continue;
      }

      const edgeAlpha = dOuter > -1.5 ? Math.max(0, Math.min(1, 0.5 - dOuter / 3)) : 1;

      // Dark studio gradient background
      const t = py / 1024;
      let r = Math.round(30 * (1 - t) + 14 * t);
      let g = Math.round(34 * (1 - t) + 16 * t);
      let b = Math.round(44 * (1 - t) + 22 * t);

      // Gold border rim
      if (dOuter > -26 && dOuter <= 0) {
        r = 250;
        g = 176;
        b = 1;
      }

      // Broadcast Lower-Third Synthé Graphics inside the icon:
      // 1. Gold vertical accent bar on left
      const dAccent = sdRoundedBox(px, py, 218, 560, 26, 175, 14);
      if (dAccent <= 0) {
        r = 250;
        g = 176;
        b = 1;
      }

      // 2. White primary plate (Name plate)
      const dPrimary = sdRoundedBox(px, py, 540, 495, 265, 92, 26);
      if (dPrimary <= 0) {
        r = 255;
        g = 255;
        b = 255;
        // Inner dark text lines simulation
        const dLine1 = sdRoundedBox(px, py, 490, 495, 175, 22, 11);
        if (dLine1 <= 0) {
          r = 20;
          g = 22;
          b = 28;
        }
      }

      // 3. Gold secondary plate (Subtitle / Role plate, slightly offset)
      const dSecondary = sdRoundedBox(px, py, 495, 655, 220, 54, 18);
      if (dSecondary <= 0) {
        r = 250;
        g = 176;
        b = 1;
        const dLine2 = sdRoundedBox(px, py, 470, 655, 145, 14, 7);
        if (dLine2 <= 0) {
          r = 18;
          g = 18;
          b = 18;
        }
      }

      // 4. Red ON-AIR Tally Pill at Top-Right
      const dTally = sdRoundedBox(px, py, 690, 275, 115, 42, 21);
      if (dTally <= 0) {
        r = 239;
        g = 35;
        b = 60;
        const dDot = Math.hypot(px - 630, py - 275) - 14;
        if (dDot <= 0) {
          r = 255;
          g = 255;
          b = 255;
        }
      }

      rgba[idx] = r;
      rgba[idx + 1] = g;
      rgba[idx + 2] = b;
      rgba[idx + 3] = Math.round(edgeAlpha * 255);
    }
  }

  return encodePNG(size, size, rgba);
}

function renderTrayIcon(size, mode = 'color') {
  const rgba = Buffer.alloc(size * size * 4);
  const s = size / 32;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const px = x / s;
      const py = y / s;
      const idx = (y * size + x) * 4;

      if (mode === 'template') {
        // macOS Menu Bar Template Icon (black pixels with alpha)
        const dFrame = sdRoundedBox(px, py, 16, 16, 13, 10, 3);
        const dInner = sdRoundedBox(px, py, 16, 16, 10.5, 7.5, 1.5);
        const dBar1 = sdRoundedBox(px, py, 14, 15, 6.5, 1.8, 0.8);
        const dBar2 = sdRoundedBox(px, py, 12.5, 19.5, 5, 1.5, 0.7);

        const inRing = dFrame <= 0 && dInner > 0;
        const inBars = dBar1 <= 0 || dBar2 <= 0;
        if (inRing || inBars) {
          rgba[idx] = 0;
          rgba[idx + 1] = 0;
          rgba[idx + 2] = 0;
          rgba[idx + 3] = 255;
        }
      } else {
        // Color tray icon (Windows / Linux & live tally state)
        const dBg = sdRoundedBox(px, py, 16, 16, 14, 14, 5);
        if (dBg > 0.5) continue;
        rgba[idx] = mode === 'live' ? 190 : 24;
        rgba[idx + 1] = mode === 'live' ? 20 : 26;
        rgba[idx + 2] = mode === 'live' ? 35 : 34;
        rgba[idx + 3] = 255;

        const dBar1 = sdRoundedBox(px, py, 16, 13, 9, 2.5, 1);
        const dBar2 = sdRoundedBox(px, py, 14, 19.5, 7, 2.2, 1);
        if (dBar1 <= 0) {
          rgba[idx] = 255;
          rgba[idx + 1] = 255;
          rgba[idx + 2] = 255;
        } else if (dBar2 <= 0) {
          rgba[idx] = 250;
          rgba[idx + 1] = 176;
          rgba[idx + 2] = 1;
        }
      }
    }
  }

  return encodePNG(size, size, rgba);
}

function encodeICO(pngBuffersWithSizes) {
  const count = pngBuffersWithSizes.length;
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2); // 1 = ICO
  header.writeUInt16LE(count, 4);

  const dirEntries = [];
  let offset = 6 + count * 16;

  for (const { size, buf } of pngBuffersWithSizes) {
    const entry = Buffer.alloc(16);
    entry[0] = size >= 256 ? 0 : size;
    entry[1] = size >= 256 ? 0 : size;
    entry[2] = 0;
    entry[3] = 0;
    entry.writeUInt16LE(1, 4);
    entry.writeUInt16LE(32, 6);
    entry.writeUInt32LE(buf.length, 8);
    entry.writeUInt32LE(offset, 12);
    dirEntries.push(entry);
    offset += buf.length;
  }

  return Buffer.concat([header, ...dirEntries, ...pngBuffersWithSizes.map((p) => p.buf)]);
}

const buildDir = path.join(ROOT, 'build');
const trayDir = path.join(ROOT, 'electron', 'assets');
fs.mkdirSync(buildDir, { recursive: true });
fs.mkdirSync(trayDir, { recursive: true });

const png1024 = renderAppIcon(1024);
const png256 = renderAppIcon(256);
const png64 = renderAppIcon(64);
const png32 = renderAppIcon(32);
const png16 = renderAppIcon(16);

fs.writeFileSync(path.join(buildDir, 'icon.png'), png1024);
fs.writeFileSync(
  path.join(buildDir, 'icon.ico'),
  encodeICO([
    { size: 256, buf: png256 },
    { size: 64, buf: png64 },
    { size: 32, buf: png32 },
    { size: 16, buf: png16 }
  ])
);

// Generate macOS .icns using iconutil if on macOS
if (process.platform === 'darwin') {
  const iconsetDir = path.join(buildDir, 'icon.iconset');
  fs.mkdirSync(iconsetDir, { recursive: true });
  const sizes = [16, 32, 128, 256, 512];
  for (const sz of sizes) {
    fs.writeFileSync(path.join(iconsetDir, `icon_${sz}x${sz}.png`), renderAppIcon(sz));
    fs.writeFileSync(path.join(iconsetDir, `icon_${sz}x${sz}@2x.png`), renderAppIcon(sz * 2));
  }
  try {
    execSync(`iconutil -c icns "${iconsetDir}" -o "${path.join(buildDir, 'icon.icns')}"`);
    fs.rmSync(iconsetDir, { recursive: true, force: true });
  } catch (err) {
    console.warn('iconutil warning:', err.message);
  }
}

// Generate Tray Icons
fs.writeFileSync(path.join(trayDir, 'trayTemplate.png'), renderTrayIcon(16, 'template'));
fs.writeFileSync(path.join(trayDir, 'trayTemplate@2x.png'), renderTrayIcon(32, 'template'));
fs.writeFileSync(path.join(trayDir, 'tray-icon.png'), renderTrayIcon(32, 'color'));
fs.writeFileSync(path.join(trayDir, 'tray-live.png'), renderTrayIcon(32, 'live'));

console.log('✔ Generated build/icon.png, build/icon.ico, build/icon.icns and electron/assets/tray*');
