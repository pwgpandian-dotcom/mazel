// Generates PWA icons: navy background + gold "M" lettermark — no external deps
const zlib = require('zlib');
const fs   = require('fs');
const path = require('path');

// CRC32 for PNG chunks
const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
  crcTable[n] = c >>> 0;
}
function crc32(buf) {
  let c = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) c = (c >>> 8) ^ crcTable[(c ^ buf[i]) & 0xFF];
  return (c ^ 0xFFFFFFFF) >>> 0;
}
function u32(n) { const b = Buffer.alloc(4); b.writeUInt32BE(n >>> 0); return b; }
function chunk(type, data) {
  const t = Buffer.from(type);
  return Buffer.concat([u32(data.length), t, data, u32(crc32(Buffer.concat([t, data])))]);
}

// Bitmap pixel font for "M" — 8 wide x 9 tall
const M_BITMAP = [
  [1,1,0,0,0,0,1,1],
  [1,1,0,0,0,0,1,1],
  [1,1,1,0,0,1,1,1],
  [1,1,0,1,1,0,1,1],
  [1,1,0,0,0,0,1,1],
  [1,1,0,0,0,0,1,1],
  [1,1,0,0,0,0,1,1],
  [1,1,0,0,0,0,1,1],
  [1,1,0,0,0,0,1,1],
];

function makePNG(size) {
  const BG = [0x1B, 0x2A, 0x4A]; // navy
  const FG = [0xE0, 0xA5, 0x00]; // gold

  const cols = M_BITMAP[0].length;
  const rows = M_BITMAP.length;

  // Scale "M" to ~55% of icon size
  const scale = Math.max(1, Math.floor(size * 0.55 / Math.max(cols, rows)));
  const mW = cols * scale;
  const mH = rows * scale;
  const offX = Math.floor((size - mW) / 2);
  const offY = Math.floor((size - mH) / 2);

  // Fill pixel buffer with navy background
  const pixels = new Uint8Array(size * size * 3);
  for (let i = 0; i < size * size; i++) {
    pixels[i * 3]     = BG[0];
    pixels[i * 3 + 1] = BG[1];
    pixels[i * 3 + 2] = BG[2];
  }

  // Draw gold "M"
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (!M_BITMAP[r][c]) continue;
      for (let sy = 0; sy < scale; sy++) {
        for (let sx = 0; sx < scale; sx++) {
          const px = offX + c * scale + sx;
          const py = offY + r * scale + sy;
          if (px < 0 || px >= size || py < 0 || py >= size) continue;
          const idx = (py * size + px) * 3;
          pixels[idx]     = FG[0];
          pixels[idx + 1] = FG[1];
          pixels[idx + 2] = FG[2];
        }
      }
    }
  }

  // Build PNG
  const ihdrBuf = Buffer.alloc(13);
  ihdrBuf.writeUInt32BE(size, 0);
  ihdrBuf.writeUInt32BE(size, 4);
  ihdrBuf[8] = 8; ihdrBuf[9] = 2; // 8-bit RGB

  const rowBufs = [];
  for (let y = 0; y < size; y++) {
    rowBufs.push(Buffer.from([0])); // filter byte
    rowBufs.push(Buffer.from(pixels.subarray(y * size * 3, (y + 1) * size * 3)));
  }

  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  return Buffer.concat([
    sig,
    chunk('IHDR', ihdrBuf),
    chunk('IDAT', zlib.deflateSync(Buffer.concat(rowBufs))),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

const pub = path.join(__dirname, '../public');
fs.writeFileSync(path.join(pub, 'icon-192.png'),              makePNG(192));
fs.writeFileSync(path.join(pub, 'icon-512.png'),              makePNG(512));
fs.writeFileSync(path.join(pub, 'mazel-icon-192.png'),        makePNG(192));
fs.writeFileSync(path.join(pub, 'mazel-icon-512.png'),        makePNG(512));
fs.writeFileSync(path.join(pub, 'mazel-icon-512-maskable.png'), makePNG(512));
fs.writeFileSync(path.join(pub, 'mazel-apple-touch-icon.png'), makePNG(180));
console.log('✓ All PWA icons generated — navy background, gold M');
