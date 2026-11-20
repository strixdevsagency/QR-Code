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
          imageSize: design.logoSize || 0.26,
          margin: 3,
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
        image: design.logoUrl || '',
        margin: design.margin,
        qrOptions: {
          errorCorrectionLevel: design.logoUrl ? 'H' : 'Q',
        },
        imageOptions: {
          hideBackgroundDots: true,
          imageSize: design.logoSize || 0.26,
          margin: 3,
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

    let isCancelled = false;
    const notifyReady = () => {
      if (isCancelled) return;
      const canvas = containerRef.current?.querySelector('canvas') || null;
      if (onCanvasReady) onCanvasReady(canvas);
    };

    const drawingPromise = (qrInstance.current as any)?._canvasDrawingPromise;
    if (drawingPromise && typeof drawingPromise.then === 'function') {
      drawingPromise.then(() => {
        setTimeout(notifyReady, 50);
      });
    }

    const timer = setTimeout(notifyReady, 140);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [payload, design, onCanvasReady]);

  return (
    <div className="relative group my-1">
      {/* Precision Ambient Backlight */}
      <div className="absolute inset-0 bg-blue-500/10 rounded-3xl blur-2xl -z-10 group-hover:bg-blue-500/20 transition-all duration-500 pointer-events-none" />

      {/* Optical Corner Viewfinder Brackets */}
      <div className="absolute -top-2 -left-2 w-3.5 h-3.5 border-t-2 border-l-2 border-zinc-700/80 group-hover:border-blue-400 transition-colors duration-300 pointer-events-none rounded-tl-sm" />
      <div className="absolute -top-2 -right-2 w-3.5 h-3.5 border-t-2 border-r-2 border-zinc-700/80 group-hover:border-blue-400 transition-colors duration-300 pointer-events-none rounded-tr-sm" />
      <div className="absolute -bottom-2 -left-2 w-3.5 h-3.5 border-b-2 border-l-2 border-zinc-700/80 group-hover:border-blue-400 transition-colors duration-300 pointer-events-none rounded-bl-sm" />
      <div className="absolute -bottom-2 -right-2 w-3.5 h-3.5 border-b-2 border-r-2 border-zinc-700/80 group-hover:border-blue-400 transition-colors duration-300 pointer-events-none rounded-br-sm" />

      <div
        ref={containerRef}
        className={`p-3.5 rounded-2xl shadow-2xl shadow-black/70 ring-1 ring-black/10 flex items-center justify-center select-none transition-all duration-300 group-hover:scale-[1.015] group-hover:shadow-3xl ${
          design.backgroundColor === 'transparent'
            ? 'bg-[linear-gradient(45deg,#f1f5f9_25%,transparent_25%),linear-gradient(-45deg,#f1f5f9_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#f1f5f9_75%),linear-gradient(-45deg,transparent_75%,#f1f5f9_75%)] [background-size:12px_12px] [background-position:0_0,0_6px,6px_-6px,-6px_0px] bg-white'
            : 'bg-white'
        }`}
      />
    </div>
  );
};
