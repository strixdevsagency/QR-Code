export type QRType = 'url' | 'wifi' | 'vcard' | 'whatsapp' | 'sms' | 'email' | 'text' | 'crypto';

export type DotType = 'square' | 'rounded' | 'dots' | 'classy' | 'classy-rounded' | 'extra-rounded';
export type CornerSquareType = 'square' | 'dot' | 'extra-rounded';
export type CornerDotType = 'square' | 'dot';

export type ExpiryMode = 'lifetime' | 'one_time' | 'time_limited';

export type PresetLogoId = 'strix' | 'wifi' | 'whatsapp' | 'instagram' | 'maps' | 'verified' | 'review';

export interface QRDesignOptions {
  dotsType: DotType;
  dotsColor: string;
  dotsColorEnd?: string;
  isGradient: boolean;
  gradientType: 'linear' | 'radial';
  cornerSquareType: CornerSquareType;
  cornerSquareColor: string;
  cornerDotType: CornerDotType;
  cornerDotColor: string;
  customEyeColors?: boolean;
  backgroundColor: string;
  margin: number;
  logoUrl?: string;
  presetLogoId?: PresetLogoId | null;
  badgeColor?: string;
  logoSize: number;
  validityTerm: 'lifetime' | '1year' | '6months';
}

export interface SmartRouteConfig {
  enabled: boolean;
  iosUrl?: string;
  androidUrl?: string;
  timeScheduled?: boolean;
  timeStart?: string; // "11:00"
  timeEnd?: string;   // "16:00"
  scheduleUrl?: string;
}

export interface DynamicQRConfig {
  mode: ExpiryMode;
  maxScans?: number; // e.g. 1 for one_time
  currentScans: number;
  expiresAt?: string; // ISO string if time_limited
  isBurned?: boolean;
  burnedAt?: string;
  isRevoked?: boolean;
  destinationType: QRType;
  destinationPayload: string;
  smartRouting?: SmartRouteConfig;
  pinProtected?: boolean;
  pinCode?: string;
}

export interface BulkQRItem {
  id: string;
  title: string;
  payload: string;
  type: QRType;
  status: 'pending' | 'generating' | 'done' | 'error';
  dataUrl?: string;
  svgString?: string;
  error?: string;
}

export interface WifiData {
  ssid: string;
  password: string;
  encryption: 'WPA' | 'WEP' | 'nopass';
  hidden: boolean;
}

export interface VCardData {
  firstName: string;
  lastName: string;
  company: string;
  title: string;
  phone: string;
  email: string;
  website: string;
  street: string;
  city: string;
  country: string;
}

export interface WhatsappData {
  phone: string;
  message: string;
}

export interface CryptoData {
  currency: 'BTC' | 'ETH' | 'SOL';
  address: string;
  amount?: string;
}

/* User & Authentication */
export type UserRole = 'admin' | 'user';
export type UserTier = 'free' | 'pro' | 'enterprise';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  tier?: UserTier;
  createdAt: string;
  avatarUrl?: string;
}

/* Pricing & Subscriptions */
export type BillingInterval = 'monthly' | 'annual';

export interface PricingPlan {
  id: UserTier | string;
  name: string;
  tagline: string;
  priceMonthly: number;
  priceAnnual: number; // monthly equivalent when billed annually
  annualBilledTotal: number;
  highlighted?: boolean;
  popularBadge?: string;
  features: string[];
  ctaLabel: string;
  isActive?: boolean;
  sortOrder?: number;
  limits: {
    dynamicQRs: number | 'unlimited';
    monthlyScans: number | 'unlimited';
    bulkGeneration: boolean;
    customLogos: number | 'unlimited';
    vectorPdf: boolean;
    smartRouting: boolean;
    analytics: 'basic' | 'advanced' | 'enterprise';
    adFree: boolean;
  };
}

/* License & Team Redemption Codes */
export interface LicenseCode {
  id: string;
  code: string;
  tier: UserTier;
  maxUses: number; // 1 for one-time, N for team use-cases
  usedCount: number;
  usedByEmails: string[];
  customerEmail?: string;
  customerName?: string;
  notes?: string;
  isActive: boolean;
  expiresAt?: string | null;
  createdAt: string;
}

/* Package Purchase Order Requests */
export type PackageOrderStatus = 'pending' | 'contacted' | 'code_issued' | 'completed' | 'cancelled';

export interface PackageOrder {
  id: string;
  name: string;
  email: string;
  phoneOrWhatsapp?: string;
  planId: string;
  planName: string;
  interval: BillingInterval;
  teamSeats?: number;
  priceFormatted: string;
  notes?: string;
  status: PackageOrderStatus;
  issuedCode?: string;
  createdAt: string;
}

/* User Dashboard Assets */
export interface SavedQRCode {
  id: string;
  userId: string;
  title: string;
  qrType: QRType;
  payload: string;
  design: QRDesignOptions;
  downloadCount: number;
  createdAt: string;
  isDynamic: boolean;
  dynamicConfig?: DynamicQRConfig;
}

export interface SavedLogo {
  id: string;
  userId: string;
  name: string;
  url: string;
  storagePath?: string;
  createdAt: string;
}

/* Admin AdSense & Google Services Configuration */
export interface AnalyticsConfig {
  googleAnalyticsId: string; // e.g. "G-XXXXXXXXXX"
  googleAnalyticsEnabled: boolean;
  googleTagManagerId: string; // e.g. "GTM-XXXXXXX"
  googleTagManagerEnabled: boolean;
  adSensePublisherId: string; // e.g. "ca-pub-XXXXXXXXXXXXXXXX"
  adSenseEnabled: boolean;
}

export interface DirectSponsorConfig {
  sponsorName: string;
  sponsorUrl?: string;
  imageUrl?: string;
  customHtml?: string;
  startDate?: string;
  endDate?: string; // Time limit for sponsor e.g. "2026-12-31"
  isActive: boolean;
}

export interface AdSlotConfig {
  id: 'leaderboard' | 'sidebar' | 'infeed' | 'modal';
  name: string;
  description: string;
  dimensions: string;
  enabled: boolean;
  hideWhenNoSponsor?: boolean; // Admin right to hide ad slot when no sponsor
  adClient: string; // e.g. "ca-pub-XXXXXXXXXXXX"
  adSlot: string;   // e.g. "1234567890"
  customHtml?: string;
  directSponsor?: DirectSponsorConfig;
}

/* Corporate Sponsorship Inquiries */
export type SponsorStatus = 'new' | 'contacted' | 'contract_sent' | 'closed';

export interface SponsorshipLead {
  id: string;
  name: string;
  company: string;
  email: string;
  website?: string;
  region: string;
  tier: string;
  message: string;
  status: SponsorStatus;
  createdAt: string;
}
