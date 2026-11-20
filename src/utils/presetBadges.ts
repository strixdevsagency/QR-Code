import type { PresetLogoId } from '../types';

/**
 * Generates an SVG Data URL for a preset brand badge, dynamically color-matched
 * to the QR code's matrix dots color and canvas background color.
 */
export function generatePresetLogoSvg(
  presetId: PresetLogoId,
  dotsColor: string = '#0f172a',
  backgroundColor: string = '#ffffff',
  isGradient: boolean = false,
  dotsColorEnd?: string,
  customBadgeColor?: string
): string {
  // Ensure hex values are properly encoded for SVG data URLs
  const cleanDots = dotsColor.startsWith('#') ? dotsColor : `#${dotsColor}`;
  const cleanBg = backgroundColor.startsWith('#') ? backgroundColor : `#${backgroundColor}`;
  const encDots = encodeURIComponent(cleanDots);
  const encBg = encodeURIComponent(cleanBg);

  let fillAttr = encDots;
  let gradDef = '';

  if (customBadgeColor) {
    const cleanBadge = customBadgeColor.startsWith('#') ? customBadgeColor : `#${customBadgeColor}`;
    fillAttr = encodeURIComponent(cleanBadge);
  } else if (isGradient && dotsColorEnd) {
    const encGradEnd = encodeURIComponent(dotsColorEnd.startsWith('#') ? dotsColorEnd : `#${dotsColorEnd}`);
    fillAttr = 'url(%23presetGrad)';
    gradDef = `<defs><linearGradient id="presetGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="${encDots}"/><stop offset="100%" stop-color="${encGradEnd}"/></linearGradient></defs>`;
  }

  let innerContent = '';

  switch (presetId) {
    case 'strix':
      innerContent = `<text x="32" y="38" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="900" font-size="14" fill="${encBg}" letter-spacing="1">STRIX</text>`;
      break;

    case 'wifi':
      innerContent = `<path d="M16 26a24 24 0 0 1 32 0M21 33a16 16 0 0 1 22 0M26 40a8 8 0 0 1 12 0M32 48h.01" fill="none" stroke="${encBg}" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/>`;
      break;

    case 'whatsapp':
      innerContent = `<path d="M32 14c-9.94 0-18 8.06-18 18 0 3.53 1.02 6.82 2.78 9.61L14 50l8.66-2.69C25.33 49.03 28.56 50 32 50c9.94 0 18-8.06 18-18s-8.06-18-18-18zm9.35 25.17c-.4.99-2.31 1.89-3.21 1.98-.84.09-1.92.14-5.54-1.19-4.36-1.78-7.16-6.26-7.38-6.56-.22-.3-1.76-2.34-1.76-4.46s1.1-3.16 1.5-3.6c.4-.42.86-.54 1.16-.54.28 0 .58.02.84.02.28 0 .66-.1 1.02.78.4 1 1.36 3.32 1.48 3.56.12.24.2.52.04.84-.16.3-.24.5-.48.78-.24.28-.5.62-.72.84-.24.24-.48.5-.2.98.28.48 1.24 2.04 2.66 3.3 1.82 1.62 3.36 2.12 3.84 2.36.48.24.76.2 1.04-.12.28-.34 1.2-1.4 1.52-1.88.32-.48.64-.4 1.08-.24.44.16 2.8 1.32 3.28 1.56.48.24.8.36.92.56.12.2.12 1.18-.28 2.29z" fill="${encBg}"/>`;
      break;

    case 'instagram':
      innerContent = `<path fill="${encBg}" d="M32 16c4.9 0 5.5 0 7.4.1 1.8.1 2.8.4 3.4.6.8.3 1.4.7 2 1.3.6.6 1 1.2 1.3 2 .2.6.5 1.6.6 3.4.1 1.9.1 2.5.1 7.4s0 5.5-.1 7.4c-.1 1.8-.4 2.8-.6 3.4-.3.8-.7 1.4-1.3 2-.6.6-1.2 1-2 1.3-.6.2-1.6.5-3.4.6-1.9.1-2.5.1-7.4.1s-5.5 0-7.4-.1c-1.8-.1-2.8-.4-3.4-.6-.8-.3-1.4-.7-2-1.3-.6-.6-1-1.2-1.3-2-.2-.6-.5-1.6-.6-3.4-.1-1.9-.1-2.5-.1-7.4s0-5.5.1-7.4c.1-1.8.4-2.8.6-3.4.3-.8.7-1.4 1.3-2 .6-.6 1.2-1 2-1.3.6-.2 1.6-.5 3.4-.6 1.9-.1 2.5-.1 7.4-.1zm0-3.6c-5 0-5.6 0-7.6.1-2 .1-3.3.4-4.5.9-1.2.5-2.2 1.1-3.2 2.1-1 1-1.6 2-2.1 3.2-.5 1.2-.8 2.5-.9 4.5-.1 2-.1 2.6-.1 7.6s0 5.6.1 7.6c.1 2 .4 3.3.9 4.5.5 1.2 1.1 2.2 2.1 3.2 1 1 2 1.6 3.2 2.1 1.2.5 2.5.8 4.5.9 2 .1 2.6.1 7.6.1s5.6 0 7.6-.1c2-.1 3.3-.4 4.5-.9 1.2-.5 2.2-1.1 3.2-2.1 1-1 1.6-2 2.1-3.2.5-1.2.8-2.5.9-4.5.1-2 .1-2.6.1-7.6s0-5.6-.1-7.6c-.1-2-.4-3.3-.9-4.5-.5-1.2-1.1-2.2-2.1-3.2-1-1-2-1.6-3.2-2.1-1.2-.5-2.5-.8-4.5-.9-2-.1-2.6-.1-7.6-.1zm0 8.7a8.9 8.9 0 1 0 0 17.8 8.9 8.9 0 0 0 0-17.8zm0 14.6a5.7 5.7 0 1 1 0-11.4 5.7 5.7 0 0 1 0 11.4zm9.3-15.4a2.1 2.1 0 1 1-4.2 0 2.1 2.1 0 0 1 4.2 0z"/>`;
      break;

    case 'maps':
      innerContent = `<path d="M32 15c-6.6 0-12 5.4-12 12 0 9 12 21 12 21s12-12 12-21c0-6.6-5.4-12-12-12zm0 16.5c-2.5 0-4.5-2-4.5-4.5s2-4.5 4.5-4.5 4.5 2 4.5 4.5-2 4.5-4.5 4.5z" fill="${encBg}"/>`;
      break;

    case 'verified':
      innerContent = `<path d="M32 14s14 5.25 14 15.75c0 10.5-14 20.25-14 20.25S18 40.25 18 29.75C18 19.25 32 14 32 14z" fill="none" stroke="${encBg}" stroke-width="3.5" stroke-linejoin="round"/><path d="m26 31 4 4 8-8" fill="none" stroke="${encBg}" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>`;
      break;

    case 'review':
      innerContent = `<polygon points="32 13 37.5 24.5 50 26.3 41 35.1 43.1 47.5 32 41.6 20.9 47.5 23 35.1 14 26.3 26.5 24.5 32 13" fill="${encBg}"/>`;
      break;
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">${gradDef}<rect width="64" height="64" rx="16" fill="${fillAttr}"/>${innerContent}</svg>`;

  return `data:image/svg+xml;utf8,${svg}`;
}
