import React from 'react';
import { Utensils, Package, Calendar, Coins, UserSquare2, Wifi, Layers, ShieldCheck } from 'lucide-react';

interface UseCaseItem {
  icon: React.ReactNode;
  title: string;
  badge: string;
  description: string;
  color: string;
}

const USE_CASES: UseCaseItem[] = [
  {
    icon: <Utensils className="w-5 h-5 text-emerald-400" aria-hidden="true" />,
    title: 'Hospitality & Dining',
    badge: 'Lifetime Static',
    description: 'Digital restaurant menus, table ordering, and wine lists that never lapse or expire during dinner service.',
    color: 'emerald',
  },
  {
    icon: <Package className="w-5 h-5 text-blue-400" aria-hidden="true" />,
    title: 'Commercial Product Packaging',
    badge: '300 DPI Vector',
    description: 'Infinite-resolution vector SVG exports ready for commercial offset printing, cardboard boxes, and beverage labels.',
    color: 'blue',
  },
  {
    icon: <Wifi className="w-5 h-5 text-cyan-400" aria-hidden="true" />,
    title: 'Instant Guest Wi-Fi Onboarding',
    badge: 'Zero Password Typing',
    description: 'One-tap camera connections for offices, hotels, coffee shops, and Airbnb properties without credential friction.',
    color: 'cyan',
  },
  {
    icon: <Coins className="w-5 h-5 text-amber-400" aria-hidden="true" />,
    title: 'Cryptocurrency Transactions',
    badge: 'High Optical Lock',
    description: 'BIP-compliant Bitcoin, Ethereum, and Solana address matrices optimized for hardware and mobile wallet cameras.',
    color: 'amber',
  },
  {
    icon: <UserSquare2 className="w-5 h-5 text-indigo-400" aria-hidden="true" />,
    title: 'Executive Digital vCards',
    badge: 'Direct Phone Address Book',
    description: 'Comprehensive contact cards with company, role, website, and phone numbers that save directly to mobile contacts.',
    color: 'indigo',
  },
  {
    icon: <Layers className="w-5 h-5 text-purple-400" aria-hidden="true" />,
    title: 'Batch Inventory & Asset Tags',
    badge: 'Bulk CSV Processing',
    description: 'Automated CSV ingestion that outputs hundreds of categorized vector QR codes in a single bundled ZIP package.',
    color: 'purple',
  },
];

export const UseCasesSection: React.FC = () => {
  return (
    <section id="use-cases" className="my-20 max-w-5xl mx-auto px-4 scroll-mt-24">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900 border border-white/[0.08] text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-3">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
          <span>Industry Solutions</span>
        </div>
        <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-[-0.03em] bg-gradient-to-b from-white via-zinc-100 to-zinc-400 bg-clip-text text-transparent">
          Engineered for Real-World Deployments
        </h2>
        <p className="text-zinc-400 max-w-2xl mx-auto mt-2.5 text-xs sm:text-sm leading-relaxed text-balance">
          Discover why businesses, developers, and creative agencies worldwide rely on Strix QR for high-visibility physical prints and seamless digital touchpoints.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {USE_CASES.map((item, idx) => (
          <div
            key={idx}
            className="p-5 sm:p-6 rounded-2xl border border-white/[0.08] bg-gradient-to-b from-zinc-900/60 to-zinc-950/60 backdrop-blur-xl hover:border-white/20 transition-all duration-200 group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-4">
                <div className="w-10 h-10 rounded-xl bg-zinc-950 border border-white/[0.08] flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
                  {item.icon}
                </div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-zinc-400">
                  {item.badge}
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-bold text-white mb-2 group-hover:text-blue-300 transition-colors">
                {item.title}
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                {item.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
