import type { User, SavedQRCode, AdSlotConfig, SponsorshipLead, AnalyticsConfig } from '../types';

export const DEFAULT_USERS: User[] = [];

export const DEFAULT_ANALYTICS: AnalyticsConfig = {
  googleAnalyticsId: '',
  googleAnalyticsEnabled: false,
  googleTagManagerId: '',
  googleTagManagerEnabled: false,
  adSensePublisherId: '',
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

export const DEFAULT_QRS: SavedQRCode[] = [];

export const DEFAULT_LEADS: SponsorshipLead[] = [];
