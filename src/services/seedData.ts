import type { User, SavedQRCode, AdSlotConfig, SponsorshipLead, AnalyticsConfig } from '../types';

export const DEFAULT_USERS: User[] = [
  {
    id: 'user_admin',
    name: 'StrixDevs Admin',
    email: 'admin@strixdevs.com',
    role: 'admin',
    createdAt: '2026-10-15T10:00:00Z',
  },
  {
    id: 'user_demo',
    name: 'Sarah Jenkins',
    email: 'user@strixdevs.com',
    role: 'user',
    createdAt: '2026-10-20T14:30:00Z',
  },
];

export const DEFAULT_ANALYTICS: AnalyticsConfig = {
  googleAnalyticsId: 'G-STRIX2026X',
  googleAnalyticsEnabled: false,
  googleTagManagerId: 'GTM-STRIX99',
  googleTagManagerEnabled: false,
  adSensePublisherId: 'ca-pub-9988776655443322',
  adSenseEnabled: false,
};

export const DEFAULT_ADS: AdSlotConfig[] = [
  {
    id: 'leaderboard',
    name: 'Top Header Leaderboard',
    description: 'Displays above the main fold (728x90 desktop / 320x50 mobile)',
    dimensions: '728x90',
    enabled: true,
    adClient: '',
    adSlot: '',
    customHtml: '',
  },
  {
    id: 'sidebar',
    name: 'Preview Canvas Sticky Sidebar',
    description: 'Sticky banner next to the live QR canvas (300x250 or 300x600)',
    dimensions: '300x250',
    enabled: true,
    adClient: '',
    adSlot: '',
    customHtml: '',
  },
  {
    id: 'infeed',
    name: 'Mid-Page In-Feed Banner',
    description: 'Positioned between the generator and the partnership section',
    dimensions: 'Responsive (max 800px)',
    enabled: true,
    adClient: '',
    adSlot: '',
    customHtml: '',
  },
  {
    id: 'modal',
    name: 'Download Countdown Interstitial',
    description: 'Displayed for 3 seconds while files compile for download',
    dimensions: '300x250',
    enabled: true,
    adClient: '',
    adSlot: '',
    customHtml: '',
  },
];

export const DEFAULT_QRS: SavedQRCode[] = [
  {
    id: 'qr_demo_static',
    userId: 'user_demo',
    title: 'Downtown Cafe Guest WiFi',
    qrType: 'wifi',
    payload: 'WIFI:S:ChicagoCafe-Guest;T:WPA;P:FreshCoffee2026;;',
    design: {
      dotsType: 'rounded',
      dotsColor: '#0f172a',
      isGradient: false,
      gradientType: 'linear',
      cornerSquareType: 'extra-rounded',
      cornerSquareColor: '#0f172a',
      cornerDotType: 'dot',
      cornerDotColor: '#0f172a',
      backgroundColor: '#ffffff',
      margin: 8,
      logoSize: 0.35,
      validityTerm: 'lifetime',
    },
    downloadCount: 14,
    createdAt: '2026-10-25T11:20:00Z',
    isDynamic: false,
  },
  {
    id: 'onetime_coupon_101',
    userId: 'user_demo',
    title: 'One-Time Secret VIP Discount ($50 Off)',
    qrType: 'url',
    payload: 'https://strixdevs.com/r/onetime_coupon_101',
    design: {
      dotsType: 'classy',
      dotsColor: '#1e293b',
      isGradient: true,
      dotsColorEnd: '#4f46e5',
      gradientType: 'linear',
      cornerSquareType: 'extra-rounded',
      cornerSquareColor: '#4f46e5',
      cornerDotType: 'dot',
      cornerDotColor: '#4f46e5',
      backgroundColor: '#ffffff',
      margin: 8,
      logoSize: 0.35,
      validityTerm: 'lifetime',
    },
    downloadCount: 38,
    createdAt: '2026-11-01T09:15:00Z',
    isDynamic: true,
    dynamicConfig: {
      mode: 'one_time',
      maxScans: 1,
      currentScans: 0,
      isBurned: false,
      isRevoked: false,
      destinationType: 'url',
      destinationPayload: 'https://strixdevs.com/?discount=VIP-STRIX-50',
    },
  },
];

export const DEFAULT_LEADS: SponsorshipLead[] = [
  {
    id: 'lead_1',
    name: 'Michael Chang',
    company: 'Apex Point of Sale Solutions',
    email: 'm.chang@apexpos.com',
    website: 'https://apexpos.example.com',
    region: 'Chicago & Midwest Area',
    tier: 'Top Leaderboard Banner Sponsor',
    message: 'Interested in a 3-month exclusive top banner.',
    status: 'new',
    createdAt: '2026-10-30T16:40:00Z',
  },
];

