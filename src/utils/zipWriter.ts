/**
 * Lightweight in-browser ZIP generator (Store mode / 0 compression)
 * Zero external dependencies. Fast and compatible with standard zip extractors.
 */

// CRC-32 Lookup Table
const crcTable = new Uint32Array(256);
for (let i = 0; i < 256; i++) {
  let c = i;
  for (let k = 0; k < 8; k++) {
    c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
  }
  crcTable[i] = c;
}

function calculateCRC32(bytes: Uint8Array): number {
  let crc = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) {
    crc = crcTable[(crc ^ bytes[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

export interface ZipEntry {
  filename: string;
  data: Uint8Array;
}

export function createZipBlob(entries: ZipEntry[]): Blob {
  const localHeadersAndData: Uint8Array[] = [];
  const centralHeaders: Uint8Array[] = [];
  let currentOffset = 0;

  for (const entry of entries) {
    const filenameBytes = new TextEncoder().encode(entry.filename);
    const dataBytes = entry.data;
    const crc = calculateCRC32(dataBytes);
    const size = dataBytes.length;

    // --- Local File Header (30 bytes + filename) ---
    const localHeader = new Uint8Array(30 + filenameBytes.length);
    const localView = new DataView(localHeader.buffer);

    localView.setUint32(0, 0x04034b50, true); // Local header signature
    localView.setUint16(4, 20, true);         // Version needed
    localView.setUint16(6, 0, true);          // General purpose bit flag
    localView.setUint16(8, 0, true);          // Compression: Store (0)
    localView.setUint16(10, 0, true);         // Mod time
    localView.setUint16(12, 0, true);         // Mod date
    localView.setUint32(14, crc, true);        // CRC-32
    localView.setUint32(18, size, true);       // Compressed size
    localView.setUint32(22, size, true);       // Uncompressed size
    localView.setUint16(26, filenameBytes.length, true); // Filename length
    localView.setUint16(28, 0, true);          // Extra field length
    localHeader.set(filenameBytes, 30);

    localHeadersAndData.push(localHeader);
    localHeadersAndData.push(dataBytes);

    // --- Central Directory Header (46 bytes + filename) ---
    const centralHeader = new Uint8Array(46 + filenameBytes.length);
    const centralView = new DataView(centralHeader.buffer);

    centralView.setUint32(0, 0x02014b50, true); // Central header signature
    centralView.setUint16(4, 20, true);         // Version made by
    centralView.setUint16(6, 20, true);         // Version needed
    centralView.setUint16(8, 0, true);          // Flags
    centralView.setUint16(10, 0, true);         // Compression: Store (0)
    centralView.setUint16(12, 0, true);         // Mod time
    centralView.setUint16(14, 0, true);         // Mod date
    centralView.setUint32(16, crc, true);        // CRC-32
    centralView.setUint32(20, size, true);       // Compressed size
    centralView.setUint32(24, size, true);       // Uncompressed size
    centralView.setUint16(28, filenameBytes.length, true); // Filename length
    centralView.setUint16(30, 0, true);          // Extra field length
    centralView.setUint16(32, 0, true);          // File comment length
    centralView.setUint16(34, 0, true);          // Disk number start
    centralView.setUint16(36, 0, true);          // Internal attributes
    centralView.setUint32(38, 0, true);          // External attributes
    centralView.setUint32(42, currentOffset, true); // Relative offset of local header
    centralHeader.set(filenameBytes, 46);

    centralHeaders.push(centralHeader);

    // Advance offset
    currentOffset += localHeader.length + dataBytes.length;
  }

  // Calculate size of central directory
  let centralDirSize = 0;
  for (const h of centralHeaders) centralDirSize += h.length;

  // --- End of Central Directory (EOCD) (22 bytes) ---
  const eocd = new Uint8Array(22);
  const eocdView = new DataView(eocd.buffer);

  eocdView.setUint32(0, 0x06054b50, true); // EOCD signature
  eocdView.setUint16(4, 0, true);          // Disk number
  eocdView.setUint16(6, 0, true);          // Start disk
  eocdView.setUint16(8, entries.length, true);  // Entries on disk
  eocdView.setUint16(10, entries.length, true); // Total entries
  eocdView.setUint32(12, centralDirSize, true); // Central dir size
  eocdView.setUint32(16, currentOffset, true);  // Offset of central dir
  eocdView.setUint16(20, 0, true);              // Comment length

  const allParts: (Uint8Array | BlobPart)[] = [...localHeadersAndData, ...centralHeaders, eocd];
  return new Blob(allParts as BlobPart[], { type: 'application/zip' });
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
