import QRCodeStyling from 'qr-code-styling';
import type { QRDesignOptions, BulkQRItem } from '../types';
import { createZipBlob, downloadBlob, type ZipEntry } from './zipWriter';

export function parseCSVInput(rawText: string): { title: string; payload: string }[] {
  const lines = rawText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const results: { title: string; payload: string }[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // Skip comment lines
    if (line.startsWith('#')) continue;

    // Check if CSV format: Title, URL
    const commaIndex = line.indexOf(',');
    if (commaIndex > -1) {
      const title = line.slice(0, commaIndex).trim().replace(/^["']|["']$/g, '');
      const payload = line.slice(commaIndex + 1).trim().replace(/^["']|["']$/g, '');
      if (payload) {
        results.push({ title: title || `Item ${results.length + 1}`, payload });
        continue;
      }
    }

    // Otherwise single string (e.g. line is just the URL)
    results.push({
      title: `Item ${results.length + 1}`,
      payload: line,
    });
  }

  return results;
}

export async function generateSingleQRPNG(
  payload: string,
  design: QRDesignOptions
): Promise<{ bytes: Uint8Array; dataUrl: string }> {
  const qr = new QRCodeStyling({
    width: 600,
    height: 600,
    type: 'canvas',
    data: payload || 'https://strixdevs.com',
    image: design.logoUrl || undefined,
    margin: design.margin,
    qrOptions: {
      typeNumber: 0,
      mode: 'Byte',
      errorCorrectionLevel: design.logoUrl ? 'H' : 'Q',
    },
    imageOptions: {
      hideBackgroundDots: true,
      imageSize: design.logoSize || 0.35,
      margin: 4,
      crossOrigin: 'anonymous',
    },
    dotsOptions: {
      type: design.dotsType as any,
      color: design.dotsColor,
      gradient: design.isGradient && design.dotsColorEnd
        ? {
            type: design.gradientType,
            rotation: 0,
            colorStops: [
              { offset: 0, color: design.dotsColor },
              { offset: 1, color: design.dotsColorEnd },
            ],
          }
        : undefined,
    },
    cornersSquareOptions: {
      type: design.cornerSquareType as any,
      color: design.cornerSquareColor,
    },
    cornersDotOptions: {
      type: design.cornerDotType as any,
      color: design.cornerDotColor,
    },
    backgroundOptions: {
      color: design.backgroundColor,
    },
  });

  const raw = await qr.getRawData('png');
  if (!raw) throw new Error('Could not generate QR code PNG blob');

  let bytes: Uint8Array;
  let blob: Blob;

  if (typeof (raw as any).arrayBuffer === 'function') {
    blob = raw as Blob;
    const arrayBuffer = await (raw as Blob).arrayBuffer();
    bytes = new Uint8Array(arrayBuffer);
  } else {
    bytes = new Uint8Array(raw as any);
    blob = new Blob([bytes.buffer as ArrayBuffer], { type: 'image/png' });
  }

  const dataUrl = URL.createObjectURL(blob);

  return { bytes, dataUrl };
}

export async function batchDownloadZip(
  items: BulkQRItem[],
  design: QRDesignOptions,
  onProgress?: (current: number, total: number) => void
) {
  const entries: ZipEntry[] = [];
  const total = items.length;

  for (let i = 0; i < total; i++) {
    const item = items[i];
    try {
      const { bytes } = await generateSingleQRPNG(item.payload, design);
      const safeFilename = `${item.title.replace(/[^a-zA-Z0-9_-]/g, '_') || `qr_${i + 1}`}.png`;
      entries.push({
        filename: safeFilename,
        data: bytes,
      });
    } catch (e) {
      console.error(`Failed to generate QR for ${item.title}`, e);
    }
    if (onProgress) onProgress(i + 1, total);
  }

  const zipBlob = createZipBlob(entries);
  downloadBlob(zipBlob, `strix-bulk-qr-pack-${Date.now()}.zip`);
}
