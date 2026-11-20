export interface ParsedWiFi {
  type: 'wifi';
  ssid: string;
  password?: string;
  encryption: string;
  hidden: boolean;
}

export interface ParsedVCard {
  type: 'vcard';
  name: string;
  phone?: string;
  email?: string;
  company?: string;
  title?: string;
  website?: string;
  raw: string;
}

export interface ParsedWhatsApp {
  type: 'whatsapp';
  phone: string;
  message?: string;
}

export interface ParsedEmail {
  type: 'email';
  email: string;
  subject?: string;
  body?: string;
}

export interface ParsedCrypto {
  type: 'crypto';
  currency: 'BTC' | 'ETH' | 'SOL';
  address: string;
  amount?: string;
}

export interface ParsedURL {
  type: 'url';
  url: string;
  hostname: string;
  protocol: string;
  safety: {
    level: 'safe' | 'caution' | 'warning';
    reasons: string[];
  };
}

export interface ParsedText {
  type: 'text';
  text: string;
}

export type ParsedPayload =
  | ParsedWiFi
  | ParsedVCard
  | ParsedWhatsApp
  | ParsedEmail
  | ParsedCrypto
  | ParsedURL
  | ParsedText;

export function inspectUrlSafety(urlString: string): { level: 'safe' | 'caution' | 'warning'; reasons: string[] } {
  const reasons: string[] = [];
  let level: 'safe' | 'caution' | 'warning' = 'safe';

  try {
    const parsed = new URL(urlString);

    // Check for IP address host
    const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (ipv4Regex.test(parsed.hostname)) {
      reasons.push('Uses a numeric IP address instead of a domain name (high risk of phishing)');
      level = 'warning';
    }

    // Check for unencrypted HTTP
    if (parsed.protocol === 'http:') {
      reasons.push('Unencrypted connection (HTTP). Never enter passwords or sensitive info.');
      if (level !== 'warning') level = 'caution';
    }

    // Check for embedded credentials or userinfo
    if (parsed.username || parsed.password) {
      reasons.push('Contains embedded credentials (@-symbol URL spoofing attempt)');
      level = 'warning';
    }

    // Check for punycode (internationalized look-alike domain)
    if (parsed.hostname.startsWith('xn--') || parsed.hostname.includes('.xn--')) {
      reasons.push('Punycode domain detected (potential look-alike / typosquatting character)');
      level = 'warning';
    }

    // Known common shorteners
    const shorteners = ['bit.ly', 'tinyurl.com', 't.co', 'goo.gl', 'ow.ly', 'is.gd', 'buff.ly', 'cutt.ly'];
    if (shorteners.some(s => parsed.hostname.toLowerCase().includes(s))) {
      reasons.push('URL shortener detected. The actual final destination is concealed.');
      if (level !== 'warning') level = 'caution';
    }

    // Suspicious TLDs often abused in quishing
    const suspiciousTlds = ['.top', '.xyz', '.work', '.click', '.loan', '.fit', '.gq', '.cf', '.tk', '.ml'];
    if (suspiciousTlds.some(tld => parsed.hostname.toLowerCase().endsWith(tld))) {
      reasons.push('Domain uses a high-risk top-level domain frequently associated with spam.');
      if (level !== 'warning') level = 'caution';
    }

  } catch {
    reasons.push('Malformed URL syntax.');
    level = 'caution';
  }

  return { level, reasons };
}

export function parseQRPayload(raw: string): ParsedPayload {
  const trimmed = raw.trim();

  // 1. WiFi format: WIFI:S:MySSID;T:WPA;P:MyPass;H:false;;
  if (trimmed.startsWith('WIFI:')) {
    const ssidMatch = trimmed.match(/S:([^;]*)/);
    const passMatch = trimmed.match(/P:([^;]*)/);
    const typeMatch = trimmed.match(/T:([^;]*)/);
    const hiddenMatch = trimmed.match(/H:([^;]*)/);

    return {
      type: 'wifi',
      ssid: ssidMatch ? ssidMatch[1] : 'Unknown Network',
      password: passMatch ? passMatch[1] : undefined,
      encryption: typeMatch ? typeMatch[1] : 'WPA',
      hidden: hiddenMatch ? hiddenMatch[1].toLowerCase() === 'true' : false,
    };
  }

  // 2. vCard format: BEGIN:VCARD ... END:VCARD
  if (trimmed.toUpperCase().includes('BEGIN:VCARD')) {
    const fnMatch = trimmed.match(/FN:(.*?)(\r?\n|$)/i);
    const nMatch = trimmed.match(/N:(.*?)(\r?\n|$)/i);
    const telMatch = trimmed.match(/TEL.*?:(.*?)(\r?\n|$)/i);
    const emailMatch = trimmed.match(/EMAIL.*?:(.*?)(\r?\n|$)/i);
    const orgMatch = trimmed.match(/ORG:(.*?)(\r?\n|$)/i);
    const titleMatch = trimmed.match(/TITLE:(.*?)(\r?\n|$)/i);
    const urlMatch = trimmed.match(/URL.*?:(.*?)(\r?\n|$)/i);

    let name = fnMatch ? fnMatch[1].trim() : '';
    if (!name && nMatch) {
      const parts = nMatch[1].split(';').map(p => p.trim()).filter(Boolean);
      name = parts.reverse().join(' ');
    }

    return {
      type: 'vcard',
      name: name || 'Contact Card',
      phone: telMatch ? telMatch[1].trim() : undefined,
      email: emailMatch ? emailMatch[1].trim() : undefined,
      company: orgMatch ? orgMatch[1].trim() : undefined,
      title: titleMatch ? titleMatch[1].trim() : undefined,
      website: urlMatch ? urlMatch[1].trim() : undefined,
      raw: trimmed,
    };
  }

  // 3. WhatsApp format
  if (trimmed.startsWith('https://wa.me/') || trimmed.startsWith('https://api.whatsapp.com/send') || trimmed.startsWith('whatsapp://')) {
    try {
      let phone = '';
      let message = '';
      if (trimmed.startsWith('https://wa.me/')) {
        const urlObj = new URL(trimmed);
        phone = urlObj.pathname.replace('/', '');
        message = urlObj.searchParams.get('text') || '';
      } else {
        const urlObj = new URL(trimmed.replace('whatsapp://', 'https://dummy.com/'));
        phone = urlObj.searchParams.get('phone') || '';
        message = urlObj.searchParams.get('text') || '';
      }
      return {
        type: 'whatsapp',
        phone: phone || 'Unknown',
        message: message || undefined,
      };
    } catch {
      // Fallback
    }
  }

  // 4. Email / mailto:
  if (trimmed.startsWith('mailto:')) {
    try {
      const mailUrl = new URL(trimmed);
      const email = mailUrl.pathname;
      const subject = mailUrl.searchParams.get('subject') || undefined;
      const body = mailUrl.searchParams.get('body') || undefined;
      return {
        type: 'email',
        email,
        subject,
        body,
      };
    } catch {
      const cleaned = trimmed.replace('mailto:', '');
      return { type: 'email', email: cleaned };
    }
  }

  // 5. Crypto addresses
  if (trimmed.startsWith('bitcoin:') || trimmed.startsWith('ethereum:') || trimmed.startsWith('solana:')) {
    const parts = trimmed.split(':');
    const currencyStr = parts[0].toLowerCase();
    const rest = parts.slice(1).join(':');
    const address = rest.split('?')[0];
    const amountMatch = rest.match(/amount=([^&]+)/);

    let currency: 'BTC' | 'ETH' | 'SOL' = 'BTC';
    if (currencyStr === 'ethereum') currency = 'ETH';
    if (currencyStr === 'solana') currency = 'SOL';

    return {
      type: 'crypto',
      currency,
      address,
      amount: amountMatch ? amountMatch[1] : undefined,
    };
  }

  // 6. Web URL
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    try {
      const parsed = new URL(trimmed);
      const safety = inspectUrlSafety(trimmed);
      return {
        type: 'url',
        url: trimmed,
        hostname: parsed.hostname,
        protocol: parsed.protocol,
        safety,
      };
    } catch {
      // Invalid URL syntax
    }
  }

  // 7. Plain text
  return {
    type: 'text',
    text: trimmed,
  };
}

export function downloadVCard(vcardText: string, filename = 'contact.vcf') {
  const blob = new Blob([vcardText], { type: 'text/vcard;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
