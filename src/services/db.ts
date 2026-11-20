import type { User, SavedQRCode, SavedLogo, AdSlotConfig, SponsorshipLead, AnalyticsConfig } from '../types';
import { DEFAULT_USERS, DEFAULT_ANALYTICS, DEFAULT_ADS, DEFAULT_QRS, DEFAULT_LEADS } from './seedData';

const USERS_KEY = 'strix_users_v3';
const QR_KEY = 'strix_qrcodes_v3';
const LOGOS_KEY = 'strix_logos_v3';
const ADS_KEY = 'strix_ads_v3';
const LEADS_KEY = 'strix_leads_v3';
const ANALYTICS_KEY = 'strix_analytics_v3';
const CURRENT_USER_KEY = 'strix_current_user_v3';

class DatabaseService {
  private getItem<T>(key: string, fallback: T): T {
    try {
      if (typeof window === 'undefined') return fallback;
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : fallback;
    } catch {
      return fallback;
    }
  }

  private setItem<T>(key: string, value: T): void {
    try {
      if (typeof window === 'undefined') return;
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
    this.setItem(CURRENT_USER_KEY, user);
  }

  getUsers(): User[] {
    return this.getItem<User[]>(USERS_KEY, DEFAULT_USERS);
  }

  registerUser(name: string, email: string): User {
    const users = this.getUsers();
    const existing = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      this.setCurrentUser(existing);
      return existing;
    }

    const newUser: User = {
      id: `usr_${Date.now()}`,
      name,
      email,
      role: 'user',
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    this.setItem(USERS_KEY, users);
    this.setCurrentUser(newUser);
    return newUser;
  }

  loginUser(email: string): User | null {
    const users = this.getUsers();
    const found = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (found) {
      this.setCurrentUser(found);
      return found;
    }
    return null;
  }

  logout(): void {
    this.setItem(CURRENT_USER_KEY, null);
  }

  updateUserTier(userId: string, tier: import('../types').UserTier): User | null {
    const users = this.getUsers();
    const user = users.find((u) => u.id === userId);
    if (user) {
      user.tier = tier;
      this.setItem(USERS_KEY, users);
      const current = this.getCurrentUser();
      if (current && current.id === userId) {
        current.tier = tier;
        this.setCurrentUser(current);
      }
      return user;
    }
    const current = this.getCurrentUser();
    if (current) {
      current.tier = tier;
      this.setCurrentUser(current);
      return current;
    }
    return null;
  }

  // --- QR Codes ---
  getAllQRs(): SavedQRCode[] {
    return this.getItem<SavedQRCode[]>(QR_KEY, DEFAULT_QRS);
  }

  getUserQRs(userId: string): SavedQRCode[] {
    return this.getAllQRs().filter((q) => q.userId === userId);
  }

  getQRById(id: string): SavedQRCode | null {
    return this.getAllQRs().find((q) => q.id === id) || null;
  }

  saveQRCode(data: any): SavedQRCode {
    const qrs = this.getAllQRs();
    const newQR: SavedQRCode = {
      id: data.id || `sqr_${Date.now()}`,
      userId: data.userId,
      title: data.title,
      qrType: data.qrType,
      payload: data.payload,
      design: data.design,
      downloadCount: 0,
      createdAt: new Date().toISOString(),
      isDynamic: Boolean(data.isDynamic),
      dynamicConfig: data.dynamicConfig,
    };

    if (newQR.isDynamic) {
      const origin = typeof window !== 'undefined' ? window.location.origin : 'https://strixdevs.com';
      newQR.payload = `${origin}/r/${newQR.id}`;
    }

    qrs.unshift(newQR);
    this.setItem(QR_KEY, qrs);

    // Sync with production cloud registry and Supabase
    if (typeof window !== 'undefined') {
      fetch('/api/qr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newQR),
      }).catch(() => {});
    }

    return newQR;
  }

  updateQRCode(id: string, updates: Partial<SavedQRCode>): void {
    const qrs = this.getAllQRs().map((q) => (q.id === id ? { ...q, ...updates } : q));
    this.setItem(QR_KEY, qrs);

    // Sync updated QR code with cloud registry & Supabase
    const updated = qrs.find((q) => q.id === id);
    if (updated && typeof window !== 'undefined') {
      fetch('/api/qr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      }).catch(() => {});
    }
  }

  deleteQRCode(id: string): void {
    this.setItem(QR_KEY, this.getAllQRs().filter((q) => q.id !== id));
  }

  // --- Dynamic Ephemeral Resolver ---
  recordScan(id: string, options?: { pin?: string; userAgent?: string }): {
    status: 'success' | 'burned' | 'expired' | 'revoked' | 'not_found' | 'pin_required';
    qr?: SavedQRCode;
    destination?: string;
    destinationType?: SavedQRCode['qrType'];
    burnTimestamp?: string;
  } {
    const qr = this.getQRById(id);
    if (!qr) return { status: 'not_found' };

    if (!qr.isDynamic || !qr.dynamicConfig) {
      return { status: 'success', qr, destination: qr.payload, destinationType: qr.qrType };
    }

    const cfg = qr.dynamicConfig;
    if (cfg.isRevoked) return { status: 'revoked', qr };

    if (cfg.isBurned || (cfg.mode === 'one_time' && cfg.currentScans >= (cfg.maxScans || 1))) {
      return { status: 'burned', qr, burnTimestamp: cfg.burnedAt || qr.createdAt };
    }

    if (cfg.mode === 'time_limited' && cfg.expiresAt) {
      if (Date.now() > new Date(cfg.expiresAt).getTime()) return { status: 'expired', qr };
    }

    // PIN Protection Check
    if (cfg.pinProtected && cfg.pinCode) {
      if (!options?.pin || options.pin !== cfg.pinCode) {
        return { status: 'pin_required', qr };
      }
    }

    let resolvedDestination = cfg.destinationPayload;

    // Smart Routing Logic
    if (cfg.smartRouting?.enabled) {
      const ua = options?.userAgent || (typeof navigator !== 'undefined' ? navigator.userAgent : '');
      const isIOS = /iPhone|iPad|iPod/i.test(ua);
      const isAndroid = /Android/i.test(ua);

      if (isIOS && cfg.smartRouting.iosUrl) {
        resolvedDestination = cfg.smartRouting.iosUrl;
      } else if (isAndroid && cfg.smartRouting.androidUrl) {
        resolvedDestination = cfg.smartRouting.androidUrl;
      } else if (cfg.smartRouting.timeScheduled && cfg.smartRouting.scheduleUrl) {
        const now = new Date();
        const currentHour = now.getHours();
        const startHour = cfg.smartRouting.timeStart ? parseInt(cfg.smartRouting.timeStart.split(':')[0], 10) : 0;
        const endHour = cfg.smartRouting.timeEnd ? parseInt(cfg.smartRouting.timeEnd.split(':')[0], 10) : 24;
        if (currentHour >= startHour && currentHour < endHour) {
          resolvedDestination = cfg.smartRouting.scheduleUrl;
        }
      }
    }

    const newScans = (cfg.currentScans || 0) + 1;
    const shouldBurn = cfg.mode === 'one_time' && newScans >= (cfg.maxScans || 1);

    const updatedConfig = {
      ...cfg,
      currentScans: newScans,
      isBurned: shouldBurn,
      burnedAt: shouldBurn ? new Date().toISOString() : cfg.burnedAt,
    };

    this.updateQRCode(id, { dynamicConfig: updatedConfig });
    return {
      status: 'success',
      qr: { ...qr, dynamicConfig: updatedConfig },
      destination: resolvedDestination,
      destinationType: cfg.destinationType,
    };
  }

  toggleRevokeQR(id: string): boolean {
    const qr = this.getQRById(id);
    if (!qr || !qr.dynamicConfig) return false;
    const newRevoked = !qr.dynamicConfig.isRevoked;
    this.updateQRCode(id, {
      dynamicConfig: { ...qr.dynamicConfig, isRevoked: newRevoked },
    });
    return newRevoked;
  }

  // --- Logos ---
  getUserLogos(userId: string): SavedLogo[] {
    return this.getItem<SavedLogo[]>(LOGOS_KEY, []).filter((l) => l.userId === userId);
  }

  saveLogo(userId: string, name: string, url: string): SavedLogo {
    const logos = this.getItem<SavedLogo[]>(LOGOS_KEY, []);
    const newLogo: SavedLogo = { id: `logo_${Date.now()}`, userId, name, url, createdAt: new Date().toISOString() };
    logos.unshift(newLogo);
    this.setItem(LOGOS_KEY, logos);
    return newLogo;
  }

  deleteLogo(id: string): void {
    this.setItem(LOGOS_KEY, this.getItem<SavedLogo[]>(LOGOS_KEY, []).filter((l) => l.id !== id));
  }

  // --- AdSense & Analytics ---
  getAdSlots(): AdSlotConfig[] {
    return this.getItem<AdSlotConfig[]>(ADS_KEY, DEFAULT_ADS);
  }

  updateAdSlot(id: string, updates: Partial<AdSlotConfig>): void {
    this.setItem(ADS_KEY, this.getAdSlots().map((s) => (s.id === id ? { ...s, ...updates } : s)));
  }

  getAnalyticsConfig(): AnalyticsConfig {
    return this.getItem<AnalyticsConfig>(ANALYTICS_KEY, DEFAULT_ANALYTICS);
  }

  saveAnalyticsConfig(config: AnalyticsConfig): void {
    this.setItem(ANALYTICS_KEY, config);
  }

  // --- Leads ---
  getLeads(): SponsorshipLead[] {
    return this.getItem<SponsorshipLead[]>(LEADS_KEY, DEFAULT_LEADS);
  }

  saveLead(lead: Omit<SponsorshipLead, 'id' | 'createdAt' | 'status'>): SponsorshipLead {
    const leads = this.getLeads();
    const newLead: SponsorshipLead = { ...lead, id: `lead_${Date.now()}`, status: 'new', createdAt: new Date().toISOString() };
    leads.unshift(newLead);
    this.setItem(LEADS_KEY, leads);
    return newLead;
  }

  updateLeadStatus(id: string, status: SponsorshipLead['status']): void {
    this.setItem(LEADS_KEY, this.getLeads().map((l) => (l.id === id ? { ...l, status } : l)));
  }

  deleteLead(id: string): void {
    this.setItem(LEADS_KEY, this.getLeads().filter((l) => l.id !== id));
  }
}

export const db = new DatabaseService();
