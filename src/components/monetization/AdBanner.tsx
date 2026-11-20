import React, { useEffect, useMemo } from 'react';
import { ExternalLink, Sparkles, Shield, ArrowRight, Zap, Info } from 'lucide-react';
import { db } from '../../services/db';
import { useAuth } from '../../context/AuthContext';
import { playTactileClick } from '../../utils/audioFeedback';

interface AdBannerProps {
  slotType: 'leaderboard' | 'rectangle' | 'skyscraper' | 'in-feed';
  className?: string;
  onOpenPricing?: () => void;
}

export const AdBanner: React.FC<AdBannerProps> = ({ slotType, className = '', onOpenPricing }) => {
  const { user } = useAuth();

  // 1. Pro and Enterprise subscribers get a 100% Ad-Free experience
  if (user?.tier === 'pro' || user?.tier === 'enterprise') {
    return null;
  }

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

  const sponsor = slotConfig?.directSponsor;
  const isSponsorValid = Boolean(
    sponsor &&
    sponsor.isActive &&
    (!sponsor.endDate || new Date(sponsor.endDate).getTime() >= Date.now())
  );

  useEffect(() => {
    if (
      !isSponsorValid &&
      slotConfig?.enabled &&
      slotConfig.adClient &&
      slotConfig.adSlot &&
      typeof window !== 'undefined'
    ) {
      try {
        // @ts-ignore
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch {
        // ignore
      }
    }
  }, [slotConfig, isSponsorValid]);

  // If slot is explicitly disabled by admin and marked to hide without sponsor:
  if (slotConfig && !slotConfig.enabled && slotConfig.hideWhenNoSponsor) {
    return null;
  }

  const dimensions = {
    leaderboard: 'w-full max-w-[728px] min-h-[90px]',
    rectangle: 'w-[300px] min-h-[250px]',
    skyscraper: 'w-[300px] min-h-[600px]',
    'in-feed': 'w-full min-h-[90px] max-w-4xl',
  }[slotType];

  // =========================================================================
  // SCENARIO 1: DIRECT CORPORATE SPONSOR ACTIVE
  // =========================================================================
  if (isSponsorValid && sponsor) {
    return (
      <div className={`mx-auto flex flex-col items-center justify-center my-6 ${className}`}>
        <div className="flex items-center justify-between w-full max-w-[728px] px-2 mb-1.5 text-[9px] uppercase tracking-widest font-mono text-zinc-500">
          <span className="flex items-center gap-1">
            <Info className="w-2.5 h-2.5" /> Official Corporate Partner
          </span>
          <span className="text-[#38bdf8] font-semibold">{sponsor.sponsorName}</span>
        </div>

        <div className={`${dimensions} rounded-2xl overflow-hidden flex items-center justify-center border border-white/[0.08] bg-zinc-900/70 backdrop-blur-xl transition hover:border-[#38bdf8]/30 shadow-lg shadow-black/30`}>
          {sponsor.customHtml ? (
            <div
              dangerouslySetInnerHTML={{ __html: sponsor.customHtml }}
              className="w-full h-full flex items-center justify-center"
            />
          ) : sponsor.imageUrl ? (
            <a
              href={sponsor.sponsorUrl || '#'}
              target="_blank"
              rel="noreferrer"
              className="w-full h-full block group relative"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={sponsor.imageUrl}
                alt={sponsor.sponsorName}
                className="w-full h-full object-cover"
              />
              <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/80 text-[10px] text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 font-semibold">
                Visit Partner <ExternalLink className="w-2.5 h-2.5" />
              </span>
            </a>
          ) : (
            <a
              href={sponsor.sponsorUrl || '#'}
              target="_blank"
              rel="noreferrer"
              className="p-4 text-center hover:opacity-90 transition block"
            >
              <span className="text-sm font-bold text-white hover:text-[#38bdf8] transition-colors">{sponsor.sponsorName}</span>
              <p className="text-xs text-zinc-400 mt-1">Official StrixDevs Corporate Partner</p>
            </a>
          )}
        </div>
      </div>
    );
  }

  // =========================================================================
  // SCENARIO 2: GOOGLE ADSENSE OR CUSTOM HTML CONFIGURED
  // =========================================================================
  if (slotConfig?.customHtml || (slotConfig?.adClient && slotConfig?.adSlot)) {
    return (
      <div className={`mx-auto flex flex-col items-center justify-center my-6 ${className}`}>
        <div className="flex items-center justify-between w-full max-w-[728px] px-2 mb-1 text-[9px] uppercase tracking-widest font-mono text-zinc-500">
          <span>Advertisement</span>
          {onOpenPricing && (
            <button
              type="button"
              onClick={() => {
                playTactileClick();
                onOpenPricing();
              }}
              className="hover:text-[#38bdf8] transition cursor-pointer"
            >
              Go Ad-Free
            </button>
          )}
        </div>
        <div className={`${dimensions} rounded-2xl overflow-hidden flex items-center justify-center border border-white/[0.08] bg-zinc-900/60`}>
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
  }

  // =========================================================================
  // SCENARIO 3: DEFAULT FREE MODE AD BANNERS (Active in Free Mode)
  // Ensures free mode visitors always see designated sponsor / partner spots
  // =========================================================================

  // A. SIDEBAR RECTANGLE (300x250)
  if (slotType === 'rectangle') {
    return (
      <div className={`w-[300px] flex flex-col items-center my-4 ${className}`}>
        <div className="flex items-center justify-between w-full px-1 mb-1.5 text-[9px] uppercase tracking-widest font-mono text-zinc-500">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#38bdf8]" /> Sponsored
          </span>
          {onOpenPricing && (
            <button
              type="button"
              onClick={() => {
                playTactileClick();
                onOpenPricing();
              }}
              className="text-zinc-400 hover:text-[#38bdf8] transition cursor-pointer"
            >
              Go Ad-Free
            </button>
          )}
        </div>

        <div className="w-[300px] min-h-[220px] rounded-2xl p-4.5 bg-gradient-to-br from-zinc-900 via-zinc-900/90 to-zinc-950 border border-white/[0.08] hover:border-[#38bdf8]/30 transition shadow-xl shadow-black/40 flex flex-col justify-between group relative overflow-hidden text-left">
          {/* Subtle luminous ambient glow */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#38bdf8]/10 rounded-full blur-2xl pointer-events-none -mr-4 -mt-4 group-hover:bg-[#38bdf8]/20 transition-all" />

          <div>
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="px-2 py-0.5 rounded-md bg-[#38bdf8]/10 border border-[#38bdf8]/20 text-[#38bdf8] text-[10px] font-mono font-bold uppercase tracking-wider">
                Strix Cloud Partner
              </span>
              <span className="text-[10px] text-zinc-500 font-mono">Ad</span>
            </div>

            <h4 className="text-sm font-bold text-white tracking-tight group-hover:text-[#38bdf8] transition-colors">
              Dynamic QR Cloud & Edge Redirects
            </h4>
            <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">
              Never re-print menus or flyers again. Switch destinations anytime with real-time scan analytics and custom subdomains.
            </p>
          </div>

          <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between gap-2">
            <span className="text-[11px] text-zinc-400 font-medium">
              From <strong className="text-white">$7/mo</strong>
            </span>
            {onOpenPricing ? (
              <button
                type="button"
                onClick={() => {
                  playTactileClick();
                  onOpenPricing();
                }}
                className="px-3 py-1.5 rounded-xl bg-[#38bdf8] hover:bg-[#38bdf8]/90 text-[#09090b] text-xs font-bold transition flex items-center gap-1 cursor-pointer active:scale-95 shadow-md shadow-[#38bdf8]/20"
              >
                <span>Upgrade Pro</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            ) : (
              <a
                href="#pricing"
                className="px-3 py-1.5 rounded-xl bg-[#38bdf8] hover:bg-[#38bdf8]/90 text-[#09090b] text-xs font-bold transition flex items-center gap-1 cursor-pointer"
              >
                <span>Learn More</span>
                <ArrowRight className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>
      </div>
    );
  }

  // B. TOP LEADERBOARD BANNER (728x90)
  if (slotType === 'leaderboard') {
    return (
      <div className={`w-full max-w-[728px] mx-auto my-6 flex flex-col items-center ${className}`}>
        <div className="flex items-center justify-between w-full px-2 mb-1.5 text-[9px] uppercase tracking-widest font-mono text-zinc-500">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Sponsored Partner
          </span>
          {onOpenPricing && (
            <button
              type="button"
              onClick={() => {
                playTactileClick();
                onOpenPricing();
              }}
              className="text-zinc-400 hover:text-[#38bdf8] transition cursor-pointer"
            >
              Remove Ads with Strix Pro
            </button>
          )}
        </div>

        <div className="w-full rounded-2xl p-3.5 sm:p-4 bg-gradient-to-r from-zinc-900/90 via-zinc-900/60 to-zinc-950/90 border border-white/[0.08] hover:border-[#38bdf8]/30 transition shadow-lg shadow-black/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#38bdf8]/10 border border-[#38bdf8]/25 flex items-center justify-center text-[#38bdf8] shrink-0">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-bold text-white">
                  Professional QR Print Studio
                </span>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400 font-mono">
                  Partner
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-zinc-400 leading-snug mt-0.5">
                Turn your Strix vector SVGs into UV-resistant acrylic stands, aluminum signs, and weather-proof vinyl decals.
              </p>
            </div>
          </div>

          <div className="shrink-0 flex items-center gap-2 self-end sm:self-center">
            <a
              href="#contact"
              className="px-3.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold transition cursor-pointer whitespace-nowrap"
            >
              Order Prints
            </a>
          </div>
        </div>
      </div>
    );
  }

  // C. IN-FEED BANNER (Responsive)
  return (
    <div className={`w-full max-w-4xl mx-auto my-8 flex flex-col items-center ${className}`}>
      <div className="flex items-center justify-between w-full px-2 mb-1.5 text-[9px] uppercase tracking-widest font-mono text-zinc-500">
        <span>Featured Partner Announcement</span>
        {onOpenPricing && (
          <button
            type="button"
            onClick={() => {
              playTactileClick();
              onOpenPricing();
            }}
            className="text-zinc-400 hover:text-[#38bdf8] transition cursor-pointer"
          >
            Ad-Free Mode
          </button>
        )}
      </div>

      <div className="w-full rounded-2xl p-4 sm:p-5 bg-gradient-to-r from-zinc-900 via-zinc-900/80 to-zinc-950 border border-white/[0.08] hover:border-white/15 transition shadow-lg shadow-black/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#38bdf8]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>High-Volume Developer REST API & Webhooks</span>
          </div>
          <p className="text-xs text-zinc-400 max-w-2xl leading-relaxed">
            Need to programmatically generate 50,000+ vector QR codes per minute from your CRM or backend stack? Discover StrixDevs enterprise headless matrix engines.
          </p>
        </div>

        <a
          href="#contact"
          className="shrink-0 px-4 py-2 rounded-xl bg-[#38bdf8] hover:bg-[#38bdf8]/90 text-[#09090b] text-xs font-bold transition flex items-center gap-1.5 cursor-pointer self-start sm:self-center shadow-md shadow-[#38bdf8]/20"
        >
          <span>Contact Team</span>
          <ArrowRight className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
};
