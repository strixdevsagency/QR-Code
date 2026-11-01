import React, { useEffect, useMemo } from 'react';
import { db } from '../services/db';

interface AdBannerProps {
  slotType: 'leaderboard' | 'rectangle' | 'skyscraper' | 'in-feed';
  className?: string;
}

export const AdBanner: React.FC<AdBannerProps> = ({ slotType, className = '' }) => {
  const slotConfig = useMemo(() => {
    const slots = db.getAdSlots();
    const map: Record<string, string> = {
      leaderboard: 'leaderboard',
      rectangle: 'sidebar',
      skyscraper: 'sidebar',
      'in-feed': 'infeed',
    };
    const targetId = map[slotType] || 'leaderboard';
    return slots.find((s) => s.id === targetId);
  }, [slotType]);

  useEffect(() => {
    if (slotConfig?.enabled && slotConfig.adClient && slotConfig.adSlot && typeof window !== 'undefined') {
      try {
        // @ts-ignore
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (e) {
        // silently ignore adblocker errors
      }
    }
  }, [slotConfig]);

  if (slotConfig && !slotConfig.enabled) {
    return null;
  }

  const dimensions = {
    leaderboard: 'w-full max-w-[728px] min-h-[90px]',
    rectangle: 'w-[300px] sm:w-[320px] min-h-[250px]',
    skyscraper: 'w-[300px] min-h-[600px]',
    'in-feed': 'w-full min-h-[100px] max-w-[800px]',
  }[slotType];

  return (
    <div className={`mx-auto flex flex-col items-center justify-center my-4 ${className}`}>
      <span className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1 font-mono">
        Advertisement
      </span>

      <div
        className={`${dimensions} rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xs flex flex-col items-center justify-center p-4 relative overflow-hidden transition shadow-xs`}
      >
        {slotConfig?.customHtml ? (
          <div
            dangerouslySetInnerHTML={{ __html: slotConfig.customHtml }}
            className="w-full h-full flex items-center justify-center"
          />
        ) : slotConfig?.adClient && slotConfig.adSlot ? (
          <ins
            className="adsbygoogle"
            style={{ display: 'block' }}
            data-ad-client={slotConfig.adClient}
            data-ad-slot={slotConfig.adSlot}
            data-ad-format="auto"
            data-full-width-responsive="true"
          />
        ) : (
          <div className="flex flex-col items-center text-center max-w-sm px-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded border border-indigo-200 dark:border-indigo-800 mb-1.5">
              Sponsor Placement
            </span>
            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              Google AdSense & Brand Space
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Serving businesses across Chicago, New York & Canada.
            </p>
            <a
              href="#sponsor-section"
              className="mt-2 text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
            >
              Inquire to Sponsor Here →
            </a>
          </div>
        )}
      </div>
    </div>
  );
};
