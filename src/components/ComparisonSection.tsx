import React from 'react';

export const ComparisonSection: React.FC = () => {
  return (
    <section id="why-expire" className="my-16 max-w-4xl mx-auto px-4 scroll-mt-20">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white tracking-tight sm:text-3xl">
          Direct Static QR vs Subscription Traps
        </h2>
        <p className="text-slate-400 mt-2 text-xs sm:text-sm max-w-xl mx-auto">
          Why businesses in Chicago, NY, and Canada switch to Strix QR for print runs.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Competitors */}
        <div className="rounded-2xl border border-rose-500/20 bg-slate-900/40 p-5">
          <h3 className="text-sm font-bold text-rose-400 mb-3 uppercase tracking-wider">
            Most Online QR Generators
          </h3>
          <ul className="space-y-2.5 text-xs text-slate-300">
            <li className="flex items-start gap-2">
              <span className="text-rose-400 font-bold shrink-0">✕</span>
              <span><strong>Hidden Redirects:</strong> Encodes their private shortlink instead of your destination.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-rose-400 font-bold shrink-0">✕</span>
              <span><strong>14-Day Deactivation:</strong> Cuts off redirects once the trial expires.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-rose-400 font-bold shrink-0">✕</span>
              <span><strong>$35/Month Bill:</strong> Forces recurring subscriptions to reactivate printed cards.</span>
            </li>
          </ul>
        </div>

        {/* Strix QR */}
        <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-b from-slate-900 to-indigo-950/20 p-5">
          <h3 className="text-sm font-bold text-emerald-400 mb-3 uppercase tracking-wider">
            Strix QR (StrixDevs)
          </h3>
          <ul className="space-y-2.5 text-xs text-slate-200">
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 font-bold shrink-0">✓</span>
              <span><strong>Permanent Static Encoding:</strong> Your real link is baked directly into the QR pixels.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 font-bold shrink-0">✓</span>
              <span><strong>Never Expires:</strong> 6 months, 1 year, or lifetime — codes work indefinitely.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 font-bold shrink-0">✓</span>
              <span><strong>Print-Ready Vector Files:</strong> High-DPI SVG and PDF exports with zero blur.</span>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
};
