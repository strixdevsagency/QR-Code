export type QRType = 'url' | 'wifi' | 'vcard' | 'whatsapp' | 'sms' | 'email' | 'text' | 'crypto';

export type DotType = 'square' | 'rounded' | 'dots' | 'classy' | 'classy-rounded' | 'extra-rounded';
export type CornerSquareType = 'square' | 'dot' | 'extra-rounded';
export type CornerDotType = 'square' | 'dot';

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
  backgroundColor: string;
  margin: number;
  logoUrl?: string;
  logoSize: number;
  validityTerm: 'lifetime' | '1year' | '6months';
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

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
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
}

export interface SavedLogo {
  id: string;
  userId: string;
  name: string;
  url: string;
  createdAt: string;
}

/* Admin AdSense Configuration */
export interface AdSlotConfig {
  id: 'leaderboard' | 'sidebar' | 'infeed' | 'modal';
  name: string;
  description: string;
  dimensions: string;
  enabled: boolean;
  adClient: string; // e.g. "ca-pub-XXXXXXXXXXXX"
  adSlot: string;   // e.g. "1234567890"
  customHtml?: string;
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
