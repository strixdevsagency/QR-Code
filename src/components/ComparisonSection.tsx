import React from 'react';

export const ComparisonSection: React.FC = () => {
  return (
    <section id="why-expire" className="my-20 max-w-4xl mx-auto px-4 scroll-mt-24">
      <div className="text-center mb-10">
        <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2.5 py-1 rounded-md border border-indigo-200 dark:border-indigo-800 inline-block mb-2">
          Architecture Difference
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Direct Static QR vs Subscription Traps
        </h2>
        <p className="text-slate-500 dark:text-slate-400 mt-2 text-xs sm:text-sm max-w-xl mx-auto">
          Why businesses across Chicago, New York, and Canada trust Strix QR for physical print runs.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Competitors */}
        <div className="rounded-3xl border border-rose-200 dark:border-rose-900/40 bg-white dark:bg-slate-900/60 p-6 sm:p-7 shadow-xs">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-6 h-6 rounded-full bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold text-xs">
              ✕
            </span>
            <h3 className="text-sm font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
              Typical Subscription Generators
            </h3>
          </div>
          <ul className="space-y-3.5 text-xs text-slate-600 dark:text-slate-300">
            <li className="flex items-start gap-2.5">
              <span className="text-rose-500 font-bold shrink-0 mt-0.5">✕</span>
              <span><strong>Hidden Redirection Servers:</strong> Encodes their private shortlink instead of your true web destination.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="text-rose-500 font-bold shrink-0 mt-0.5">✕</span>
              <span><strong>14-Day Deactivation:</strong> Once the trial period ends, their server turns off the redirect and shows a paywall.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="text-rose-500 font-bold shrink-0 mt-0.5">✕</span>
              <span><strong>Held Hostage for $35/Month:</strong> If you already printed 1,000 menus or business cards, you must pay monthly.</span>
            </li>
          </ul>
        </div>

        {/* Strix QR */}
        <div className="rounded-3xl border border-emerald-200 dark:border-emerald-800/60 bg-white dark:bg-slate-900 p-6 sm:p-7 shadow-md shadow-emerald-500/5">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs">
              ✓
            </span>
            <h3 className="text-sm font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              Strix QR (StrixDevs)
            </h3>
          </div>
          <ul className="space-y-3.5 text-xs text-slate-700 dark:text-slate-200">
            <li className="flex items-start gap-2.5">
              <span className="text-emerald-600 dark:text-emerald-400 font-bold shrink-0 mt-0.5">✓</span>
              <span><strong>Direct Static Encoding:</strong> Your actual URL or WiFi password is baked permanently into the QR matrix.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="text-emerald-600 dark:text-emerald-400 font-bold shrink-0 mt-0.5">✓</span>
              <span><strong>Never Expires:</strong> 6 months, 1 year, or lifetime — works forever with zero monthly charges.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="text-emerald-600 dark:text-emerald-400 font-bold shrink-0 mt-0.5">✓</span>
              <span><strong>Print-Ready Vector Files:</strong> High-DPI SVG and PDF exports engineered for commercial print shops.</span>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
};
