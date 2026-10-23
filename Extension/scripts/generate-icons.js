import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function createPng(width, height, drawPixel) {
  // RGBA buffer with filter byte 0 at the start of each scanline
  const scanlineLength = width * 4 + 1;
  const rawData = Buffer.alloc(scanlineLength * height);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * scanlineLength;
    rawData[rowOffset] = 0; // Filter type: None
    for (let x = 0; x < width; x++) {
      const pixelOffset = rowOffset + 1 + x * 4;
      const [r, g, b, a] = drawPixel(x, y, width, height);
      rawData[pixelOffset] = r;
      rawData[pixelOffset + 1] = g;
      rawData[pixelOffset + 2] = b;
      rawData[pixelOffset + 3] = a;
    }
  }

  const deflated = zlib.deflateSync(rawData);

  // PNG Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR Chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // Bit depth: 8
  ihdr[9] = 6; // Color type: RGBA
  ihdr[10] = 0; // Compression
  ihdr[11] = 0; // Filter
  ihdr[12] = 0; // Interlace
  const ihdrChunk = createChunk('IHDR', ihdr);

  // IDAT Chunk
  const idatChunk = createChunk('IDAT', deflated);

  // IEND Chunk
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function createChunk(type, data) {
  const typeBuf = Buffer.from(type);
  const lengthBuf = Buffer.alloc(4);
  lengthBuf.writeUInt32BE(data.length, 0);

  const crcPayload = Buffer.concat([typeBuf, data]);
  const crc = crc32(crcPayload);

  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc, 0);

  return Buffer.concat([lengthBuf, typeBuf, data, crcBuf]);
}

// CRC32 table
const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    if (c & 1) c = 0xedb88320 ^ (c >>> 1);
    else c = c >>> 1;
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

// Shield icon renderer with gradient and QR motif
function drawShieldPixel(x, y, w, h) {
  const nx = (x / (w - 1)) * 2 - 1; // -1 to 1
  const ny = (y / (h - 1)) * 2 - 1; // -1 to 1

  // Circular background badge
  const distSq = nx * nx + ny * ny;
  if (distSq > 0.95) {
    return [0, 0, 0, 0]; // Transparent outside circle
  }

  // Rounded blue shield badge gradient (#1A73E8 to #1557B0)
  const grad = (ny + 1) / 2;
  const bgR = Math.round(26 - grad * 10);
  const bgG = Math.round(115 - grad * 30);
  const bgB = Math.round(232 - grad * 40);

  // Shield boundary inside circle
  const shieldWidth = 0.55;
  const inTop = ny >= -0.65 && ny <= 0.0 && Math.abs(nx) <= shieldWidth;
  const inBottom = ny > 0.0 && ny <= 0.65 && Math.abs(nx) <= shieldWidth * (1 - (ny / 0.65) * 0.7);

  if (inTop || inBottom) {
    // Shield border / highlight
    const isEdge =
      Math.abs(nx) >= shieldWidth - 0.1 ||
      (ny < -0.55) ||
      (ny > 0.55);

    if (isEdge) {
      return [255, 255, 255, 255]; // White border
    }

    // Shield center: checkmark / security cross
    const cx = Math.abs(nx);
    if (cx < 0.12 && Math.abs(ny - 0.05) < 0.35) {
      return [255, 255, 255, 255];
    }
    if (Math.abs(ny - 0.05) < 0.12 && cx < 0.28) {
      return [255, 255, 255, 255];
    }

    return [34, 197, 94, 255]; // Green shield fill (#22C55E)
  }

  return [bgR, bgG, bgB, 255];
}

const iconsDir = path.resolve(__dirname, '../public/icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

[16, 32, 48, 128].forEach(size => {
  const png = createPng(size, size, drawShieldPixel);
  const filePath = path.join(iconsDir, `icon${size}.png`);
  fs.writeFileSync(filePath, png);
  console.log(`Generated ${filePath} (${size}x${size})`);
});
