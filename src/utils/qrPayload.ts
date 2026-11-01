import type { WifiData, VCardData, WhatsappData, CryptoData, QRType } from '../types';

export function generatePayload(
  type: QRType,
  data: {
    url?: string;
    text?: string;
    wifi?: WifiData;
    vcard?: VCardData;
    whatsapp?: WhatsappData;
    sms?: { phone: string; message: string };
    email?: { email: string; subject: string; body: string };
    crypto?: CryptoData;
  }
): string {
  switch (type) {
    case 'url':
      return data.url ? (data.url.startsWith('http://') || data.url.startsWith('https://') ? data.url : `https://${data.url}`) : 'https://strixdevs.com';

    case 'wifi':
      if (!data.wifi) return 'WIFI:S:StrixDevs-Guest;T:WPA;P:Welcome2026;;';
      const enc = data.wifi.encryption || 'WPA';
      const hidden = data.wifi.hidden ? 'H:true;' : '';
      return `WIFI:S:${data.wifi.ssid || ''};T:${enc};P:${data.wifi.password || ''};${hidden};`;

    case 'vcard':
      if (!data.vcard) return 'BEGIN:VCARD\nVERSION:3.0\nFN:StrixDevs Client\nEND:VCARD';
      const vc = data.vcard;
      return [
        'BEGIN:VCARD',
        'VERSION:3.0',
        `N:${vc.lastName || ''};${vc.firstName || ''};;;`,
        `FN:${[vc.firstName, vc.lastName].filter(Boolean).join(' ')}`,
        vc.company ? `ORG:${vc.company}` : '',
        vc.title ? `TITLE:${vc.title}` : '',
        vc.phone ? `TEL;TYPE=CELL:${vc.phone}` : '',
        vc.email ? `EMAIL:${vc.email}` : '',
        vc.website ? `URL:${vc.website.startsWith('http') ? vc.website : `https://${vc.website}`}` : '',
        vc.city || vc.country ? `ADR:;;${vc.street || ''};${vc.city || ''};;;${vc.country || ''}` : '',
        'END:VCARD',
      ]
        .filter(Boolean)
        .join('\n');

    case 'whatsapp':
      if (!data.whatsapp) return 'https://wa.me/';
      const cleanPhone = data.whatsapp.phone.replace(/[^0-9]/g, '');
      const encodedMsg = encodeURIComponent(data.whatsapp.message || '');
      return `https://wa.me/${cleanPhone}${encodedMsg ? `?text=${encodedMsg}` : ''}`;

    case 'sms':
      if (!data.sms) return 'sms:';
      return `sms:${data.sms.phone || ''}?body=${encodeURIComponent(data.sms.message || '')}`;

    case 'email':
      if (!data.email) return 'mailto:';
      return `mailto:${data.email.email || ''}?subject=${encodeURIComponent(data.email.subject || '')}&body=${encodeURIComponent(data.email.body || '')}`;

    case 'crypto':
      if (!data.crypto) return '';
      const c = data.crypto;
      if (c.currency === 'BTC') {
        return `bitcoin:${c.address}${c.amount ? `?amount=${c.amount}` : ''}`;
      } else if (c.currency === 'ETH') {
        return `ethereum:${c.address}${c.amount ? `?value=${c.amount}` : ''}`;
      } else {
        return `solana:${c.address}${c.amount ? `?amount=${c.amount}` : ''}`;
      }

    case 'text':
    default:
      return data.text || 'Created with Strix QR (strixdevs.com)';
  }
}

export function getLuminance(hex: string): number {
  const cleanHex = hex.replace('#', '');
  const r = parseInt(cleanHex.substring(0, 2), 16) / 255;
  const g = parseInt(cleanHex.substring(2, 4), 16) / 255;
  const b = parseInt(cleanHex.substring(4, 6), 16) / 255;

  const a = [r, g, b].map((v) => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)));
  return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
}

export function getContrastRatio(hex1: string, hex2: string): number {
  try {
    const l1 = getLuminance(hex1);
    const l2 = getLuminance(hex2);
    const brightest = Math.max(l1, l2);
    const darkest = Math.min(l1, l2);
    return (brightest + 0.05) / (darkest + 0.05);
  } catch {
    return 7;
  }
}
