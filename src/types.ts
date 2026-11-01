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
