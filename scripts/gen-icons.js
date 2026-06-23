// Generates minimal solid-color PNG icons for the PWA — no external deps
const zlib = require('zlib');
const fs   = require('fs');
const path = require('path');

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

function makePNG(size, r, g, b) {
  const ihdr = Buffer.from([
    0,0,0,size>>8&0xff,0,0,0,size&0xff, // wait — build properly
  ]);
  // build IHDR properly
  const ihdrBuf = Buffer.alloc(13);
  ihdrBuf.writeUInt32BE(size, 0);
  ihdrBuf.writeUInt32BE(size, 4);
  ihdrBuf[8] = 8; ihdrBuf[9] = 2; // 8-bit depth, RGB

  // raw image: filter(0) + RGB per row
  const row = Buffer.alloc(1 + size * 3);
  row[0] = 0;
  for (let x = 0; x < size; x++) { row[1+x*3]=r; row[2+x*3]=g; row[3+x*3]=b; }
  const raw = Buffer.concat(Array(size).fill(row));

  const sig = Buffer.from([137,80,78,71,13,10,26,10]);
  return Buffer.concat([
    sig,
    chunk('IHDR', ihdrBuf),
    chunk('IDAT', zlib.deflateSync(raw)),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

const pub = path.join(__dirname, '../public');
// Gold #E0A500
fs.writeFileSync(path.join(pub,'icon-192.png'), makePNG(192, 0xE0, 0xA5, 0x00));
fs.writeFileSync(path.join(pub,'icon-512.png'), makePNG(512, 0xE0, 0xA5, 0x00));
console.log('✓ icon-192.png and icon-512.png generated (192px, 512px gold squares)');
