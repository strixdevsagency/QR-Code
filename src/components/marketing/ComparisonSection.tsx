import React from 'react';

export const ComparisonSection: React.FC = () => {
  return (
    <section id="why-expire" className="my-16 max-w-5xl mx-auto px-4 scroll-mt-24">
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-semibold uppercase tracking-wider mb-3">
          The Truth About Expiring QR Codes
        </div>
        <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
          Why Do Other QR Codes Stop Working After 14 Days?
        </h2>
        <p className="text-slate-400 max-w-2xl mx-auto mt-3 text-xs sm:text-sm leading-relaxed">
          In cities like Chicago and New York, hundreds of businesses get trapped printing business cards and restaurant menus only for them to deactivate. Here is the technical difference between commercial traps and <strong className="text-indigo-400">Strix QR</strong>.
        </p>
      </div>

      {/* Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Competitors Card */}
        <div className="rounded-3xl border border-rose-500/30 bg-slate-900/40 p-6 sm:p-8 relative overflow-hidden">
          <div className="text-rose-400 font-bold text-base sm:text-lg mb-4">
            ✕ Most Online QR Generators (The Subscription Trap)
          </div>
          <ul className="space-y-4 text-xs sm:text-sm text-slate-300">
            <li className="flex items-start gap-2.5">
              <span className="text-rose-400 font-bold shrink-0">✕</span>
              <span>
                <strong>Sneaky Middleman Redirect:</strong> Instead of encoding your URL, they encode their private link (<code className="text-rose-300 bg-rose-950/40 px-1 py-0.5 rounded">qr.co/xyz123</code>).
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="text-rose-400 font-bold shrink-0">✕</span>
              <span>
                <strong>14-Day Expiration:</strong> When the free trial ends, their server turns off the redirect and replaces your website with a paywall.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="text-rose-400 font-bold shrink-0">✕</span>
              <span>
                <strong>Held Hostage for $35/Month:</strong> If you already printed 1,000 menus or business cards, you are forced to pay or throw your prints away.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="text-rose-400 font-bold shrink-0">✕</span>
              <span>
                <strong>Requires Credit Card & Account:</strong> Demands personal information before letting you download.
              </span>
            </li>
          </ul>
        </div>

        {/* Strix QR Card */}
        <div className="rounded-3xl border border-emerald-500/40 bg-gradient-to-br from-indigo-950/30 via-slate-900 to-emerald-950/20 p-6 sm:p-8 relative overflow-hidden shadow-xl shadow-indigo-950/40">
          <div className="text-emerald-400 font-bold text-base sm:text-lg mb-4">
            ✓ Strix QR by StrixDevs (Permanent Direct Engine)
          </div>
          <ul className="space-y-4 text-xs sm:text-sm text-slate-200">
            <li className="flex items-start gap-2.5">
              <span className="text-emerald-400 font-bold shrink-0">✓</span>
              <span>
                <strong>Direct Static Encoding:</strong> Your actual URL or WiFi password is baked directly into the black and white pattern with no middleman server.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="text-emerald-400 font-bold shrink-0">✓</span>
              <span>
                <strong>Works Forever Guaranteed:</strong> Permanent lifetime encoding. Even if our website were ever offline, your printed QR codes still work!
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="text-emerald-400 font-bold shrink-0">✓</span>
              <span>
                <strong>Print-Ready Vector SVG & PDF:</strong> Scalable without pixelation for billboards, store window decals, and vehicle wraps.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="text-emerald-400 font-bold shrink-0">✓</span>
              <span>
                <strong>Ephemeral Codes Supported:</strong> Optional One-Time self-destructing codes for secure single-use coupons and Wi-Fi access.
              </span>
            </li>
          </ul>
        </div>
      </div>

      {/* Frequently Asked Questions Accordion */}
      <div className="mt-12 bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8">
        <h3 className="text-base sm:text-lg font-bold text-white mb-4">
          Frequently Asked Questions
        </h3>
        <div className="space-y-4 text-xs sm:text-sm">
          <div>
            <h4 className="font-semibold text-slate-200">Can I print this QR code on 500 business cards safely?</h4>
            <p className="text-slate-400 mt-1">
              Yes! Always use our Vector SVG or PDF export for commercial printing. Also, perform a quick test scan on your phone screen before sending to your print shop.
            </p>
          </div>
          <div className="pt-3 border-t border-slate-800/80">
            <h4 className="font-semibold text-slate-200">Why is StrixDevs giving this service for free?</h4>
            <p className="text-slate-400 mt-1">
              StrixDevs is an engineering company serving Chicago, New York, and Canada. Rather than charging businesses recurring fees for simple utility tools, we monetize this platform ethically through non-intrusive Google AdSense and corporate sponsorships.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

