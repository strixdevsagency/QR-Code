/**
 * Application URL & Canonical Domain Helpers
 * Prevents localhost URLs from leaking into production QR codes and dynamic redirects.
 */

export function getBaseAppUrl(): string {
  // 1. Explicit production or custom environment variable
  if (process.env.NEXT_PUBLIC_APP_URL && process.env.NEXT_PUBLIC_APP_URL.trim() !== '') {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/+$/, '');
  }

  // 2. Vercel deployment URL
  if (process.env.NEXT_PUBLIC_VERCEL_URL) {
    return `https://${process.env.NEXT_PUBLIC_VERCEL_URL.replace(/\/+$/, '')}`;
  }

  // 3. Fallback to production canonical domain
  return 'https://qr.strixdevs.com';
}

/**
 * Returns the full public redirect URL for a dynamic QR code
 */
export function getDynamicQRUrl(codeId: string): string {
  const base = getBaseAppUrl();
  return `${base}/r/${codeId}`;
}
