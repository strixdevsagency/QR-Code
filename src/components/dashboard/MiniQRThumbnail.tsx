import React, { useEffect, useRef } from 'react';
import QRCodeStyling from 'qr-code-styling';
import type { QRDesignOptions } from '../../types';

interface MiniQRThumbnailProps {
  payload: string;
  design: QRDesignOptions;
  size?: number;
  className?: string;
  onCanvasReady?: (canvas: HTMLCanvasElement | null) => void;
}

export const MiniQRThumbnail: React.FC<MiniQRThumbnailProps> = ({
  payload,
  design,
  size = 80,
  className = '',
  onCanvasReady,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const qrInstanceRef = useRef<QRCodeStyling | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Reset container DOM
    containerRef.current.innerHTML = '';

    const qr = new QRCodeStyling({
      width: size,
      height: size,
      type: 'canvas',
      data: payload || 'https://qr.strixdevs.com',
      image: design.logoUrl || undefined,
      margin: Math.max(2, Math.round((design.margin || 8) * (size / 300))),
      qrOptions: {
        typeNumber: 0,
        mode: 'Byte',
        errorCorrectionLevel: design.logoUrl ? 'H' : 'Q',
      },
      imageOptions: {
        hideBackgroundDots: true,
        imageSize: design.logoSize || 0.26,
        margin: 2,
        crossOrigin: 'anonymous',
      },
      dotsOptions: {
        type: design.dotsType as any,
        color: design.dotsColor || '#0f172a',
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
        color: design.cornerSquareColor || design.dotsColor || '#0f172a',
      },
      cornersDotOptions: {
        type: design.cornerDotType as any,
        color: design.cornerDotColor || design.dotsColor || '#0f172a',
      },
      backgroundOptions: {
        color: design.backgroundColor || '#ffffff',
      },
    });

    qrInstanceRef.current = qr;
    qr.append(containerRef.current);

    // Grab canvas element once rendered
    const timeout = setTimeout(() => {
      if (containerRef.current) {
        const canvas = containerRef.current.querySelector('canvas');
        if (onCanvasReady) onCanvasReady(canvas);
      }
    }, 50);

    return () => clearTimeout(timeout);
  }, [payload, design, size, onCanvasReady]);

  return (
    <div
      ref={containerRef}
      className={`rounded-xl overflow-hidden shadow-inner border border-white/[0.1] bg-white flex items-center justify-center shrink-0 ${className}`}
      style={{ width: size, height: size }}
      title="QR Matrix Preview"
    />
  );
};
