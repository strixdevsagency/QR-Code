import type {
  User,
  SavedQRCode,
  SavedLogo,
  AdSlotConfig,
  SponsorshipLead,
  AnalyticsConfig,
  PricingPlan,
  LicenseCode,
  PackageOrder,
  PackageOrderStatus,
  UserTier,
} from '../types';
import {
  DEFAULT_USERS,
  DEFAULT_ANALYTICS,
  DEFAULT_ADS,
  DEFAULT_QRS,
  DEFAULT_LEADS,
  DEFAULT_PACKAGES,
  DEFAULT_LICENSE_CODES,
  DEFAULT_PACKAGE_ORDERS,
} from './seedData';
import {
  supabase,
  isSupabaseConfigured,
  uploadImageToSupabase,
  deleteImageFromSupabase,
} from './supabase';
import { getDynamicQRUrl } from '../utils/url';

const USERS_KEY = 'strix_users_v3';
const QR_KEY = 'strix_qrcodes_v3';
const LOGOS_KEY = 'strix_logos_v3';
const ADS_KEY = 'strix_ads_v3';
const LEADS_KEY = 'strix_leads_v3';
const ANALYTICS_KEY = 'strix_analytics_v3';
const CURRENT_USER_KEY = 'strix_current_user_v3';
const PACKAGES_KEY = 'strix_packages_v3';
const CODES_KEY = 'strix_codes_v3';
const ORDERS_KEY = 'strix_orders_v3';

async function syncToSupabase(promiseLike: any): Promise<any> {
  if (!promiseLike) return null;
  try {
    const res = await promiseLike;
    if (res?.error) {
      console.warn('[Strix Cloud Sync] PostgreSQL warning:', res.error);
    }
    return res;
  } catch (err) {
    console.error('[Strix Cloud Sync] Network failure:', err);
    return null;
  }
}

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
    const users = this.getItem<User[]>(USERS_KEY, DEFAULT_USERS);
    if (!users || users.length === 0) {
      this.setItem(USERS_KEY, DEFAULT_USERS);
      return DEFAULT_USERS;
    }
    return users;
  }

  async syncUsersFromSupabase(): Promise<User[]> {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          const mapped: User[] = data.map((p: any) => ({
            id: p.id,
            name: p.name || p.email.split('@')[0],
            email: p.email,
            role: (p.role as import('../types').UserRole) || 'user',
            tier: (p.tier as import('../types').UserTier) || 'free',
            createdAt: p.created_at,
            avatarUrl: p.avatar_url || undefined,
          }));
          this.setItem(USERS_KEY, mapped);
          return mapped;
        }
      } catch (e) {
        console.warn('Failed to sync profiles from Supabase:', e);
      }
    }
    return this.getUsers();
  }

  saveUserProfile(user: User): User {
    const users = this.getUsers();
    const index = users.findIndex((u) => u.id === user.id || u.email.toLowerCase() === user.email.toLowerCase());
    if (index >= 0) {
      users[index] = { ...users[index], ...user };
    } else {
      users.unshift(user);
    }
    this.setItem(USERS_KEY, users);

    if (isSupabaseConfigured() && supabase) {
      syncToSupabase(
        supabase.from('profiles').upsert({
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          tier: user.tier || 'free',
          avatar_url: user.avatarUrl || null,
          created_at: user.createdAt,
          updated_at: new Date().toISOString(),
        })
      );
    }
    return user;
  }

  createUser(data: { name: string; email: string; role?: import('../types').UserRole; tier?: import('../types').UserTier }): User {
    const users = this.getUsers();
    const existing = users.find((u) => u.email.toLowerCase() === data.email.toLowerCase());
    if (existing) {
      existing.name = data.name || existing.name;
      if (data.role) existing.role = data.role;
      if (data.tier) existing.tier = data.tier;
      this.setItem(USERS_KEY, users);
      if (isSupabaseConfigured() && supabase) {
        syncToSupabase(
          supabase.from('profiles').upsert({
            id: existing.id,
            email: existing.email,
            name: existing.name,
            role: existing.role,
            tier: existing.tier || 'free',
            updated_at: new Date().toISOString(),
          })
        );
      }
      return existing;
    }

    const newUser: User = {
      id: `usr_${Date.now()}`,
      name: data.name,
      email: data.email,
      role: data.role || 'user',
      tier: data.tier || 'free',
      createdAt: new Date().toISOString(),
    };

    users.unshift(newUser);
    this.setItem(USERS_KEY, users);

    if (isSupabaseConfigured() && supabase) {
      syncToSupabase(
        supabase.from('profiles').upsert({
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          role: newUser.role,
          tier: newUser.tier,
          created_at: newUser.createdAt,
          updated_at: new Date().toISOString(),
        })
      );
    }
    return newUser;
  }

  updateUserRole(userId: string, role: import('../types').UserRole): User | null {
    const users = this.getUsers();
    const user = users.find((u) => u.id === userId);
    if (user) {
      user.role = role;
      this.setItem(USERS_KEY, users);
      const current = this.getCurrentUser();
      if (current && current.id === userId) {
        current.role = role;
        this.setCurrentUser(current);
      }
      if (isSupabaseConfigured() && supabase) {
        syncToSupabase(
          supabase
            .from('profiles')
            .update({ role, updated_at: new Date().toISOString() })
            .eq('id', userId)
        );
      }
      return user;
    }
    return null;
  }

  deleteUser(userId: string): boolean {
    let users = this.getUsers();
    const initialLen = users.length;
    users = users.filter((u) => u.id !== userId);
    if (users.length !== initialLen) {
      this.setItem(USERS_KEY, users);
      if (isSupabaseConfigured() && supabase) {
        syncToSupabase(supabase.from('profiles').delete().eq('id', userId));
      }
      return true;
    }
    return false;
  }

  registerUser(name: string, email: string): User {
    const users = this.getUsers();
    const existing = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      this.setCurrentUser(existing);
      return existing;
    }

    const isAdmin = email.toLowerCase().endsWith('@strixdevs.com');
    const newUser: User = {
      id: `usr_${Date.now()}`,
      name,
      email,
      role: isAdmin ? 'admin' : 'user',
      tier: isAdmin ? 'enterprise' : 'free',
      createdAt: new Date().toISOString(),
    };

    users.unshift(newUser);
    this.setItem(USERS_KEY, users);
    this.setCurrentUser(newUser);

    if (isSupabaseConfigured() && supabase) {
      syncToSupabase(
        supabase.from('profiles').upsert({
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          role: newUser.role,
          tier: newUser.tier,
          created_at: newUser.createdAt,
          updated_at: new Date().toISOString(),
        })
      );
    }
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
      if (isSupabaseConfigured() && supabase) {
        syncToSupabase(
          supabase
            .from('profiles')
            .update({ tier, updated_at: new Date().toISOString() })
            .eq('id', userId)
        );
      }
      return user;
    }
    const current = this.getCurrentUser();
    if (current) {
      current.tier = tier;
      this.setCurrentUser(current);
      if (isSupabaseConfigured() && supabase) {
        syncToSupabase(
          supabase
            .from('profiles')
            .update({ tier, updated_at: new Date().toISOString() })
            .eq('id', current.id)
        );
      }
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

  async fetchUserQRs(userId: string): Promise<SavedQRCode[]> {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase
          .from('qr_codes')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (!error && data) {
          const mapped: SavedQRCode[] = data.map((d: any) => ({
            id: d.id,
            userId: d.user_id,
            title: d.title,
            qrType: d.qr_type,
            payload: d.payload,
            design: d.design,
            downloadCount: d.download_count || 0,
            createdAt: d.created_at,
            isDynamic: Boolean(d.is_dynamic),
            dynamicConfig: d.dynamic_config,
          }));
          const allCached = this.getAllQRs().filter((q) => q.userId !== userId);
          this.setItem(QR_KEY, [...mapped, ...allCached]);
          return mapped;
        }
      } catch (err) {
        console.warn('Failed to fetch QRs from Supabase:', err);
      }
    }
    return this.getUserQRs(userId);
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
      newQR.payload = getDynamicQRUrl(newQR.id);
    }

    qrs.unshift(newQR);
    this.setItem(QR_KEY, qrs);

    // Sync with production cloud registry and Supabase
    this.saveQRCodeCloud(newQR).catch((err) => {
      console.warn('[Strix Cloud QR] Async cloud sync deferred/warning:', err);
    });

    return newQR;
  }

  async saveQRCodeAsync(data: any): Promise<SavedQRCode> {
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
      newQR.payload = getDynamicQRUrl(newQR.id);
    }

    qrs.unshift(newQR);
    this.setItem(QR_KEY, qrs);

    await this.saveQRCodeCloud(newQR);
    return newQR;
  }

  async saveQRCodeCloud(newQR: SavedQRCode): Promise<void> {
    const promises: Promise<any>[] = [];

    // 1. Sync to Next.js API / Registry
    if (typeof window !== 'undefined') {
      promises.push(
        fetch('/api/qr', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newQR),
        }).then(async (res) => {
          if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.error || `Failed to register QR: HTTP ${res.status}`);
          }
        })
      );
    }

    // 2. Direct Supabase PostgreSQL upsert if configured
    if (isSupabaseConfigured() && supabase) {
      promises.push(
        Promise.resolve(
          supabase.from('qr_codes').upsert(
            {
              id: newQR.id,
              user_id: newQR.userId || null,
              title: newQR.title,
              qr_type: newQR.qrType,
              payload: newQR.payload,
              design: newQR.design,
              is_dynamic: newQR.isDynamic,
              dynamic_config: newQR.dynamicConfig,
              download_count: newQR.downloadCount || 0,
              created_at: newQR.createdAt,
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'id' }
          )
        ).then(({ error }: any) => {
          if (error) {
            console.warn('[Strix DB] Supabase qr_codes upsert notice:', error);
          }
        })
      );
    }

    if (promises.length > 0) {
      await Promise.all(promises);
    }
  }

  updateQRCode(id: string, updates: Partial<SavedQRCode>): void {
    const qrs = this.getAllQRs().map((q) => (q.id === id ? { ...q, ...updates } : q));
    this.setItem(QR_KEY, qrs);

    const updated = qrs.find((q) => q.id === id);
    if (updated) {
      this.saveQRCodeCloud(updated).catch((err) => {
        console.warn('[Strix Cloud QR] Update deferred/warning:', err);
      });
    }
  }

  async updateQRCodeAsync(id: string, updates: Partial<SavedQRCode>): Promise<SavedQRCode | null> {
    const qrs = this.getAllQRs().map((q) => (q.id === id ? { ...q, ...updates } : q));
    this.setItem(QR_KEY, qrs);

    const updated = qrs.find((q) => q.id === id);
    if (updated) {
      await this.saveQRCodeCloud(updated);
      return updated;
    }
    return null;
  }

  deleteQRCode(id: string): void {
    this.setItem(QR_KEY, this.getAllQRs().filter((q) => q.id !== id));
    if (isSupabaseConfigured() && supabase) {
      supabase.from('qr_codes').delete().eq('id', id).then(({ error }) => {
        if (error) console.error('Failed to delete QR from Supabase:', error);
      });
    }
  }

  async deleteQRCodeAsync(id: string): Promise<boolean> {
    this.setItem(QR_KEY, this.getAllQRs().filter((q) => q.id !== id));
    if (isSupabaseConfigured() && supabase) {
      const { error } = await supabase.from('qr_codes').delete().eq('id', id);
      if (error) {
        console.error('Failed to delete QR from Supabase:', error);
        return false;
      }
    }
    return true;
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

  async fetchUserLogos(userId: string): Promise<SavedLogo[]> {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase
          .from('user_logos')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (!error && data) {
          const mapped: SavedLogo[] = data.map((l: any) => ({
            id: l.id,
            userId: l.user_id,
            name: l.name,
            url: l.url,
            storagePath: l.storage_path,
            createdAt: l.created_at,
          }));
          const allCached = this.getItem<SavedLogo[]>(LOGOS_KEY, []).filter((l) => l.userId !== userId);
          this.setItem(LOGOS_KEY, [...mapped, ...allCached]);
          return mapped;
        }
      } catch (err) {
        console.warn('Failed to fetch logos from Supabase:', err);
      }
    }
    return this.getUserLogos(userId);
  }

  saveLogo(userId: string, name: string, url: string, storagePath?: string): SavedLogo {
    const logos = this.getItem<SavedLogo[]>(LOGOS_KEY, []);
    const newLogo: SavedLogo = {
      id: `logo_${Date.now()}`,
      userId,
      name,
      url,
      storagePath,
      createdAt: new Date().toISOString(),
    };
    logos.unshift(newLogo);
    this.setItem(LOGOS_KEY, logos);

    if (isSupabaseConfigured() && supabase) {
      syncToSupabase(
        supabase.from('user_logos').upsert({
          id: newLogo.id,
          user_id: newLogo.userId,
          name: newLogo.name,
          url: newLogo.url,
          storage_path: newLogo.storagePath || null,
          created_at: newLogo.createdAt,
        })
      );
    }

    return newLogo;
  }

  async uploadUserLogo(userId: string, file: File): Promise<SavedLogo> {
    let logoUrl: string = '';
    let storagePath: string | undefined = undefined;

    // 1. Try uploading to Supabase Storage ('logos' bucket)
    if (isSupabaseConfigured() && supabase) {
      const uploadRes = await uploadImageToSupabase(userId, file);
      if (uploadRes.url) {
        logoUrl = uploadRes.url;
        storagePath = uploadRes.storagePath || undefined;
      }
    }

    // 2. Fallback to base64 data-url if storage was unavailable
    if (!logoUrl) {
      logoUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    }

    return this.saveLogo(userId, file.name, logoUrl, storagePath);
  }

  deleteLogo(id: string): void {
    const logos = this.getItem<SavedLogo[]>(LOGOS_KEY, []);
    const target = logos.find((l) => l.id === id);
    this.setItem(LOGOS_KEY, logos.filter((l) => l.id !== id));

    if (target?.storagePath) {
      deleteImageFromSupabase(target.storagePath).catch(() => {});
    }
    if (isSupabaseConfigured() && supabase) {
      supabase.from('user_logos').delete().eq('id', id).then(({ error }) => {
        if (error) console.warn('[Strix DB] Supabase logo delete warning:', error);
      });
    }
  }

  async deleteLogoAsync(id: string): Promise<boolean> {
    const logos = this.getItem<SavedLogo[]>(LOGOS_KEY, []);
    const target = logos.find((l) => l.id === id);
    this.setItem(LOGOS_KEY, logos.filter((l) => l.id !== id));

    if (target?.storagePath) {
      await deleteImageFromSupabase(target.storagePath);
    }
    if (isSupabaseConfigured() && supabase) {
      const { error } = await supabase.from('user_logos').delete().eq('id', id);
      if (error) {
        console.error('Failed to delete logo from Supabase:', error);
        return false;
      }
    }
    return true;
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

  // --- Packages & Pricing Plans (Admin Configurable) ---
  getPackages(): PricingPlan[] {
    return this.getItem<PricingPlan[]>(PACKAGES_KEY, DEFAULT_PACKAGES);
  }

  savePackage(pkg: PricingPlan): void {
    const packages = this.getPackages();
    const index = packages.findIndex((p) => p.id === pkg.id);
    if (index >= 0) {
      packages[index] = pkg;
    } else {
      packages.push(pkg);
    }
    this.setItem(PACKAGES_KEY, packages);

    if (isSupabaseConfigured() && supabase) {
      syncToSupabase(
        supabase.from('packages').upsert({
          id: pkg.id,
          name: pkg.name,
          tagline: pkg.tagline,
          price_monthly: pkg.priceMonthly,
          price_annual: pkg.priceAnnual,
          annual_billed_total: pkg.annualBilledTotal,
          highlighted: Boolean(pkg.highlighted),
          popular_badge: pkg.popularBadge || null,
          cta_label: pkg.ctaLabel || 'Get Started',
          features: pkg.features,
          limits: pkg.limits,
          is_active: pkg.isActive !== false,
          sort_order: pkg.sortOrder || 0,
          updated_at: new Date().toISOString(),
        })
      );
    }
  }

  deletePackage(id: string): void {
    this.setItem(PACKAGES_KEY, this.getPackages().filter((p) => p.id !== id));
    if (isSupabaseConfigured() && supabase) {
      syncToSupabase(supabase.from('packages').delete().eq('id', id));
    }
  }

  resetPackagesToDefault(): void {
    this.setItem(PACKAGES_KEY, DEFAULT_PACKAGES);
  }

  // --- License Codes & Team Redemption ---
  getLicenseCodes(): LicenseCode[] {
    return this.getItem<LicenseCode[]>(CODES_KEY, DEFAULT_LICENSE_CODES);
  }

  createLicenseCode(data: Omit<LicenseCode, 'id' | 'createdAt' | 'usedCount' | 'usedByEmails'>): LicenseCode {
    const codes = this.getLicenseCodes();
    const newCode: LicenseCode = {
      ...data,
      id: `lic_${Date.now()}`,
      code: data.code.trim().toUpperCase(),
      usedCount: 0,
      usedByEmails: [],
      createdAt: new Date().toISOString(),
    };
    codes.unshift(newCode);
    this.setItem(CODES_KEY, codes);

    if (isSupabaseConfigured() && supabase) {
      syncToSupabase(
        supabase.from('license_codes').insert({
          id: newCode.id,
          code: newCode.code,
          tier: newCode.tier,
          max_uses: newCode.maxUses,
          used_count: 0,
          used_by_emails: [],
          customer_email: newCode.customerEmail || null,
          customer_name: newCode.customerName || null,
          notes: newCode.notes || null,
          is_active: newCode.isActive,
          expires_at: newCode.expiresAt || null,
        })
      );
    }

    return newCode;
  }

  updateLicenseCode(id: string, updates: Partial<LicenseCode>): void {
    const codes = this.getLicenseCodes().map((c) => (c.id === id ? { ...c, ...updates } : c));
    this.setItem(CODES_KEY, codes);

    if (isSupabaseConfigured() && supabase) {
      const found = codes.find((c) => c.id === id);
      if (found) {
        syncToSupabase(
          supabase
            .from('license_codes')
            .update({
              is_active: found.isActive,
              max_uses: found.maxUses,
              notes: found.notes,
              tier: found.tier,
              used_count: found.usedCount,
              used_by_emails: found.usedByEmails,
            })
            .eq('id', id)
        );
      }
    }
  }

  deleteLicenseCode(id: string): void {
    this.setItem(CODES_KEY, this.getLicenseCodes().filter((c) => c.id !== id));
    if (isSupabaseConfigured() && supabase) {
      syncToSupabase(supabase.from('license_codes').delete().eq('id', id));
    }
  }

  redeemLicenseCode(codeStr: string, userEmail?: string): {
    success: boolean;
    tier?: UserTier;
    error?: string;
    isTeamCode?: boolean;
    remainingUses?: number;
    codeRecord?: LicenseCode;
  } {
    const cleanCode = codeStr.trim().toUpperCase();
    if (!cleanCode) {
      return { success: false, error: 'License key cannot be empty.' };
    }

    const codes = this.getLicenseCodes();
    let found = codes.find((c) => c.code.toUpperCase() === cleanCode);

    // Fallback support for master promo keys if not in database yet
    if (!found) {
      const FALLBACK_MASTER_KEYS = ['STRIX-PRO', 'STRIX-PRO-VIP', 'STRIX2026', 'PRO-PASS'];
      if (FALLBACK_MASTER_KEYS.includes(cleanCode) || cleanCode.startsWith('STRIX-PRO-') || cleanCode.startsWith('PRO-')) {
        found = {
          id: `lic_master_${Date.now()}`,
          code: cleanCode,
          tier: 'pro',
          maxUses: 9999,
          usedCount: 0,
          usedByEmails: [],
          customerName: 'Promotional Pass',
          isActive: true,
          createdAt: new Date().toISOString(),
        };
        codes.push(found);
      }
    }

    if (!found) {
      return { success: false, error: 'Invalid license key. Please check your activation code or contact support.' };
    }

    if (!found.isActive) {
      return { success: false, error: 'This license key has been deactivated or revoked.' };
    }

    if (found.expiresAt && new Date(found.expiresAt).getTime() < Date.now()) {
      return { success: false, error: 'This license key has expired.' };
    }

    if (found.usedCount >= found.maxUses) {
      return {
        success: false,
        error: found.maxUses === 1
          ? 'This single-use license key has already been redeemed.'
          : `All ${found.maxUses} seats on this team license code have already been claimed.`,
      };
    }

    // Check if user already claimed this specific team code
    const email = userEmail?.trim().toLowerCase() || '';
    if (email && found.usedByEmails && found.usedByEmails.map((e) => e.toLowerCase()).includes(email)) {
      return {
        success: true,
        tier: found.tier,
        isTeamCode: found.maxUses > 1,
        remainingUses: found.maxUses - found.usedCount,
        codeRecord: found,
      };
    }

    // Claim seat
    const updatedCount = found.usedCount + 1;
    const updatedEmails = email ? [...(found.usedByEmails || []), email] : (found.usedByEmails || []);
    const remaining = found.maxUses - updatedCount;

    this.updateLicenseCode(found.id, {
      usedCount: updatedCount,
      usedByEmails: updatedEmails,
    });

    return {
      success: true,
      tier: found.tier,
      isTeamCode: found.maxUses > 1,
      remainingUses: remaining,
      codeRecord: { ...found, usedCount: updatedCount, usedByEmails: updatedEmails },
    };
  }

  // --- Package Purchase Orders (CRM) ---
  getPackageOrders(): PackageOrder[] {
    return this.getItem<PackageOrder[]>(ORDERS_KEY, DEFAULT_PACKAGE_ORDERS);
  }

  savePackageOrder(order: Omit<PackageOrder, 'id' | 'createdAt' | 'status'>): PackageOrder {
    const orders = this.getPackageOrders();
    const newOrder: PackageOrder = {
      ...order,
      id: `ord_${Date.now()}`,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    orders.unshift(newOrder);
    this.setItem(ORDERS_KEY, orders);

    if (isSupabaseConfigured() && supabase) {
      syncToSupabase(
        supabase.from('package_orders').insert({
          id: newOrder.id,
          customer_name: newOrder.name,
          customer_email: newOrder.email,
          phone_or_whatsapp: newOrder.phoneOrWhatsapp || null,
          plan_id: newOrder.planId,
          plan_name: newOrder.planName,
          billing_interval: newOrder.interval,
          team_seats: newOrder.teamSeats || 1,
          price_formatted: newOrder.priceFormatted,
          notes: newOrder.notes || null,
          status: newOrder.status,
        })
      );
    }

    return newOrder;
  }

  updatePackageOrderStatus(id: string, status: PackageOrderStatus, issuedCode?: string): void {
    const orders = this.getPackageOrders().map((o) =>
      o.id === id ? { ...o, status, ...(issuedCode ? { issuedCode } : {}) } : o
    );
    this.setItem(ORDERS_KEY, orders);

    if (isSupabaseConfigured() && supabase) {
      syncToSupabase(
        supabase
          .from('package_orders')
          .update({
            status,
            ...(issuedCode ? { issued_code: issuedCode } : {}),
            updated_at: new Date().toISOString(),
          })
          .eq('id', id)
      );
    }
  }

  deletePackageOrder(id: string): void {
    this.setItem(ORDERS_KEY, this.getPackageOrders().filter((o) => o.id !== id));
    if (isSupabaseConfigured() && supabase) {
      syncToSupabase(supabase.from('package_orders').delete().eq('id', id));
    }
  }
}

export const db = new DatabaseService();
