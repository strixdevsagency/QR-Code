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
      } catch {
        // ignore
      }
    }
  }, [slotConfig]);

  // If slot is disabled or does not have real ad code, COLLAPSE completely!
  if (!slotConfig || !slotConfig.enabled) {
    return null;
  }

  // Only render if there is actual custom HTML or real ad client configured
  const hasRealContent = Boolean(slotConfig.customHtml || (slotConfig.adClient && slotConfig.adSlot));
  if (!hasRealContent) {
    return null; // Collapsed as requested by user
  }

  const dimensions = {
    leaderboard: 'w-full max-w-[728px] min-h-[90px]',
    rectangle: 'w-[300px] min-h-[250px]',
    skyscraper: 'w-[300px] min-h-[600px]',
    'in-feed': 'w-full min-h-[90px] max-w-[768px]',
  }[slotType];

  return (
    <div className={`mx-auto flex flex-col items-center justify-center my-6 ${className}`}>
      <span className="text-[9px] uppercase tracking-widest text-slate-400 dark:text-slate-600 mb-1 font-mono">
        Partner Ad
      </span>
      <div className={`${dimensions} rounded-2xl overflow-hidden flex items-center justify-center`}>
        {slotConfig.customHtml ? (
          <div
            dangerouslySetInnerHTML={{ __html: slotConfig.customHtml }}
            className="w-full h-full flex items-center justify-center"
          />
        ) : (
          <ins
            className="adsbygoogle"
            style={{ display: 'block' }}
            data-ad-client={slotConfig.adClient}
            data-ad-slot={slotConfig.adSlot}
            data-ad-format="auto"
            data-full-width-responsive="true"
          />
        )}
      </div>
    </div>
  );
};
