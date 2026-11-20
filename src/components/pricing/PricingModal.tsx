import React, { useState } from 'react';
import {
  Check,
  Zap,
  Sparkles,
  Shield,
  ArrowRight,
  ArrowLeft,
  X,
  Send,
  CheckCircle2,
  Mail,
  Key,
} from 'lucide-react';
import { PRICING_PLANS } from '../../services/payment';
import { BillingInterval, UserTier } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/db';
import { Button } from '../ui/Button';
import { Input, Textarea } from '../ui/Input';
import { playTactileClick, playVictoryFanfare } from '../../utils/audioFeedback';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlanSelected?: (tier: UserTier) => void;
}

type ModalView = 'plans' | 'order_form' | 'order_success' | 'redeem_key';

export const PricingModal: React.FC<PricingModalProps> = ({ isOpen, onClose }) => {
  const { user, activateLicenseKey } = useAuth();
  const [view, setView] = useState<ModalView>('plans');
  const [interval, setInterval] = useState<BillingInterval>('annual');
  const [selectedTier, setSelectedTier] = useState<UserTier>('pro');

  // Simple customer contact details for manual follow-up
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phoneOrWhatsapp: '',
    notes: '',
  });

  const [licenseKeyInput, setLicenseKeyInput] = useState<string>('');
  const [keyErrorMsg, setKeyErrorMsg] = useState<string | null>(null);
  const [keySuccess, setKeySuccess] = useState<boolean>(false);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentTier: UserTier = user?.tier || 'free';
  const plan = PRICING_PLANS[selectedTier];
  const formattedPrice =
    interval === 'annual'
      ? `$${plan.annualBilledTotal}/year ($${plan.priceAnnual}/mo, Save 25%)`
      : `$${plan.priceMonthly}/month`;

  const handleSelectPlan = (tierKey: UserTier) => {
    playTactileClick();
    if (tierKey === 'free') {
      onClose();
      return;
    }
    setSelectedTier(tierKey);
    setFormData((prev) => ({
      ...prev,
      name: prev.name || user?.name || '',
      email: prev.email || user?.email || '',
    }));
    setView('order_form');
  };

  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) {
      setErrorMsg('Please enter your full name and email address.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      // 1. Record lead in database for Admin CRM tracking
      db.saveLead({
        name: formData.name.trim(),
        email: formData.email.trim(),
        company: formData.phoneOrWhatsapp.trim()
          ? `Contact: ${formData.phoneOrWhatsapp.trim()}`
          : 'Direct Subscriber',
        website: '',
        region: 'Global',
        tier: `PRO_ORDER_${selectedTier.toUpperCase()}_${interval.toUpperCase()}`,
        message: `[Pro Order Request] Plan: ${plan.name} (${interval}) | Price: ${formattedPrice} | Phone/WhatsApp: ${formData.phoneOrWhatsapp || 'Not provided'} | Notes: ${formData.notes || 'None'}`,
      });

      // 2. Transmit to StrixDevs Billing via Email Dispatcher
      try {
        await fetch('/api/email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'manual_pro_order',
            email: formData.email.trim(),
            name: formData.name.trim(),
            phone: formData.phoneOrWhatsapp.trim(),
            planName: plan.name,
            interval: interval,
            amount: formattedPrice,
            notes: formData.notes,
          }),
        });
      } catch (err) {
        console.warn('Email dispatch warning (handled gracefully):', err);
      }

      setView('order_success');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit request. Please reach out directly to billing@strixdevs.com');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRedeemKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!licenseKeyInput.trim()) {
      setKeyErrorMsg('Please enter your Pro License Key.');
      return;
    }

    setKeyErrorMsg(null);
    const result = activateLicenseKey(licenseKeyInput.trim());

    if (result.success) {
      playVictoryFanfare();
      setKeySuccess(true);
      setTimeout(() => {
        onClose();
        setView('plans');
        setKeySuccess(false);
        setLicenseKeyInput('');
      }, 1500);
    } else {
      setKeyErrorMsg(result.error || 'Invalid license key.');
    }
  };

  const handleCloseAll = () => {
    playTactileClick();
    setView('plans');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="w-full max-w-4xl bg-zinc-900 border border-white/[0.1] rounded-3xl p-5 sm:p-8 shadow-2xl relative my-auto">
        
        {/* Close Button */}
        <button
          onClick={handleCloseAll}
          className="absolute top-5 right-5 text-zinc-400 hover:text-white p-2 rounded-xl hover:bg-zinc-800 transition cursor-pointer text-sm font-semibold"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* ======================================================== */}
        {/* VIEW 1: PRICING MATRIX & PLAN SELECTION                  */}
        {/* ======================================================== */}
        {view === 'plans' && (
          <div>
            {/* Header */}
            <div className="text-center max-w-xl mx-auto mb-7">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#38bdf8]/10 border border-[#38bdf8]/20 text-[#38bdf8] text-xs font-semibold mb-3">
                <Sparkles className="w-3.5 h-3.5" /> High-Performance QR Architecture
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Predictable, Creator-Friendly Pricing
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 mt-2">
                Generate unlimited static codes free forever with ads. Upgrade to Pro for a 100% ad-free experience, editable dynamic links, and high-res vector printing.
              </p>

              {/* Billing Cycle Switcher */}
              <div className="inline-flex items-center gap-1 p-1 bg-zinc-950 border border-white/[0.08] rounded-full mt-5">
                <button
                  type="button"
                  onClick={() => setInterval('monthly')}
                  className={`px-4 py-1.5 rounded-full text-xs font-medium transition cursor-pointer ${
                    interval === 'monthly'
                      ? 'bg-zinc-800 text-white shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  Monthly Billing
                </button>
                <button
                  type="button"
                  onClick={() => setInterval('annual')}
                  className={`px-4 py-1.5 rounded-full text-xs font-medium transition cursor-pointer flex items-center gap-1.5 ${
                    interval === 'annual'
                      ? 'bg-[#38bdf8] text-[#09090b] font-bold shadow-sm shadow-[#38bdf8]/20'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  Annual Billing
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-black/20 text-black font-bold uppercase">
                    Save 25%
                  </span>
                </button>
              </div>
            </div>

            {/* Pricing Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 items-stretch">
              {(['free', 'pro', 'enterprise'] as UserTier[]).map((tierKey) => {
                const p = PRICING_PLANS[tierKey];
                const isHighlighted = p.highlighted;
                const isCurrent = currentTier === tierKey;
                const price = interval === 'annual' ? p.priceAnnual : p.priceMonthly;

                return (
                  <div
                    key={tierKey}
                    className={`relative flex flex-col justify-between rounded-2xl p-5 sm:p-6 transition-all duration-300 border ${
                      isHighlighted
                        ? 'bg-gradient-to-b from-zinc-900 to-zinc-950 border-[#38bdf8] shadow-xl shadow-[#38bdf8]/10 ring-1 ring-[#38bdf8]/40'
                        : 'bg-zinc-950/60 border-white/[0.08] hover:border-white/15'
                    }`}
                  >
                    {isHighlighted && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-[#38bdf8] text-[#09090b] text-[10px] font-extrabold uppercase tracking-wider shadow-sm">
                        Most Popular
                      </div>
                    )}

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-base font-bold text-white">{p.name}</h3>
                        {isCurrent && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                            Active
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-zinc-400 min-h-[32px] leading-relaxed">
                        {p.tagline}
                      </p>

                      <div className="my-5 pb-5 border-b border-white/[0.08]">
                        <div className="flex items-baseline gap-1">
                          <span className="text-3xl font-extrabold text-white tracking-tight">
                            ${price}
                          </span>
                          <span className="text-xs text-zinc-400">/ month</span>
                        </div>
                        {interval === 'annual' && p.annualBilledTotal > 0 && (
                          <div className="text-[11px] text-[#38bdf8] font-medium mt-1">
                            Billed annually at ${p.annualBilledTotal}/yr
                          </div>
                        )}
                      </div>

                      <ul className="space-y-2.5 text-xs text-zinc-300">
                        {p.features.map((feature, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <Check className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${isHighlighted ? 'text-[#38bdf8]' : 'text-zinc-400'}`} />
                            <span className={feature.includes('Ad-Free') ? 'font-semibold text-white' : ''}>
                              {feature}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="mt-6 pt-4 border-t border-white/[0.06]">
                      <Button
                        type="button"
                        variant={isHighlighted ? 'primary' : 'outline'}
                        fullWidth
                        size="md"
                        onClick={() => handleSelectPlan(tierKey)}
                        className={`font-bold cursor-pointer ${
                          isHighlighted
                            ? 'bg-[#38bdf8] text-[#09090b] hover:bg-[#38bdf8]/90 shadow-lg shadow-[#38bdf8]/20'
                            : 'border-white/10 text-white hover:bg-zinc-800'
                        }`}
                      >
                        {isCurrent
                          ? 'Current Plan'
                          : tierKey === 'free'
                          ? 'Continue Free'
                          : tierKey === 'enterprise'
                          ? 'Contact for Enterprise'
                          : 'Get Strix Pro'}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* License Key / Voucher Redemption Bar */}
            <div className="mt-6 p-3.5 sm:p-4 rounded-2xl bg-zinc-950/80 border border-white/[0.08] hover:border-white/15 transition flex flex-col sm:flex-row items-center justify-between gap-3 text-left">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#38bdf8]/10 border border-[#38bdf8]/20 flex items-center justify-center text-[#38bdf8] shrink-0">
                  <Key className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Have a Pro License Key or Paid Manually?</h4>
                  <p className="text-[11px] text-zinc-400">Activate your Pro session instantly on this device with zero login or password required.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  playTactileClick();
                  setView('redeem_key');
                }}
                className="px-3.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold transition cursor-pointer shrink-0"
              >
                Redeem Key
              </button>
            </div>

            {/* Trust Footer */}
            <div className="mt-6 pt-4 border-t border-white/[0.08] flex flex-wrap items-center justify-center gap-6 text-zinc-400 text-xs">
              <span className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-emerald-400" /> Never-Expire Static Guarantee
              </span>
              <span className="flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-[#38bdf8]" /> 100% Ad-Free Studio on Pro
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-400" /> Direct Manual Activation & Zero Surprise Charges
              </span>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* VIEW 2: SIMPLE CUSTOMER CONTACT / ORDER FORM             */}
        {/* ======================================================== */}
        {view === 'order_form' && (
          <div className="max-w-xl mx-auto space-y-6 animate-pop-in">
            {/* Back Button */}
            <button
              type="button"
              onClick={() => setView('plans')}
              className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition cursor-pointer mb-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Plans</span>
            </button>

            {/* Plan Header Card */}
            <div className="p-4 rounded-2xl bg-zinc-950/80 border border-[#38bdf8]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg shadow-[#38bdf8]/5">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#38bdf8] font-bold block">
                  Subscription Request
                </span>
                <h3 className="text-lg font-bold text-white tracking-tight">
                  {plan.name} — {formattedPrice}
                </h3>
                <p className="text-xs text-zinc-400">
                  Ad-free studio, editable dynamic QR codes, analytics, and vector printing.
                </p>
              </div>

              {/* Quick Cycle Switcher */}
              <div className="inline-flex items-center gap-1 p-0.5 bg-zinc-900 border border-white/[0.08] rounded-xl self-start sm:self-center shrink-0">
                <button
                  type="button"
                  onClick={() => setInterval('monthly')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition cursor-pointer ${
                    interval === 'monthly'
                      ? 'bg-zinc-800 text-white font-bold'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  Monthly
                </button>
                <button
                  type="button"
                  onClick={() => setInterval('annual')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition cursor-pointer ${
                    interval === 'annual'
                      ? 'bg-[#38bdf8] text-[#09090b] font-bold'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  Annual (-25%)
                </button>
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs text-center animate-pop-in">
                {errorMsg}
              </div>
            )}

            {/* Simple Contact Form */}
            <form onSubmit={handleOrderSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Your Full Name"
                  required
                  placeholder="Alex Vance"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
                <Input
                  label="Email Address"
                  type="email"
                  required
                  placeholder="alex@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <Input
                label="Phone Number or WhatsApp (Optional)"
                type="tel"
                placeholder="+1 (555) 000-0000 or WhatsApp contact"
                value={formData.phoneOrWhatsapp}
                onChange={(e) => setFormData({ ...formData, phoneOrWhatsapp: e.target.value })}
              />

              <Textarea
                label="Questions or Notes (Optional)"
                placeholder="Preferred payment method (Card, PayPal, Wise, etc.), company name, or questions..."
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  size="lg"
                  disabled={isSubmitting}
                  className="font-bold shadow-lg shadow-[#38bdf8]/20 cursor-pointer"
                >
                  {isSubmitting ? (
                    'Transmitting Request...'
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <Send className="w-4 h-4 text-zinc-950" />
                      <span>Submit Request — We&apos;ll Contact You</span>
                    </span>
                  )}
                </Button>
                <p className="text-[11px] text-zinc-500 text-center mt-2.5">
                  No automated credit card charges or recurring surprise fees. Our team will contact you directly with payment details to activate your account.
                </p>
              </div>
            </form>
          </div>
        )}

        {/* ======================================================== */}
        {/* VIEW 3: FRIENDLY SUCCESS CONFIRMATION                     */}
        {/* ======================================================== */}
        {view === 'order_success' && (
          <div className="max-w-md mx-auto text-center py-8 space-y-5 animate-pop-in">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div>
              <h3 className="text-xl font-bold text-white tracking-tight">
                Request Received!
              </h3>
              <p className="text-xs sm:text-sm text-zinc-300 mt-2 leading-relaxed">
                Thank you, <strong>{formData.name}</strong>. We have received your subscription request for{' '}
                <span className="text-[#38bdf8] font-bold">{plan.name}</span>.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-950/70 border border-white/[0.08] text-left text-xs text-zinc-300 space-y-2">
              <div className="flex items-center gap-2 text-white font-semibold">
                <Mail className="w-4 h-4 text-[#38bdf8]" />
                <span>Next Steps:</span>
              </div>
              <p className="text-zinc-400 leading-relaxed text-[11px]">
                Our team at StrixDevs will review your submission and contact you at{' '}
                <strong className="text-white">{formData.email}</strong>
                {formData.phoneOrWhatsapp && (
                  <> or via WhatsApp at <strong className="text-white">{formData.phoneOrWhatsapp}</strong></>
                )}{' '}
                within 1–2 hours to coordinate payment and activate your Pro subscription.
              </p>
            </div>

            <Button
              type="button"
              variant="primary"
              fullWidth
              size="md"
              onClick={handleCloseAll}
              className="font-bold cursor-pointer"
            >
              Done / Return to Generator
            </Button>
          </div>
        )}

        {/* ======================================================== */}
        {/* VIEW 4: REDEEM PRO LICENSE KEY (ZERO LOGIN REQUIRED)     */}
        {/* ======================================================== */}
        {view === 'redeem_key' && (
          <div className="max-w-md mx-auto space-y-6 animate-pop-in py-2">
            <button
              type="button"
              onClick={() => setView('plans')}
              className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition cursor-pointer mb-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Plans</span>
            </button>

            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-[#38bdf8]/10 border border-[#38bdf8]/30 flex items-center justify-center text-[#38bdf8] mx-auto shadow-md shadow-[#38bdf8]/10">
                <Key className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white tracking-tight">
                Redeem Pro License Key
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed max-w-sm mx-auto">
                Paid manually or received an activation code from StrixDevs? Enter your key to instantly unlock Pro features on this browser.
              </p>
            </div>

            {keyErrorMsg && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs text-center animate-pop-in">
                {keyErrorMsg}
              </div>
            )}

            {keySuccess ? (
              <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-center space-y-2 animate-pop-in">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                <h4 className="text-sm font-bold text-white">Pro Activated Successfully!</h4>
                <p className="text-xs text-zinc-300">
                  Your studio is now 100% ad-free with full Pro features unlocked.
                </p>
              </div>
            ) : (
              <form onSubmit={handleRedeemKey} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase tracking-wider">
                    Activation Code / License Key
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. STRIX-PRO-VIP or STRIX-PRO-XXXX"
                    value={licenseKeyInput}
                    onChange={(e) => setLicenseKeyInput(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-zinc-950 border border-white/[0.1] text-white text-sm font-mono tracking-wider focus:outline-none focus:border-[#38bdf8] focus:ring-1 focus:ring-[#38bdf8]/30 transition uppercase placeholder:normal-case placeholder:font-sans placeholder:text-zinc-600"
                  />
                  <span className="text-[11px] text-zinc-500 block mt-1.5">
                    Tip: For testing right now, you can enter <code>STRIX-PRO-VIP</code>
                  </span>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  size="lg"
                  className="font-bold shadow-lg shadow-[#38bdf8]/20 cursor-pointer"
                >
                  <Key className="w-4 h-4 text-zinc-950 mr-1.5" />
                  <span>Activate Pro Studio</span>
                </Button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
