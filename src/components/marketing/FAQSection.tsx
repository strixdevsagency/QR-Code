import React, { useState } from 'react';
import { ChevronDown, HelpCircle, Sparkles } from 'lucide-react';
import { playTactileClick } from '../../utils/audioFeedback';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const FAQS: FAQItem[] = [
  {
    category: 'Permanence & Pricing',
    question: 'Are Strix QR codes truly 100% permanent and free forever?',
    answer:
      'Yes. Standard static QR codes created on Strix QR encode your raw destination data (URL, Wi-Fi credentials, vCard, Bitcoin address, etc.) directly into the 2D optical matrix modules. Because there are no intermediary proxy redirect servers or recurring billing checkpoints, the code is self-contained and will function forever without expiration.',
  },
  {
    category: 'Architecture & Reliability',
    question: 'Why do other online QR services stop working after commercial printing?',
    answer:
      'Most commercial QR services secretly encode an intermediary redirect link (e.g. qr.co/xyz123) rather than your direct URL. When their 14-day trial concludes or subscription lapses, the redirect server cuts off traffic and serves an upgrade paywall, rendering thousands of dollars of printed menus, packaging, or business cards completely useless. Strix QR uses direct matrix encoding with zero middleman dependencies.',
  },
  {
    category: 'Commercial Print & Vectors',
    question: 'What file formats should I use for commercial packaging and billboards?',
    answer:
      'For commercial print runs, always export as Vector SVG or 300 DPI PDF. Vector SVG graphics are mathematically defined paths that scale infinitely without pixelation, whether printed on a 1-inch business card or a 50-foot highway billboard. For digital screens and web embedding, PNG raster exports are also provided.',
  },
  {
    category: 'Optical Quality & Logos',
    question: 'Can I safely put my company logo in the center of the QR code?',
    answer:
      'Yes. Strix QR automatically enforces Reed-Solomon Level H error correction (30% optical recovery redundancy) whenever a center brand badge is added. Furthermore, our built-in Scannability Guard tests finder pattern ratios in real time to verify that camera sensors can lock onto the code before you download.',
  },
  {
    category: 'Privacy & Security',
    question: 'Does Strix QR track scans or harvest customer telemetry?',
    answer:
      'No. Direct static matrix codes are generated 100% client-side inside your browser engine. When customers scan your printed code, their camera reads the data directly on-device without contacting any Strix server. Zero cookies, zero visitor tracking, and zero data logging.',
  },
  {
    category: 'Security & Dynamic Policies',
    question: 'How do One-Time Scan and Time-Limited QR codes work?',
    answer:
      'When selecting One-Time Scan or Time-Limited expiry modes, Strix QR generates an ephemeral cryptographic redirect endpoint with a dynamic burn policy. Once the scan threshold is reached or duration elapses, the code self-destructs and automatically serves a secure revoked tombstone state.',
  },
  {
    category: 'High-Volume & Automation',
    question: 'Can I generate thousands of QR codes in bulk for inventory or dining tables?',
    answer:
      'Yes. Navigate to the "Bulk Batch" studio tab in the navigation bar to import CSV files, configure design parameters, and export zip archives containing hundreds of production-ready vector QR codes in seconds.',
  },
];

export const FAQSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleItem = (index: number) => {
    playTactileClick();
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="my-20 max-w-4xl mx-auto px-4 scroll-mt-24">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900 border border-white/[0.08] text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-3">
          <HelpCircle className="w-3.5 h-3.5 text-[#38bdf8]" aria-hidden="true" />
          <span>Knowledge Base</span>
        </div>
        <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-[-0.03em] bg-gradient-to-b from-white via-zinc-100 to-zinc-400 bg-clip-text text-transparent">
          Frequently Asked Questions
        </h2>
        <p className="text-zinc-400 max-w-2xl mx-auto mt-2.5 text-xs sm:text-sm leading-relaxed text-balance">
          Everything you need to know about vector QR code generation, physical print preparation, error correction algorithms, and offline data privacy.
        </p>
      </div>

      <div className="space-y-3">
        {FAQS.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={idx}
              className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                isOpen
                  ? 'border-[#38bdf8]/35 bg-zinc-900/90 shadow-lg shadow-[#38bdf8]/5'
                  : 'border-white/[0.06] bg-zinc-900/40 hover:border-white/[0.12] hover:bg-zinc-900/60'
              }`}
            >
              <button
                type="button"
                onClick={() => toggleItem(idx)}
                className="w-full p-4 sm:p-5 flex items-center justify-between gap-4 text-left cursor-pointer select-none"
                aria-expanded={isOpen}
              >
                <div className="space-y-1 min-w-0">
                  <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-[#38bdf8] block">
                    {faq.category}
                  </span>
                  <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
                    {faq.question}
                  </h3>
                </div>
                <div
                  className={`w-7 h-7 rounded-lg border border-white/[0.08] bg-zinc-950 flex items-center justify-center shrink-0 text-zinc-400 transition-transform duration-200 ${
                    isOpen ? 'rotate-180 text-[#38bdf8] bg-[#38bdf8]/10 border-[#38bdf8]/30' : ''
                  }`}
                >
                  <ChevronDown className="w-4 h-4" />
                </div>
              </button>

              {isOpen && (
                <div className="px-4 pb-5 sm:px-5 pt-0 text-xs sm:text-sm text-zinc-300 leading-relaxed border-t border-white/[0.04] mt-1 animate-in fade-in duration-150">
                  <p className="pt-3">{faq.answer}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
