import type { User, SavedQRCode, SavedLogo, AdSlotConfig, SponsorshipLead } from '../types';

const USERS_KEY = 'strix_users_v1';
const QR_KEY = 'strix_qrcodes_v1';
const LOGOS_KEY = 'strix_logos_v1';
const ADS_KEY = 'strix_ads_v1';
const LEADS_KEY = 'strix_leads_v1';
const CURRENT_USER_KEY = 'strix_current_user_v1';

// Initial Seed Data
const DEFAULT_USERS: User[] = [
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

const DEFAULT_ADS: AdSlotConfig[] = [
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

const DEFAULT_QRS: SavedQRCode[] = [
  {
    id: 'qr_1',
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
  },
  {
    id: 'qr_2',
    userId: 'user_demo',
    title: 'Digital Business Card vCard',
    qrType: 'vcard',
    payload: 'BEGIN:VCARD\nVERSION:3.0\nFN:Sarah Jenkins\nORG:StrixDevs Partner\nTEL:+13125550192\nEND:VCARD',
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
    createdAt: '2026-10-28T09:15:00Z',
  },
];

const DEFAULT_LEADS: SponsorshipLead[] = [
  {
    id: 'lead_1',
    name: 'Michael Chang',
    company: 'Apex Point of Sale Solutions',
    email: 'm.chang@apexpos.com',
    website: 'https://apexpos.example.com',
    region: 'Chicago & Midwest Area',
    tier: 'Top Leaderboard Banner Sponsor',
    message: 'We provide cloud POS for over 400 restaurants across Chicago. Interested in a 3-month exclusive top banner.',
    status: 'new',
    createdAt: '2026-10-30T16:40:00Z',
  },
  {
    id: 'lead_2',
    name: 'Emily Watson',
    company: 'Manhattan Commercial Printing',
    email: 'emily@manhattanprint.com',
    website: 'https://manhattanprint.example.com',
    region: 'New York & Tri-State Area',
    tier: 'Print Template Exclusive Partner',
    message: 'Looking to partner as the recommended print provider for PDF table tents and vinyl storefront decals.',
    status: 'contacted',
    createdAt: '2026-10-29T12:00:00Z',
  },
];

class DatabaseService {
  private getItem<T>(key: string, fallback: T): T {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : fallback;
    } catch {
      return fallback;
    }
  }

  private setItem<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error('Storage write error', e);
    }
  }

  // --- Auth & Users ---
  getCurrentUser(): User | null {
    return this.getItem<User | null>(CURRENT_USER_KEY, null);
  }

  setCurrentUser(user: User | null): void {
    if (user) {
      this.setItem(CURRENT_USER_KEY, user);
    } else {
      localStorage.removeItem(CURRENT_USER_KEY);
    }
  }

  getUsers(): User[] {
    return this.getItem<User[]>(USERS_KEY, DEFAULT_USERS);
  }

  findUserByEmail(email: string): User | undefined {
    const users = this.getUsers();
    return users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  createUser(name: string, email: string, role: 'admin' | 'user' = 'user'): User {
    const users = this.getUsers();
    const newUser: User = {
      id: `user_${Date.now()}`,
      name,
      email,
      role,
      createdAt: new Date().toISOString(),
    };
    users.push(newUser);
    this.setItem(USERS_KEY, users);
    return newUser;
  }

  // --- Saved QR Codes ---
  getUserQRs(userId: string): SavedQRCode[] {
    const qrs = this.getItem<SavedQRCode[]>(QR_KEY, DEFAULT_QRS);
    return qrs.filter((q) => q.userId === userId);
  }

  getAllQRs(): SavedQRCode[] {
    return this.getItem<SavedQRCode[]>(QR_KEY, DEFAULT_QRS);
  }

  saveQRCode(qr: Omit<SavedQRCode, 'id' | 'createdAt' | 'downloadCount'>): SavedQRCode {
    const qrs = this.getItem<SavedQRCode[]>(QR_KEY, DEFAULT_QRS);
    const newQR: SavedQRCode = {
      ...qr,
      id: `qr_${Date.now()}`,
      downloadCount: 1,
      createdAt: new Date().toISOString(),
    };
    qrs.unshift(newQR);
    this.setItem(QR_KEY, qrs);
    return newQR;
  }

  incrementDownloadCount(qrId: string): void {
    const qrs = this.getItem<SavedQRCode[]>(QR_KEY, DEFAULT_QRS);
    const target = qrs.find((q) => q.id === qrId);
    if (target) {
      target.downloadCount += 1;
      this.setItem(QR_KEY, qrs);
    }
  }

  deleteQRCode(qrId: string): void {
    const qrs = this.getItem<SavedQRCode[]>(QR_KEY, DEFAULT_QRS);
    const filtered = qrs.filter((q) => q.id !== qrId);
    this.setItem(QR_KEY, filtered);
  }

  // --- Saved Logos ---
  getUserLogos(userId: string): SavedLogo[] {
    const logos = this.getItem<SavedLogo[]>(LOGOS_KEY, []);
    return logos.filter((l) => l.userId === userId);
  }

  saveLogo(userId: string, name: string, url: string): SavedLogo {
    const logos = this.getItem<SavedLogo[]>(LOGOS_KEY, []);
    const newLogo: SavedLogo = {
      id: `logo_${Date.now()}`,
      userId,
      name,
      url,
      createdAt: new Date().toISOString(),
    };
    logos.unshift(newLogo);
    this.setItem(LOGOS_KEY, logos);
    return newLogo;
  }

  deleteLogo(logoId: string): void {
    const logos = this.getItem<SavedLogo[]>(LOGOS_KEY, []);
    this.setItem(
      LOGOS_KEY,
      logos.filter((l) => l.id !== logoId)
    );
  }

  // --- Ad Management (Admin) ---
  getAdSlots(): AdSlotConfig[] {
    return this.getItem<AdSlotConfig[]>(ADS_KEY, DEFAULT_ADS);
  }

  updateAdSlot(slotId: string, updates: Partial<AdSlotConfig>): void {
    const slots = this.getAdSlots();
    const target = slots.find((s) => s.id === slotId);
    if (target) {
      Object.assign(target, updates);
      this.setItem(ADS_KEY, slots);
    }
  }

  // --- Sponsorship Leads (Admin CRM) ---
  getLeads(): SponsorshipLead[] {
    return this.getItem<SponsorshipLead[]>(LEADS_KEY, DEFAULT_LEADS);
  }

  saveLead(lead: Omit<SponsorshipLead, 'id' | 'createdAt' | 'status'>): SponsorshipLead {
    const leads = this.getLeads();
    const newLead: SponsorshipLead = {
      ...lead,
      id: `lead_${Date.now()}`,
      status: 'new',
      createdAt: new Date().toISOString(),
    };
    leads.unshift(newLead);
    this.setItem(LEADS_KEY, leads);
    return newLead;
  }

  updateLeadStatus(leadId: string, status: SponsorshipLead['status']): void {
    const leads = this.getLeads();
    const target = leads.find((l) => l.id === leadId);
    if (target) {
      target.status = status;
      this.setItem(LEADS_KEY, leads);
    }
  }

  deleteLead(leadId: string): void {
    const leads = this.getLeads();
    this.setItem(
      LEADS_KEY,
      leads.filter((l) => l.id !== leadId)
    );
  }
}

export const db = new DatabaseService();
