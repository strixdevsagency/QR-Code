import React, { useEffect } from 'react';

interface AdBannerProps {
  slotType: 'leaderboard' | 'rectangle' | 'skyscraper' | 'in-feed';
  className?: string;
  adClient?: string; // e.g. "ca-pub-XXXXXXXXXXXXXXXX"
  adSlot?: string;
}

export const AdBanner: React.FC<AdBannerProps> = ({ slotType, className = '', adClient, adSlot }) => {
  useEffect(() => {
    // If real Google AdSense client ID is configured in production, push to adsbygoogle
    if (adClient && adSlot && typeof window !== 'undefined') {
      try {
        // @ts-ignore
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (e) {
        // silently ignore adblocker errors
      }
    }
  }, [adClient, adSlot]);

  // Dimension presets to guarantee 0 CLS (Cumulative Layout Shift)
  const dimensions = {
    leaderboard: 'w-full max-w-[728px] min-h-[90px]',
    rectangle: 'w-[300px] sm:w-[336px] min-h-[250px] sm:min-h-[280px]',
    skyscraper: 'w-[300px] min-h-[600px]',
    'in-feed': 'w-full min-h-[120px] max-w-[800px]',
  }[slotType];

  return (
    <div className={`mx-auto flex flex-col items-center justify-center my-4 ${className}`}>
      <span className="text-[10px] uppercase tracking-wider text-slate-500 mb-1 font-mono">
        Advertisement
      </span>

      <div
        className={`${dimensions} rounded-xl border border-dashed border-slate-800 bg-slate-900/50 flex flex-col items-center justify-center p-4 relative overflow-hidden transition hover:border-slate-700/80 group`}
      >
        {adClient && adSlot ? (
          // Real Google AdSense Tag
          <ins
            className="adsbygoogle"
            style={{ display: 'block' }}
            data-ad-client={adClient}
            data-ad-slot={adSlot}
            data-ad-format="auto"
            data-full-width-responsive="true"
          />
        ) : (
          // High-Converting Placeholder for AdSense / Direct Sponsors
          <div className="flex flex-col items-center text-center max-w-sm px-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-2 text-indigo-400 group-hover:scale-105 transition">
              <span className="text-xs font-bold font-mono">AD</span>
            </div>
            <p className="text-xs font-medium text-slate-300">
              Google AdSense / Sponsor Placement Space
            </p>
            <p className="text-[11px] text-slate-500 mt-1">
              Reach North American business owners in Chicago, NY & Canada.
            </p>
            <a
              href="#sponsor-section"
              className="mt-2 text-[10px] text-indigo-400 hover:text-indigo-300 underline font-medium"
            >
              Advertise here with StrixDevs →
            </a>
          </div>
        )}
      </div>
    </div>
  );
};
