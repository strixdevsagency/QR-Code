import React from 'react';

export const ComparisonSection: React.FC = () => {
  return (
    <section id="why-expire" className="my-16 max-w-5xl mx-auto px-4 scroll-mt-24">
      <div className="text-center mb-10">
        <div className="inline-flex items-center px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-semibold uppercase tracking-wider mb-3">
          Architecture Difference
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          Direct Static Encoding vs Subscription Traps
        </h2>
        <p className="text-slate-400 max-w-2xl mx-auto mt-2 text-xs sm:text-sm leading-relaxed">
          Every month, thousands of businesses get trapped printing business cards, packaging, and restaurant menus only for them to deactivate. Here is the technical difference.
        </p>
      </div>

      {/* Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Competitors Card */}
        <div className="rounded-2xl border border-rose-900/40 bg-[#111827] p-6 sm:p-7">
          <div className="text-rose-400 font-bold text-base mb-4">
            ✕ Common Online Generators (The 14-Day Trap)
          </div>
          <ul className="space-y-3.5 text-xs sm:text-sm text-slate-300">
            <li className="flex items-start gap-2.5">
              <span className="text-rose-400 font-bold shrink-0">✕</span>
              <span>
                <strong>Middleman Redirect:</strong> Instead of your URL, they encode their private link (<code className="text-rose-300 bg-slate-950 px-1 py-0.5 rounded">qr.co/xyz123</code>).
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="text-rose-400 font-bold shrink-0">✕</span>
              <span>
                <strong>14-Day Expiration:</strong> When the trial period ends, their server replaces your destination with a payment paywall.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="text-rose-400 font-bold shrink-0">✕</span>
              <span>
                <strong>Recurring Charges:</strong> Demands $35/month once you have already printed 500+ physical copies.
              </span>
            </li>
          </ul>
        </div>

        {/* Strix QR Card */}
        <div className="rounded-2xl border border-emerald-900/40 bg-[#111827] p-6 sm:p-7">
          <div className="text-emerald-400 font-bold text-base mb-4">
            ✓ Strix QR by StrixDevs (Permanent Static Engine)
          </div>
          <ul className="space-y-3.5 text-xs sm:text-sm text-slate-200">
            <li className="flex items-start gap-2.5">
              <span className="text-emerald-400 font-bold shrink-0">✓</span>
              <span>
                <strong>Direct Static Encoding:</strong> Your destination URL or Wi-Fi password is baked directly into the black and white pattern with zero middleman servers.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="text-emerald-400 font-bold shrink-0">✓</span>
              <span>
                <strong>Permanent Lifetime Guarantee:</strong> Even if our website were ever offline, your printed QR codes will work indefinitely.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="text-emerald-400 font-bold shrink-0">✓</span>
              <span>
                <strong>Print-Ready Vector SVG & PDF:</strong> Scalable without pixelation for billboards, store window decals, and table tents.
              </span>
            </li>
          </ul>
        </div>
      </div>

      {/* Frequently Asked Questions */}
      <div className="mt-10 bg-[#111827] border border-slate-800 rounded-2xl p-6 sm:p-8">
        <h3 className="text-base sm:text-lg font-bold text-white mb-4">
          Frequently Asked Questions
        </h3>
        <div className="space-y-4 text-xs sm:text-sm">
          <div>
            <h4 className="font-semibold text-slate-200">Can I print this QR code on 500 business cards safely?</h4>
            <p className="text-slate-400 mt-1">
              Yes. Always use our Vector SVG or PDF export for commercial printing. Perform a quick test scan on your phone screen before sending to your print shop.
            </p>
          </div>
          <div className="pt-3 border-t border-slate-800">
            <h4 className="font-semibold text-slate-200">Why is StrixDevs giving this service for free?</h4>
            <p className="text-slate-400 mt-1">
              StrixDevs is an engineering company serving North America. Rather than charging businesses fees for standard utility tools, we monetize this platform through non-intrusive Google AdSense and corporate sponsorships.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
