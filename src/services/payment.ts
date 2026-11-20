/**
 * Strix QR — Pricing, Plans & Payment Service
 * Supports Stripe, Lemon Squeezy (Merchant of Record), and plan entitlements.
 */

import { PricingPlan, User, UserTier } from '../types';

export const PRICING_PLANS: Record<UserTier, PricingPlan> = {
  free: {
    id: 'free',
    name: 'Free Starter',
    tagline: 'Essential QR creation for individuals and standard use',
    priceMonthly: 0,
    priceAnnual: 0,
    annualBilledTotal: 0,
    popularBadge: undefined,
    ctaLabel: 'Get Started Free',
    features: [
      'Unlimited static QR codes (URL, Wi-Fi, vCard, WhatsApp, etc.)',
      'High-resolution PNG & SVG vector downloads',
      '1 active Dynamic QR code (up to 250 lifetime scans)',
      'Basic styling (dots, corners, gradients, preset badges)',
      'Real-time ISO scannability verification guard',
      'Standard web browser redirection',
      'Ad-Supported Studio Experience (Standard Banners)',
    ],
    limits: {
      dynamicQRs: 1,
      monthlyScans: 250,
      bulkGeneration: false,
      customLogos: 0,
      vectorPdf: false,
      smartRouting: false,
      analytics: 'basic',
      adFree: false,
    },
  },
  pro: {
    id: 'pro',
    name: 'Strix Pro',
    tagline: 'For marketers, restaurants, businesses, and power creators',
    priceMonthly: 9,
    priceAnnual: 7, // $7/mo billed annually
    annualBilledTotal: 79, // $79 / yr (Save 27%)
    highlighted: true,
    popularBadge: 'Most Popular',
    ctaLabel: 'Upgrade to Pro',
    features: [
      'Unlimited Dynamic QR codes (update destination anytime)',
      'Unlimited Scans with zero rate throttles',
      'Smart Conditional Routing (iOS / Android / time-scheduled)',
      'Security: PIN code protection & one-time burnable modes',
      'Advanced Print Exports: CMYK EPS & 300+ DPI Vector PDF',
      'Personal Brand Logo Library (upload unlimited logos)',
      'Detailed Geolocation & Device scan analytics',
      'Completely Ad-Free studio experience',
    ],
    limits: {
      dynamicQRs: 'unlimited',
      monthlyScans: 'unlimited',
      bulkGeneration: false,
      customLogos: 'unlimited',
      vectorPdf: true,
      smartRouting: true,
      analytics: 'advanced',
      adFree: true,
    },
  },
  enterprise: {
    id: 'enterprise',
    name: 'Agency & Scale',
    tagline: 'For marketing agencies, high-volume campaigns, and teams',
    priceMonthly: 29,
    priceAnnual: 22,
    annualBilledTotal: 249, // Save 28%
    popularBadge: 'High Volume',
    ctaLabel: 'Get Enterprise',
    features: [
      'Everything in Pro tier',
      'Bulk QR Generator: 10,000+ codes via CSV/Excel with ZIP download',
      'Custom Short Domain branding (e.g. qr.yourdomain.com)',
      'Team multi-seat collaboration & workspace sharing',
      'Developer REST API access for automated programmatic generation',
      'Custom webhook triggers on scan events',
      'Dedicated priority SLA support & onboarding',
    ],
    limits: {
      dynamicQRs: 'unlimited',
      monthlyScans: 'unlimited',
      bulkGeneration: true,
      customLogos: 'unlimited',
      vectorPdf: true,
      smartRouting: true,
      analytics: 'enterprise',
      adFree: true,
    },
  },
};

export type FeatureKey =
  | 'dynamic_qr_unlimited'
  | 'smart_routing'
  | 'pin_protection'
  | 'vector_pdf'
  | 'logo_library'
  | 'bulk_generation'
  | 'analytics'
  | 'ad_free';

/**
 * Check whether a given user has entitlement to access a specific feature.
 * Admin users and @strixdevs.com users always have master access.
 */
export function hasFeatureAccess(user: User | null | undefined, feature: FeatureKey): boolean {
  if (!user) return false;

  // Master / Admin privileges
  if (user.role === 'admin' || user.email.toLowerCase().endsWith('@strixdevs.com')) {
    return true;
  }

  const tier = user.tier || 'free';

  switch (feature) {
    case 'dynamic_qr_unlimited':
    case 'smart_routing':
    case 'pin_protection':
    case 'vector_pdf':
    case 'logo_library':
    case 'ad_free':
      return tier === 'pro' || tier === 'enterprise';

    case 'bulk_generation':
      return tier === 'enterprise';

    case 'analytics':
      return tier === 'pro' || tier === 'enterprise';

    default:
      return false;
  }
}

/**
 * Check whether payment gateways are configured in environment variables
 */
export function isPaymentConfigured(): { stripe: boolean; lemonSqueezy: boolean } {
  return {
    stripe: Boolean(process.env.STRIPE_SECRET_KEY && process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY),
    lemonSqueezy: Boolean(process.env.LEMON_SQUEEZY_API_KEY && process.env.LEMON_SQUEEZY_STORE_ID),
  };
}
