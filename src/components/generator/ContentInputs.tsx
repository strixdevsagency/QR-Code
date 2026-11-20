import React from 'react';
import type { QRType, WifiData, VCardData, WhatsappData, CryptoData } from '../../types';

interface ContentInputsProps {
  payloadType: QRType;
  urlValue: string;
  setUrlValue: (val: string) => void;
  wifiData: WifiData;
  setWifiData: React.Dispatch<React.SetStateAction<WifiData>>;
  vcardData: VCardData;
  setVcardData: React.Dispatch<React.SetStateAction<VCardData>>;
  whatsappData: WhatsappData;
  setWhatsappData: React.Dispatch<React.SetStateAction<WhatsappData>>;
  textValue: string;
  setTextValue: (val: string) => void;
  smsData: { phone: string; message: string };
  setSmsData: React.Dispatch<React.SetStateAction<{ phone: string; message: string }>>;
  emailData: { email: string; subject: string; body: string };
  setEmailData: React.Dispatch<React.SetStateAction<{ email: string; subject: string; body: string }>>;
  cryptoData: CryptoData;
  setCryptoData: React.Dispatch<React.SetStateAction<CryptoData>>;
}

export const ContentInputs: React.FC<ContentInputsProps> = ({
  payloadType,
  urlValue,
  setUrlValue,
  wifiData,
  setWifiData,
  vcardData,
  setVcardData,
  whatsappData,
  setWhatsappData,
  textValue,
  setTextValue,
  smsData,
  setSmsData,
  emailData,
  setEmailData,
  cryptoData,
  setCryptoData,
}) => {
  return (
    <div className="space-y-4 pt-1">
      {/* 1. URL */}
      {payloadType === 'url' && (
        <div>
          <label className="block text-xs font-medium text-zinc-300 mb-1.5">
            Destination Website URL
          </label>
          <div className="relative">
            <input
              type="url"
              value={urlValue}
              onChange={(e) => setUrlValue(e.target.value)}
              placeholder="https://example.com"
              className="w-full pl-3.5 pr-28 py-2.5 rounded-xl bg-zinc-950/70 border border-white/[0.08] text-zinc-100 text-xs sm:text-sm focus:outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400/30 transition placeholder:text-zinc-500"
            />
            <span className="absolute right-3 top-2.5 text-[11px] text-emerald-400 font-mono flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              Direct URL
            </span>
          </div>
        </div>
      )}

      {/* 2. WiFi */}
      {payloadType === 'wifi' && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">Network Name (SSID)</label>
              <input
                type="text"
                value={wifiData.ssid}
                onChange={(e) => setWifiData({ ...wifiData, ssid: e.target.value })}
                placeholder="Office-Guest"
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950/70 border border-white/[0.08] text-zinc-100 text-xs sm:text-sm focus:outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400/30 transition placeholder:text-zinc-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">Wi-Fi Password</label>
              <input
                type="text"
                value={wifiData.password}
                onChange={(e) => setWifiData({ ...wifiData, password: e.target.value })}
                placeholder="Passphrase"
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950/70 border border-white/[0.08] text-zinc-100 text-xs sm:text-sm focus:outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400/30 transition placeholder:text-zinc-500"
              />
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs text-zinc-400">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="radio"
                name="enc"
                checked={wifiData.encryption === 'WPA'}
                onChange={() => setWifiData({ ...wifiData, encryption: 'WPA' })}
                className="text-white cursor-pointer accent-zinc-200"
              />
              <span>WPA/WPA2/WPA3</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="radio"
                name="enc"
                checked={wifiData.encryption === 'nopass'}
                onChange={() => setWifiData({ ...wifiData, encryption: 'nopass' })}
                className="text-white cursor-pointer accent-zinc-200"
              />
              <span>Open Network</span>
            </label>
          </div>
        </div>
      )}

      {/* 3. vCard */}
      {payloadType === 'vcard' && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="First Name"
              value={vcardData.firstName}
              onChange={(e) => setVcardData({ ...vcardData, firstName: e.target.value })}
              className="px-3.5 py-2.5 rounded-xl bg-zinc-950/70 border border-white/[0.08] text-zinc-100 text-xs focus:outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400/30 transition placeholder:text-zinc-500"
            />
            <input
              type="text"
              placeholder="Last Name"
              value={vcardData.lastName}
              onChange={(e) => setVcardData({ ...vcardData, lastName: e.target.value })}
              className="px-3.5 py-2.5 rounded-xl bg-zinc-950/70 border border-white/[0.08] text-zinc-100 text-xs focus:outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400/30 transition placeholder:text-zinc-500"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="tel"
              placeholder="Phone (+1 312 555-0100)"
              value={vcardData.phone}
              onChange={(e) => setVcardData({ ...vcardData, phone: e.target.value })}
              className="px-3.5 py-2.5 rounded-xl bg-zinc-950/70 border border-white/[0.08] text-zinc-100 text-xs focus:outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400/30 transition placeholder:text-zinc-500"
            />
            <input
              type="email"
              placeholder="Email (contact@example.com)"
              value={vcardData.email}
              onChange={(e) => setVcardData({ ...vcardData, email: e.target.value })}
              className="px-3.5 py-2.5 rounded-xl bg-zinc-950/70 border border-white/[0.08] text-zinc-100 text-xs focus:outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400/30 transition placeholder:text-zinc-500"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Company"
              value={vcardData.company}
              onChange={(e) => setVcardData({ ...vcardData, company: e.target.value })}
              className="px-3.5 py-2.5 rounded-xl bg-zinc-950/70 border border-white/[0.08] text-zinc-100 text-xs focus:outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400/30 transition placeholder:text-zinc-500"
            />
            <input
              type="url"
              placeholder="Website (https://...)"
              value={vcardData.website}
              onChange={(e) => setVcardData({ ...vcardData, website: e.target.value })}
              className="px-3.5 py-2.5 rounded-xl bg-zinc-950/70 border border-white/[0.08] text-zinc-100 text-xs focus:outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400/30 transition placeholder:text-zinc-500"
            />
          </div>
        </div>
      )}

      {/* 4. WhatsApp */}
      {payloadType === 'whatsapp' && (
        <div className="space-y-3">
          <input
            type="tel"
            placeholder="WhatsApp Phone Number with Country Code (e.g. 13125550144)"
            value={whatsappData.phone}
            onChange={(e) => setWhatsappData({ ...whatsappData, phone: e.target.value })}
            className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950/70 border border-white/[0.08] text-zinc-100 text-xs sm:text-sm focus:outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400/30 transition placeholder:text-zinc-500"
          />
          <textarea
            rows={2}
            placeholder="Pre-filled greeting message"
            value={whatsappData.message}
            onChange={(e) => setWhatsappData({ ...whatsappData, message: e.target.value })}
            className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950/70 border border-white/[0.08] text-zinc-100 text-xs focus:outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400/30 transition placeholder:text-zinc-500"
          />
        </div>
      )}

      {/* 5. SMS Message */}
      {payloadType === 'sms' && (
        <div className="space-y-3">
          <input
            type="tel"
            placeholder="Recipient Mobile Number (e.g. +1 312 555-0100)"
            value={smsData.phone}
            onChange={(e) => setSmsData({ ...smsData, phone: e.target.value })}
            className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950/70 border border-white/[0.08] text-zinc-100 text-xs sm:text-sm focus:outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400/30 transition placeholder:text-zinc-500"
          />
          <textarea
            rows={2}
            placeholder="Pre-filled SMS text message"
            value={smsData.message}
            onChange={(e) => setSmsData({ ...smsData, message: e.target.value })}
            className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950/70 border border-white/[0.08] text-zinc-100 text-xs focus:outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400/30 transition placeholder:text-zinc-500"
          />
        </div>
      )}

      {/* 5. Email */}
      {payloadType === 'email' && (
        <div className="space-y-3">
          <input
            type="email"
            placeholder="Recipient Email (contact@example.com)"
            value={emailData.email}
            onChange={(e) => setEmailData({ ...emailData, email: e.target.value })}
            className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950/70 border border-white/[0.08] text-zinc-100 text-xs sm:text-sm focus:outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400/30 transition placeholder:text-zinc-500"
          />
          <input
            type="text"
            placeholder="Subject Line"
            value={emailData.subject}
            onChange={(e) => setEmailData({ ...emailData, subject: e.target.value })}
            className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950/70 border border-white/[0.08] text-zinc-100 text-xs focus:outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400/30 transition placeholder:text-zinc-500"
          />
        </div>
      )}

      {/* 6. Crypto */}
      {payloadType === 'crypto' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <select
            value={cryptoData.currency}
            onChange={(e) => setCryptoData({ ...cryptoData, currency: e.target.value as any })}
            className="px-3.5 py-2.5 rounded-xl bg-zinc-950/70 border border-white/[0.08] text-zinc-100 text-xs focus:outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400/30 transition cursor-pointer"
          >
            <option value="BTC" className="bg-zinc-900 text-white">Bitcoin (BTC)</option>
            <option value="ETH" className="bg-zinc-900 text-white">Ethereum (ETH)</option>
            <option value="SOL" className="bg-zinc-900 text-white">Solana (SOL)</option>
          </select>
          <input
            type="text"
            placeholder="Wallet Public Address"
            value={cryptoData.address}
            onChange={(e) => setCryptoData({ ...cryptoData, address: e.target.value })}
            className="px-3.5 py-2.5 rounded-xl bg-zinc-950/70 border border-white/[0.08] text-zinc-100 text-xs font-mono focus:outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400/30 transition placeholder:text-zinc-500"
          />
        </div>
      )}

      {/* 7. Text */}
      {payloadType === 'text' && (
        <textarea
          rows={3}
          placeholder="Enter plain text, verification token, serial code, or note..."
          value={textValue}
          onChange={(e) => setTextValue(e.target.value)}
          className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950/70 border border-white/[0.08] text-zinc-100 text-xs sm:text-sm focus:outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400/30 transition placeholder:text-zinc-500"
        />
      )}
    </div>
  );
};
