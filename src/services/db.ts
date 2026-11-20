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
import { supabase, isSupabaseConfigured } from './supabase';

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

function syncToSupabase(promiseLike: any): void {
  if (promiseLike) {
    Promise.resolve(promiseLike).catch(() => {});
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
