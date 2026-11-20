import React, { useState } from 'react';
import { Mail, Send, CheckCircle2, MessageSquare, Briefcase, Zap, HelpCircle, Shield } from 'lucide-react';
import { db } from '../../services/db';
import { Button } from '../ui/Button';
import { Input, Textarea } from '../ui/Input';
import { playTactileClick } from '../../utils/audioFeedback';

type InquiryCategory = 'general' | 'sponsor' | 'enterprise' | 'support';

interface CategoryOption {
  id: InquiryCategory;
  label: string;
  icon: React.ReactNode;
  placeholderText: string;
}

const CATEGORIES: CategoryOption[] = [
  {
    id: 'general',
    label: 'General Inquiry',
    icon: <MessageSquare className="w-3.5 h-3.5" aria-hidden="true" />,
    placeholderText: 'How can we help you? Ask about features, product roadmap, or partnerships...',
  },
  {
    id: 'sponsor',
    label: 'Sponsorship & Ads',
    icon: <Briefcase className="w-3.5 h-3.5" aria-hidden="true" />,
    placeholderText: 'Tell us about your brand, target geographic region, and preferred sponsorship placement...',
  },
  {
    id: 'enterprise',
    label: 'Enterprise & API',
    icon: <Zap className="w-3.5 h-3.5" aria-hidden="true" />,
    placeholderText: 'Describe your volume requirements, custom API integration, or white-label needs...',
  },
  {
    id: 'support',
    label: 'Technical Support',
    icon: <HelpCircle className="w-3.5 h-3.5" aria-hidden="true" />,
    placeholderText: 'Describe any technical questions regarding vector printing, scannability, or payload format...',
  },
];

export const ContactSection: React.FC = () => {
  const [category, setCategory] = useState<InquiryCategory>('general');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    message: '',
  });

  const [submitted, setSubmitted] = useState<boolean>(false);
  const [isSending, setIsSending] = useState<boolean>(false);

  const activeCategory = CATEGORIES.find((c) => c.id === category) || CATEGORIES[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;

    setIsSending(true);

    try {
      // 1. Save to database / lead registry
      db.saveLead({
        name: formData.name,
        company: formData.company || 'Individual / Independent',
        email: formData.email,
        website: '',
        region: 'Global',
        tier: category.toUpperCase(),
        message: `[Category: ${activeCategory.label}] ${formData.message}`,
      });

      // 2. Transmit via transactional email API endpoint
      try {
        await fetch('/api/email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'contact_inquiry',
            email: formData.email,
            name: formData.name,
            company: formData.company,
            category: activeCategory.label,
            message: formData.message,
          }),
        });
      } catch {
        // Fallback: Lead is safely persisted in db
      }

      setSubmitted(true);
    } finally {
      setIsSending(false);
    }
  };

  const handleReset = () => {
    setSubmitted(false);
    setFormData({ name: '', email: '', company: '', message: '' });
  };

  return (
    <section id="contact" className="my-20 max-w-5xl mx-auto px-4 scroll-mt-24">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900 border border-white/[0.08] text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-3">
          <Mail className="w-3.5 h-3.5 text-blue-400" aria-hidden="true" />
          <span>Get in Touch</span>
        </div>
        <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-[-0.03em] bg-gradient-to-b from-white via-zinc-100 to-zinc-400 bg-clip-text text-transparent">
          Contact & Collaboration
        </h2>
        <p className="text-zinc-400 mt-2.5 text-xs sm:text-sm leading-relaxed text-balance">
          Have questions regarding commercial vector print runs, enterprise API licensing, sponsorship opportunities, or technical feedback? Our engineering team responds within 24 hours.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Information Cards (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-5 rounded-2xl bg-zinc-900/60 border border-white/[0.08] space-y-3">
            <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider block">
              Direct Engineering Inquiries
            </span>
            <a
              href="mailto:partnerships@strixdevs.com"
              className="text-sm font-semibold text-white hover:text-blue-400 transition-colors block truncate"
            >
              partnerships@strixdevs.com
            </a>
            <p className="text-xs text-zinc-400 leading-relaxed">
              For high-volume vector APIs, sponsorships, and technical consulting.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-zinc-900/60 border border-white/[0.08] space-y-3">
            <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider block">
              Response SLA
            </span>
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Under 24 Hours</span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Every message is routed directly to active core contributors at StrixDevs.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-gradient-to-br from-[#38bdf8]/10 to-zinc-900/60 border border-[#38bdf8]/25 space-y-2">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-[#38bdf8]" />
              Enterprise Data Guarantee
            </span>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              Your inquiry and contact details are stored securely under strict non-disclosure policies. Zero marketing spam.
            </p>
          </div>
        </div>

        {/* Right Form Card (8 cols) */}
        <div className="lg:col-span-8 rounded-3xl border border-white/[0.1] bg-gradient-to-b from-zinc-900/90 to-zinc-950/90 backdrop-blur-2xl p-6 sm:p-8 shadow-2xl shadow-black/50 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)]">
          {submitted ? (
            <div className="py-12 text-center space-y-4 animate-in fade-in zoom-in-95 duration-200">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-500/10">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-white tracking-tight">
                Message Received by Strix QR
              </h3>
              <p className="text-xs sm:text-sm text-zinc-300 max-w-md mx-auto leading-relaxed">
                Thank you, <strong>{formData.name}</strong>. Your inquiry regarding{' '}
                <span className="text-blue-400 font-semibold">{activeCategory.label}</span> has been logged. We will reach back out to you at{' '}
                <strong className="text-white">{formData.email}</strong> shortly.
              </p>
              <div className="pt-4">
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-medium text-white transition cursor-pointer"
                >
                  Send Another Message
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Modern Category Selector Pill Chips (Replaces clunky native select) */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2.5">
                  Inquiry Topic
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {CATEGORIES.map((cat) => {
                    const isSelected = category === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => {
                          playTactileClick();
                          setCategory(cat.id);
                        }}
                        className={`p-2.5 rounded-xl border text-xs font-medium transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-[0.97] ${
                          isSelected
                            ? 'border-[#38bdf8]/60 bg-[#38bdf8]/15 text-[#38bdf8] ring-1 ring-[#38bdf8]/30 shadow-sm font-semibold'
                            : 'border-white/[0.08] bg-zinc-950/60 text-zinc-400 hover:text-zinc-200 hover:border-white/15'
                        }`}
                      >
                        <span className={isSelected ? 'text-[#38bdf8]' : 'text-zinc-500'}>
                          {cat.icon}
                        </span>
                        <span className="truncate">{cat.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Form Input Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Your Full Name"
                  required
                  placeholder="Jane Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
                <Input
                  label="Business or Personal Email"
                  type="email"
                  required
                  placeholder="jane@company.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <Input
                label="Company / Organization (Optional)"
                placeholder="Acme Global Inc. or Independent Project"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              />

              <Textarea
                label="Your Message or Request"
                rows={4}
                required
                placeholder={activeCategory.placeholderText}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              />

              <Button
                type="submit"
                variant="primary"
                fullWidth
                size="lg"
                disabled={isSending}
                className="gap-2 font-bold cursor-pointer shadow-lg shadow-white/5"
              >
                {isSending ? (
                  <span>Transmitting...</span>
                ) : (
                  <>
                    <Send className="w-4 h-4 text-zinc-950" />
                    <span>Send Inquiry to StrixDevs</span>
                  </>
                )}
              </Button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};
