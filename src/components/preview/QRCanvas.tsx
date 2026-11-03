import React, { useEffect, useRef } from 'react';
import QRCodeStyling from 'qr-code-styling';
import type { QRDesignOptions } from '../../types';

interface QRCanvasProps {
  payload: string;
  design: QRDesignOptions;
  onCanvasReady?: (canvas: HTMLCanvasElement | null) => void;
}

export const QRCanvas: React.FC<QRCanvasProps> = ({ payload, design, onCanvasReady }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const qrInstance = useRef<QRCodeStyling | null>(null);

  useEffect(() => {
    if (!qrInstance.current) {
      qrInstance.current = new QRCodeStyling({
        width: 300,
        height: 300,
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
          color: design.cornerSquareColor || design.dotsColor,
        },
        cornersDotOptions: {
          type: design.cornerDotType as any,
          color: design.cornerDotColor || design.dotsColor,
        },
        backgroundOptions: {
          color: design.backgroundColor,
        },
      });

      if (containerRef.current) {
        containerRef.current.innerHTML = '';
        qrInstance.current.append(containerRef.current);
      }
    } else {
      qrInstance.current.update({
        data: payload || 'https://strixdevs.com',
        image: design.logoUrl || undefined,
        margin: design.margin,
        qrOptions: {
          errorCorrectionLevel: design.logoUrl ? 'H' : 'Q',
        },
        imageOptions: {
          imageSize: design.logoSize || 0.35,
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
          color: design.cornerSquareColor || design.dotsColor,
        },
        cornersDotOptions: {
          type: design.cornerDotType as any,
          color: design.cornerDotColor || design.dotsColor,
        },
        backgroundOptions: {
          color: design.backgroundColor,
        },
      });
    }

    const timer = setTimeout(() => {
      const canvas = containerRef.current?.querySelector('canvas') || null;
      if (onCanvasReady) onCanvasReady(canvas);
    }, 150);

    return () => clearTimeout(timer);
  }, [payload, design, onCanvasReady]);

  return (
    <div
      ref={containerRef}
      className="p-3 rounded-2xl bg-white shadow-inner flex items-center justify-center select-none"
    />
  );
};
