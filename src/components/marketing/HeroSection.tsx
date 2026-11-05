import React from 'react';

export const HeroSection: React.FC = () => {
  return (
    <section className="text-center max-w-3xl mx-auto my-8 sm:my-10">
      <div className="inline-flex items-center px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-slate-300 text-xs font-medium mb-4">
        <span>StrixDevs Official Software • Trusted by Businesses Worldwide</span>
      </div>

      <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
        Free Lifetime QR Code <br className="hidden sm:inline" />
        Generator & Scanner
      </h1>

      <p className="mt-3 text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
        Direct static encoding ensures your printed cards, menus, and business flyers work permanently with zero monthly fees and zero expiration trials.
      </p>

      <div className="mt-5 flex flex-wrap items-center justify-center gap-4 text-xs text-slate-400 font-medium">
        <span className="text-emerald-400">✓ Direct Static Codes</span>
        <span className="text-slate-600">•</span>
        <span className="text-emerald-400">✓ Vector Print SVG & PDF</span>
        <span className="text-slate-600">•</span>
        <span className="text-emerald-400">✓ No Credit Card Required</span>
      </div>
    </section>
  );
};
