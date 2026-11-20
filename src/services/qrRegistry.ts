/**
 * Strix QR — Production Dynamic QR Code Cloud Registry
 * Bridges server memory and Supabase PostgreSQL for global QR resolution.
 */

import { SavedQRCode } from '../types';
import { supabase, isSupabaseConfigured } from './supabase';
import { validateRedirectUrl } from '../utils/security';

// Global server-side registry (persists across API requests in Node runtime)
declare global {
  // eslint-disable-next-line no-var
  var __strix_qr_registry__: Map<string, SavedQRCode> | undefined;
}

const registry: Map<string, SavedQRCode> =
  global.__strix_qr_registry__ || new Map<string, SavedQRCode>();

if (process.env.NODE_ENV !== 'production') {
  global.__strix_qr_registry__ = registry;
}

export interface ResolveOutcome {
  status: 'success' | 'burned' | 'expired' | 'revoked' | 'not_found' | 'pin_required' | 'blocked';
  record?: SavedQRCode;
  destination?: string;
  destinationType?: SavedQRCode['qrType'];
  burnTimestamp?: string;
  error?: string;
}

/**
 * Register or update a QR code in the cloud registry
 */
export async function registerQRCode(qr: SavedQRCode): Promise<void> {
  // 1. Store in server runtime registry
  registry.set(qr.id, qr);

  // 2. Persist to Supabase if configured and table exists
  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase.from('qr_codes').upsert(
        {
          id: qr.id,
          user_id: qr.userId || null,
          title: qr.title,
          qr_type: qr.qrType,
          payload: qr.payload,
          design: qr.design,
          is_dynamic: qr.isDynamic,
          dynamic_config: qr.dynamicConfig,
          download_count: qr.downloadCount || 0,
          created_at: qr.createdAt,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' }
      );
    } catch {
      // Table may be pending migration; memory registry handles active sessions
    }
  }
}

/**
 * Fetch a QR code by its unique ID
 */
export async function fetchQRCode(codeId: string): Promise<SavedQRCode | null> {
  // 1. Check server runtime registry first
  if (registry.has(codeId)) {
    return registry.get(codeId)!;
  }

  // 2. Query Supabase if configured
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('qr_codes')
        .select('*')
        .eq('id', codeId)
        .maybeSingle();

      if (!error && data) {
        const qr: SavedQRCode = {
          id: data.id,
          userId: data.user_id,
          title: data.title,
          qrType: data.qr_type,
          payload: data.payload,
          design: data.design,
          downloadCount: data.download_count || 0,
          createdAt: data.created_at,
          isDynamic: Boolean(data.is_dynamic),
          dynamicConfig: data.dynamic_config,
        };
        registry.set(qr.id, qr);
        return qr;
      }
    } catch {
      // Query failed or table not found
    }
  }

  return null;
}

/**
 * Resolve a dynamic QR code scan with safety and expiry verification
 */
export async function resolveDynamicQR(
  codeId: string,
  options?: { pin?: string; userAgent?: string }
): Promise<ResolveOutcome> {
  const qr = await fetchQRCode(codeId);

  if (!qr) {
    return { status: 'not_found' };
  }

  // Static codes resolve immediately
  if (!qr.isDynamic || !qr.dynamicConfig) {
    return {
      status: 'success',
      record: qr,
      destination: qr.payload,
      destinationType: qr.qrType,
    };
  }

  const cfg = qr.dynamicConfig;

  // 1. Revocation check
  if (cfg.isRevoked) {
    return { status: 'revoked', record: qr };
  }

  // 2. One-time code burned check
  if (cfg.isBurned || (cfg.mode === 'one_time' && cfg.currentScans >= (cfg.maxScans || 1))) {
    return {
      status: 'burned',
      record: qr,
      burnTimestamp: cfg.burnedAt || qr.createdAt,
    };
  }

  // 3. Time-limited expiry check
  if (cfg.mode === 'time_limited' && cfg.expiresAt) {
    if (Date.now() > new Date(cfg.expiresAt).getTime()) {
      return { status: 'expired', record: qr };
    }
  }

  // 4. PIN Protection verification
  if (cfg.pinProtected && cfg.pinCode) {
    if (!options?.pin || options.pin !== cfg.pinCode) {
      return { status: 'pin_required', record: qr };
    }
  }

  // 5. Smart routing (iOS vs Android vs time-based)
  let destination = cfg.destinationPayload;
  if (cfg.smartRouting?.enabled) {
    const ua = options?.userAgent || '';
    const isIOS = /iPhone|iPad|iPod/i.test(ua);
    const isAndroid = /Android/i.test(ua);

    if (isIOS && cfg.smartRouting.iosUrl) {
      destination = cfg.smartRouting.iosUrl;
    } else if (isAndroid && cfg.smartRouting.androidUrl) {
      destination = cfg.smartRouting.androidUrl;
    } else if (cfg.smartRouting.timeScheduled && cfg.smartRouting.scheduleUrl) {
      const now = new Date();
      const currentHour = now.getHours();
      const startHour = cfg.smartRouting.timeStart ? parseInt(cfg.smartRouting.timeStart.split(':')[0], 10) : 0;
      const endHour = cfg.smartRouting.timeEnd ? parseInt(cfg.smartRouting.timeEnd.split(':')[0], 10) : 24;
      if (currentHour >= startHour && currentHour < endHour) {
        destination = cfg.smartRouting.scheduleUrl;
      }
    }
  }

  // 6. Security & Safe URL check (SSRF / dangerous scheme defense)
  if (cfg.destinationType === 'url') {
    const safety = validateRedirectUrl(destination);
    if (!safety.safe) {
      return {
        status: 'blocked',
        error: safety.reason || 'Destination URL failed security inspection.',
      };
    }
  }

  // 7. Atomic scan counter increment
  const newScans = (cfg.currentScans || 0) + 1;
  const shouldBurn = cfg.mode === 'one_time' && newScans >= (cfg.maxScans || 1);

  const updatedConfig = {
    ...cfg,
    currentScans: newScans,
    isBurned: shouldBurn,
    burnedAt: shouldBurn ? new Date().toISOString() : cfg.burnedAt,
  };

  const updatedQR: SavedQRCode = {
    ...qr,
    dynamicConfig: updatedConfig,
  };

  await registerQRCode(updatedQR);

  return {
    status: 'success',
    record: updatedQR,
    destination,
    destinationType: cfg.destinationType,
  };
}
