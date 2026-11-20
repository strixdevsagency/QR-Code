import React from 'react';
import { ShieldCheck, ServerCrash, Check, X, HelpCircle } from 'lucide-react';

export const ComparisonSection: React.FC = () => {
  return (
    <section id="why-expire" className="my-20 max-w-5xl mx-auto px-4 scroll-mt-24">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900 border border-white/[0.08] text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-3">
          Architecture Deep-Dive
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight text-balance">
          Direct Matrix Encoding vs. Redirect Proxies
        </h2>
        <p className="text-zinc-400 max-w-2xl mx-auto mt-2.5 text-xs sm:text-sm leading-relaxed text-balance">
          Understanding why traditional dynamic QR services fail after commercial printing, and how self-contained matrix encoding guarantees permanent reliability.
        </p>
      </div>

      {/* 2-Column Architecture Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Redirect Proxies Card */}
        <div className="rounded-2xl border border-white/[0.08] bg-zinc-900/40 p-6 sm:p-7 relative overflow-hidden">
          <div className="flex items-center gap-2.5 text-zinc-300 font-bold text-base mb-4">
            <ServerCrash className="w-5 h-5 text-rose-400" />
            <span>Redirect-Dependent Services</span>
          </div>

          <ul className="space-y-4 text-xs sm:text-sm text-zinc-400">
            <li className="flex items-start gap-3">
              <span className="w-5 h-5 rounded-md bg-rose-500/10 text-rose-400 flex items-center justify-center shrink-0 mt-0.5">
                <X className="w-3.5 h-3.5" />
              </span>
              <span>
                <strong className="text-zinc-200">Proxy Redirection:</strong> Instead of your URL, the code embeds an intermediary shortlink (<code className="text-rose-300 bg-zinc-950 px-1.5 py-0.5 rounded text-xs font-mono">qr.co/xyz123</code>).
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-5 h-5 rounded-md bg-rose-500/10 text-rose-400 flex items-center justify-center shrink-0 mt-0.5">
                <X className="w-3.5 h-3.5" />
              </span>
              <span>
                <strong className="text-zinc-200">Single Point of Failure:</strong> If the provider experiences downtime or alters their subscription tiers, your printed menus and business cards stop functioning.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-5 h-5 rounded-md bg-rose-500/10 text-rose-400 flex items-center justify-center shrink-0 mt-0.5">
                <X className="w-3.5 h-3.5" />
              </span>
              <span>
                <strong className="text-zinc-200">User Telemetry:</strong> Every camera scan routes through remote servers, creating privacy and latency overhead for your customers.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-5 h-5 rounded-md bg-rose-500/10 text-rose-400 flex items-center justify-center shrink-0 mt-0.5">
                <X className="w-3.5 h-3.5" />
              </span>
              <span>
                <strong className="text-zinc-200">The 14-Day Hostage Trap:</strong> Many services let you print codes for "free", then deactivate them 14 days later demanding $120–$400/yr to keep your prints alive.
              </span>
            </li>
          </ul>
        </div>

        {/* Strix QR Direct Matrix Card */}
        <div className="rounded-2xl border border-[#38bdf8]/40 bg-gradient-to-b from-[#38bdf8]/10 to-zinc-900/60 p-6 sm:p-7 relative overflow-hidden shadow-lg shadow-[#38bdf8]/10">
          <div className="flex items-center gap-2.5 text-white font-bold text-base mb-4">
            <ShieldCheck className="w-5 h-5 text-[#38bdf8]" />
            <span>Direct Self-Contained Matrix (Strix QR)</span>
          </div>

          <ul className="space-y-4 text-xs sm:text-sm text-zinc-300">
            <li className="flex items-start gap-3">
              <span className="w-5 h-5 rounded-md bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                <Check className="w-3.5 h-3.5" />
              </span>
              <span>
                <strong className="text-white">Direct Payload Embedding:</strong> The full destination URL, Wi-Fi credentials, or vCard string is stored directly within the 2D black & white optical modules.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-5 h-5 rounded-md bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                <Check className="w-3.5 h-3.5" />
              </span>
              <span>
                <strong className="text-white">Offline & Permanent:</strong> Scanners decode the data locally on the device with zero server lookups. Works forever without hosting renewals.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-5 h-5 rounded-md bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                <Check className="w-3.5 h-3.5" />
              </span>
              <span>
                <strong className="text-white">Complete Data Sovereignty:</strong> No intermediate servers log or analyze visitor metadata. 100% private, client-side generation.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-5 h-5 rounded-md bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                <Check className="w-3.5 h-3.5" />
              </span>
              <span>
                <strong className="text-white">Zero Hostage Guarantee:</strong> Static vector codes never touch proxy servers. Your printed flyers, menus, and packages will work forever with zero recurring fees.
              </span>
            </li>
          </ul>
        </div>
      </div>

      {/* Engineering FAQ */}
      <div className="mt-12 bg-zinc-900/50 border border-white/[0.08] rounded-2xl p-6 sm:p-8">
        <h3 className="text-base font-bold text-white mb-6 flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-blue-400" />
          Technical Considerations & Best Practices
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs sm:text-sm">
          <div>
            <h4 className="font-semibold text-zinc-200">How should I prepare files for commercial print runs?</h4>
            <p className="text-zinc-400 mt-1.5 leading-relaxed">
              Always use our Vector SVG or Print-Ready PDF export. These formats maintain infinite mathematical resolution and will not pixelate on large signage, storefront decals, or offset printing presses.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-zinc-200">What is Level H Error Correction?</h4>
            <p className="text-zinc-400 mt-1.5 leading-relaxed">
              When inserting a center brand logo, Strix QR automatically enforces <span className="whitespace-nowrap">Reed-Solomon</span> Level H error correction (30% redundancy). This ensures the QR remains scannable even if part of the matrix is obscured by your logo or dirt.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
