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
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Website URL Destination
          </label>
          <div className="relative">
            <input
              type="url"
              value={urlValue}
              onChange={(e) => setUrlValue(e.target.value)}
              placeholder="https://strixdevs.com"
              className="w-full pl-3.5 pr-20 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs sm:text-sm focus:outline-none focus:border-indigo-500"
            />
            <span className="absolute right-3 top-2.5 text-[11px] text-emerald-400 font-mono">
              HTTPS Direct
            </span>
          </div>
        </div>
      )}

      {/* 2. WiFi */}
      {payloadType === 'wifi' && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Network SSID (Name)</label>
              <input
                type="text"
                value={wifiData.ssid}
                onChange={(e) => setWifiData({ ...wifiData, ssid: e.target.value })}
                placeholder="Cafe-Guest"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs sm:text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Wi-Fi Password</label>
              <input
                type="text"
                value={wifiData.password}
                onChange={(e) => setWifiData({ ...wifiData, password: e.target.value })}
                placeholder="Passphrase"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs sm:text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs text-slate-400">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="radio"
                name="enc"
                checked={wifiData.encryption === 'WPA'}
                onChange={() => setWifiData({ ...wifiData, encryption: 'WPA' })}
                className="text-indigo-600 cursor-pointer"
              />
              <span>WPA/WPA2/WPA3</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="radio"
                name="enc"
                checked={wifiData.encryption === 'nopass'}
                onChange={() => setWifiData({ ...wifiData, encryption: 'nopass' })}
                className="text-indigo-600 cursor-pointer"
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
              className="px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs"
            />
            <input
              type="text"
              placeholder="Last Name"
              value={vcardData.lastName}
              onChange={(e) => setVcardData({ ...vcardData, lastName: e.target.value })}
              className="px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="tel"
              placeholder="Phone (+1 312 555-0100)"
              value={vcardData.phone}
              onChange={(e) => setVcardData({ ...vcardData, phone: e.target.value })}
              className="px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs"
            />
            <input
              type="email"
              placeholder="Email (alex@strixdevs.com)"
              value={vcardData.email}
              onChange={(e) => setVcardData({ ...vcardData, email: e.target.value })}
              className="px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Company"
              value={vcardData.company}
              onChange={(e) => setVcardData({ ...vcardData, company: e.target.value })}
              className="px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs"
            />
            <input
              type="url"
              placeholder="Website"
              value={vcardData.website}
              onChange={(e) => setVcardData({ ...vcardData, website: e.target.value })}
              className="px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs"
            />
          </div>
        </div>
      )}

      {/* 4. WhatsApp */}
      {payloadType === 'whatsapp' && (
        <div className="space-y-3">
          <input
            type="tel"
            placeholder="WhatsApp Phone (13125550144)"
            value={whatsappData.phone}
            onChange={(e) => setWhatsappData({ ...whatsappData, phone: e.target.value })}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs sm:text-sm"
          />
          <textarea
            rows={2}
            placeholder="Pre-filled greeting message"
            value={whatsappData.message}
            onChange={(e) => setWhatsappData({ ...whatsappData, message: e.target.value })}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs"
          />
        </div>
      )}

      {/* 5. Email */}
      {payloadType === 'email' && (
        <div className="space-y-3">
          <input
            type="email"
            placeholder="Recipient (contact@strixdevs.com)"
            value={emailData.email}
            onChange={(e) => setEmailData({ ...emailData, email: e.target.value })}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs sm:text-sm"
          />
          <input
            type="text"
            placeholder="Subject"
            value={emailData.subject}
            onChange={(e) => setEmailData({ ...emailData, subject: e.target.value })}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs"
          />
        </div>
      )}

      {/* 6. Crypto */}
      {payloadType === 'crypto' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <select
            value={cryptoData.currency}
            onChange={(e) => setCryptoData({ ...cryptoData, currency: e.target.value as any })}
            className="px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs"
          >
            <option value="BTC">Bitcoin (BTC)</option>
            <option value="ETH">Ethereum (ETH)</option>
            <option value="SOL">Solana (SOL)</option>
          </select>
          <input
            type="text"
            placeholder="Wallet Address"
            value={cryptoData.address}
            onChange={(e) => setCryptoData({ ...cryptoData, address: e.target.value })}
            className="px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-mono"
          />
        </div>
      )}

      {/* 7. Text */}
      {payloadType === 'text' && (
        <textarea
          rows={3}
          placeholder="Enter plain text, code, serial number, or note..."
          value={textValue}
          onChange={(e) => setTextValue(e.target.value)}
          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs sm:text-sm"
        />
      )}
    </div>
  );
};
