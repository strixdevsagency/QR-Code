import React, { useState } from 'react';
import type {
  QRType,
  QRDesignOptions,
  WifiData,
  VCardData,
  WhatsappData,
  CryptoData,
  DotType,
  CornerSquareType,
  CornerDotType,
} from '../types';
import {
  Link,
  Wifi,
  Contact,
  MessageCircle,
  Mail,
  FileText,
  Coins,
  Palette,
  Image as ImageIcon,
  Upload,
  Info,
  Clock,
  Sliders,
  Check,
} from 'lucide-react';

interface QRGeneratorProps {
  payloadType: QRType;
  setPayloadType: (type: QRType) => void;
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
  design: QRDesignOptions;
  setDesign: React.Dispatch<React.SetStateAction<QRDesignOptions>>;
}

export const QRGenerator: React.FC<QRGeneratorProps> = ({
  payloadType,
  setPayloadType,
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
  design,
  setDesign,
}) => {
  const [activeTab, setActiveTab] = useState<'content' | 'style' | 'logo'>('content');

  const types: { id: QRType; label: string; icon: React.ReactNode }[] = [
    { id: 'url', label: 'URL / Link', icon: <Link className="w-4 h-4" /> },
    { id: 'wifi', label: 'WiFi Network', icon: <Wifi className="w-4 h-4" /> },
    { id: 'vcard', label: 'vCard Contact', icon: <Contact className="w-4 h-4" /> },
    { id: 'whatsapp', label: 'WhatsApp', icon: <MessageCircle className="w-4 h-4" /> },
    { id: 'email', label: 'Email', icon: <Mail className="w-4 h-4" /> },
    { id: 'crypto', label: 'Crypto Pay', icon: <Coins className="w-4 h-4" /> },
    { id: 'text', label: 'Plain Text', icon: <FileText className="w-4 h-4" /> },
  ];

  const dotPatterns: { id: DotType; label: string }[] = [
    { id: 'rounded', label: 'Rounded' },
    { id: 'dots', label: 'Dots' },
    { id: 'classy', label: 'Classy' },
    { id: 'square', label: 'Square' },
    { id: 'extra-rounded', label: 'Smooth' },
  ];

  const cornerSquares: { id: CornerSquareType; label: string }[] = [
    { id: 'extra-rounded', label: 'Rounded' },
    { id: 'dot', label: 'Circle' },
    { id: 'square', label: 'Square' },
  ];

  const cornerDots: { id: CornerDotType; label: string }[] = [
    { id: 'dot', label: 'Circle Dot' },
    { id: 'square', label: 'Square Dot' },
  ];

  const presetLogos = [
    { label: 'WiFi', url: 'https://cdn-icons-png.flaticon.com/512/93/93158.png' },
    { label: 'WhatsApp', url: 'https://cdn-icons-png.flaticon.com/512/3670/3670051.png' },
    { label: 'Instagram', url: 'https://cdn-icons-png.flaticon.com/512/3955/3955024.png' },
    { label: 'Google Maps', url: 'https://cdn-icons-png.flaticon.com/512/854/854878.png' },
    { label: 'Star / Review', url: 'https://cdn-icons-png.flaticon.com/512/1828/1828884.png' },
  ];

  const handleCustomLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setDesign((prev) => ({
          ...prev,
          logoUrl: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
      {/* Top Section Nav: Content vs Style vs Logo */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-4 mb-6">
        <button
          onClick={() => setActiveTab('content')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition cursor-pointer ${
            activeTab === 'content'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'text-slate-400 hover:text-slate-200 bg-slate-800/60'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>1. Content Data</span>
        </button>

        <button
          onClick={() => setActiveTab('style')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition cursor-pointer ${
            activeTab === 'style'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'text-slate-400 hover:text-slate-200 bg-slate-800/60'
          }`}
        >
          <Palette className="w-4 h-4" />
          <span>2. Style & Colors</span>
        </button>

        <button
          onClick={() => setActiveTab('logo')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition cursor-pointer ${
            activeTab === 'logo'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'text-slate-400 hover:text-slate-200 bg-slate-800/60'
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          <span>3. Center Logo</span>
        </button>
      </div>

      {/* TAB 1: CONTENT DATA */}
      {activeTab === 'content' && (
        <div className="space-y-6">
          {/* QR Type Pills */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Select QR Type
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {types.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setPayloadType(t.id)}
                  className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-semibold transition cursor-pointer ${
                    payloadType === t.id
                      ? 'border-indigo-500 bg-indigo-500/15 text-indigo-300 ring-1 ring-indigo-500/30'
                      : 'border-slate-800 bg-slate-800/50 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <span className={payloadType === t.id ? 'text-indigo-400' : 'text-slate-400'}>
                    {t.icon}
                  </span>
                  <span>{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Type-Specific Input Fields */}
          <div className="pt-2">
            {payloadType === 'url' && (
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Destination Website URL
                </label>
                <div className="relative">
                  <input
                    type="url"
                    value={urlValue}
                    onChange={(e) => setUrlValue(e.target.value)}
                    placeholder="https://yourrestaurant.com or https://yourbrand.com"
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-2 flex items-center gap-1">
                  <Info className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  Direct static link. Anyone who scans this will open your site instantly with zero redirects.
                </p>
              </div>
            )}

            {payloadType === 'wifi' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Network Name (SSID)</label>
                  <input
                    type="text"
                    value={wifiData.ssid}
                    onChange={(e) => setWifiData((p) => ({ ...p, ssid: e.target.value }))}
                    placeholder="e.g. StrixDevs-Guest-WiFi"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">WiFi Password</label>
                    <input
                      type="text"
                      value={wifiData.password}
                      onChange={(e) => setWifiData((p) => ({ ...p, password: e.target.value }))}
                      placeholder="Password"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">Encryption Security</label>
                    <select
                      value={wifiData.encryption}
                      onChange={(e) => setWifiData((p) => ({ ...p, encryption: e.target.value as any }))}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-indigo-500"
                    >
                      <option value="WPA">WPA / WPA2 / WPA3 (Standard)</option>
                      <option value="WEP">WEP (Legacy)</option>
                      <option value="nopass">None (Open Network)</option>
                    </select>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500">
                  Ideal for Airbnb hosts, hotels, restaurants, and cafes. Guests scan and connect automatically without typing passwords.
                </p>
              </div>
            )}

            {payloadType === 'vcard' && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-slate-300 mb-1">First Name</label>
                    <input
                      type="text"
                      value={vcardData.firstName}
                      onChange={(e) => setVcardData((p) => ({ ...p, firstName: e.target.value }))}
                      placeholder="John"
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-300 mb-1">Last Name</label>
                    <input
                      type="text"
                      value={vcardData.lastName}
                      onChange={(e) => setVcardData((p) => ({ ...p, lastName: e.target.value }))}
                      placeholder="Doe"
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-slate-300 mb-1">Company / Organization</label>
                    <input
                      type="text"
                      value={vcardData.company}
                      onChange={(e) => setVcardData((p) => ({ ...p, company: e.target.value }))}
                      placeholder="StrixDevs Partner"
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-300 mb-1">Job Title</label>
                    <input
                      type="text"
                      value={vcardData.title}
                      onChange={(e) => setVcardData((p) => ({ ...p, title: e.target.value }))}
                      placeholder="Founder / CEO"
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-slate-300 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      value={vcardData.phone}
                      onChange={(e) => setVcardData((p) => ({ ...p, phone: e.target.value }))}
                      placeholder="+1 (312) 555-0192"
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-300 mb-1">Email Address</label>
                    <input
                      type="email"
                      value={vcardData.email}
                      onChange={(e) => setVcardData((p) => ({ ...p, email: e.target.value }))}
                      placeholder="john@example.com"
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-slate-300 mb-1">Website URL</label>
                  <input
                    type="url"
                    value={vcardData.website}
                    onChange={(e) => setVcardData((p) => ({ ...p, website: e.target.value }))}
                    placeholder="https://mybrand.com"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm"
                  />
                </div>
              </div>
            )}

            {payloadType === 'whatsapp' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-slate-300 mb-1">WhatsApp Phone Number (with Country Code)</label>
                  <input
                    type="text"
                    value={whatsappData.phone}
                    onChange={(e) => setWhatsappData((p) => ({ ...p, phone: e.target.value }))}
                    placeholder="e.g. 13125550192"
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-300 mb-1">Pre-filled Greeting Message</label>
                  <textarea
                    rows={2}
                    value={whatsappData.message}
                    onChange={(e) => setWhatsappData((p) => ({ ...p, message: e.target.value }))}
                    placeholder="Hello! I would like to inquire about your services."
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm"
                  />
                </div>
              </div>
            )}

            {payloadType === 'crypto' && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-slate-300 mb-1">Cryptocurrency</label>
                    <select
                      value={cryptoData.currency}
                      onChange={(e) => setCryptoData((p) => ({ ...p, currency: e.target.value as any }))}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm"
                    >
                      <option value="BTC">Bitcoin (BTC)</option>
                      <option value="ETH">Ethereum (ETH)</option>
                      <option value="SOL">Solana (SOL)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-300 mb-1">Optional Amount</label>
                    <input
                      type="text"
                      value={cryptoData.amount || ''}
                      onChange={(e) => setCryptoData((p) => ({ ...p, amount: e.target.value }))}
                      placeholder="e.g. 0.05"
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-slate-300 mb-1">Wallet Address</label>
                  <input
                    type="text"
                    value={cryptoData.address}
                    onChange={(e) => setCryptoData((p) => ({ ...p, address: e.target.value }))}
                    placeholder="Paste public wallet address"
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm font-mono"
                  />
                </div>
              </div>
            )}

            {payloadType === 'email' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-slate-300 mb-1">Recipient Email</label>
                  <input
                    type="email"
                    value={emailData.email}
                    onChange={(e) => setEmailData((p) => ({ ...p, email: e.target.value }))}
                    placeholder="contact@business.com"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-300 mb-1">Subject</label>
                  <input
                    type="text"
                    value={emailData.subject}
                    onChange={(e) => setEmailData((p) => ({ ...p, subject: e.target.value }))}
                    placeholder="Reservation Inquiry"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm"
                  />
                </div>
              </div>
            )}

            {payloadType === 'text' && (
              <div>
                <label className="block text-xs text-slate-300 mb-1">Raw Text Message</label>
                <textarea
                  rows={3}
                  value={textValue}
                  onChange={(e) => setTextValue(e.target.value)}
                  placeholder="Enter any text, code, or serial number..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm"
                />
              </div>
            )}
          </div>

          {/* Validity Setting selector */}
          <div className="pt-4 border-t border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-indigo-400" />
                Select QR Validity Term:
              </label>
              <span className="text-[11px] text-emerald-400 font-medium">All options 100% Free</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {(['lifetime', '1year', '6months'] as const).map((term) => (
                <button
                  key={term}
                  type="button"
                  onClick={() => setDesign((prev) => ({ ...prev, validityTerm: term }))}
                  className={`py-2 px-3 rounded-xl border text-xs font-medium flex items-center justify-center gap-1.5 transition cursor-pointer ${
                    design.validityTerm === term
                      ? 'border-indigo-500 bg-indigo-500/20 text-white shadow-sm'
                      : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {design.validityTerm === term && <Check className="w-3 h-3 text-indigo-400" />}
                  <span>{term === 'lifetime' ? 'Lifetime (Permanent)' : term === '1year' ? '1 Year (Free)' : '6 Months (Free)'}</span>
                </button>
              ))}
            </div>
            <p className="text-[11px] text-slate-500 mt-2">
              Unlike competitors who cut off service, Strix QR encodes data permanently. Your code will never be deactivated by us.
            </p>
          </div>
        </div>
      )}

      {/* TAB 2: STYLING & COLORS */}
      {activeTab === 'style' && (
        <div className="space-y-6">
          {/* Dot Pattern Matrix */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              QR Matrix Pattern
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {dotPatterns.map((pat) => (
                <button
                  key={pat.id}
                  onClick={() => setDesign((p) => ({ ...p, dotsType: pat.id }))}
                  className={`p-2 rounded-xl border text-xs font-medium transition text-center cursor-pointer ${
                    design.dotsType === pat.id
                      ? 'border-indigo-500 bg-indigo-500/20 text-indigo-300'
                      : 'border-slate-800 bg-slate-800/40 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {pat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Corner Eyes Styles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Corner Outer Box
              </label>
              <div className="grid grid-cols-3 gap-2">
                {cornerSquares.map((sq) => (
                  <button
                    key={sq.id}
                    onClick={() => setDesign((p) => ({ ...p, cornerSquareType: sq.id }))}
                    className={`p-2 rounded-xl border text-xs font-medium text-center cursor-pointer ${
                      design.cornerSquareType === sq.id
                        ? 'border-indigo-500 bg-indigo-500/20 text-indigo-300'
                        : 'border-slate-800 bg-slate-800/40 text-slate-400'
                    }`}
                  >
                    {sq.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Corner Inner Dot
              </label>
              <div className="grid grid-cols-2 gap-2">
                {cornerDots.map((cd) => (
                  <button
                    key={cd.id}
                    onClick={() => setDesign((p) => ({ ...p, cornerDotType: cd.id }))}
                    className={`p-2 rounded-xl border text-xs font-medium text-center cursor-pointer ${
                      design.cornerDotType === cd.id
                        ? 'border-indigo-500 bg-indigo-500/20 text-indigo-300'
                        : 'border-slate-800 bg-slate-800/40 text-slate-400'
                    }`}
                  >
                    {cd.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Color Pickers */}
          <div className="pt-2 border-t border-slate-800">
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Color Customization
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-slate-300 mb-1">Dots / Pattern Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={design.dotsColor}
                    onChange={(e) => setDesign((p) => ({ ...p, dotsColor: e.target.value }))}
                    className="w-9 h-9 rounded-lg border border-slate-700 bg-transparent cursor-pointer"
                  />
                  <input
                    type="text"
                    value={design.dotsColor}
                    onChange={(e) => setDesign((p) => ({ ...p, dotsColor: e.target.value }))}
                    className="w-24 px-2 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs font-mono text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1">Corner Eye Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={design.cornerSquareColor}
                    onChange={(e) =>
                      setDesign((p) => ({
                        ...p,
                        cornerSquareColor: e.target.value,
                        cornerDotColor: e.target.value,
                      }))
                    }
                    className="w-9 h-9 rounded-lg border border-slate-700 bg-transparent cursor-pointer"
                  />
                  <input
                    type="text"
                    value={design.cornerSquareColor}
                    onChange={(e) =>
                      setDesign((p) => ({
                        ...p,
                        cornerSquareColor: e.target.value,
                        cornerDotColor: e.target.value,
                      }))
                    }
                    className="w-24 px-2 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs font-mono text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1">Background Canvas</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={design.backgroundColor}
                    onChange={(e) => setDesign((p) => ({ ...p, backgroundColor: e.target.value }))}
                    className="w-9 h-9 rounded-lg border border-slate-700 bg-transparent cursor-pointer"
                  />
                  <input
                    type="text"
                    value={design.backgroundColor}
                    onChange={(e) => setDesign((p) => ({ ...p, backgroundColor: e.target.value }))}
                    className="w-24 px-2 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs font-mono text-white"
                  />
                </div>
              </div>
            </div>

            {/* Gradient Toggle */}
            <div className="mt-4 flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="gradient-toggle"
                  checked={design.isGradient}
                  onChange={(e) => setDesign((p) => ({ ...p, isGradient: e.target.checked }))}
                  className="rounded border-slate-700 text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                />
                <label htmlFor="gradient-toggle" className="text-xs text-slate-300 cursor-pointer font-medium">
                  Enable 2-Color Gradient Effect
                </label>
              </div>

              {design.isGradient && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">End Color:</span>
                  <input
                    type="color"
                    value={design.dotsColorEnd || '#6366f1'}
                    onChange={(e) => setDesign((p) => ({ ...p, dotsColorEnd: e.target.value }))}
                    className="w-7 h-7 rounded border border-slate-700 bg-transparent cursor-pointer"
                  />
                </div>
              )}
            </div>

            {/* Margin Slider */}
            <div className="mt-4">
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>Safe Print Margin (Quiet Zone):</span>
                <span className="font-mono text-indigo-400">{design.margin}px</span>
              </div>
              <input
                type="range"
                min={0}
                max={25}
                value={design.margin}
                onChange={(e) => setDesign((p) => ({ ...p, margin: Number(e.target.value) }))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: CENTER LOGO */}
      {activeTab === 'logo' && (
        <div className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Preset Quick Logos
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {presetLogos.map((lg) => (
                <button
                  key={lg.label}
                  onClick={() => setDesign((p) => ({ ...p, logoUrl: lg.url }))}
                  className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-2 transition cursor-pointer ${
                    design.logoUrl === lg.url
                      ? 'border-indigo-500 bg-indigo-500/20 text-indigo-300 ring-1 ring-indigo-500'
                      : 'border-slate-800 bg-slate-800/40 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <img src={lg.url} alt={lg.label} className="w-6 h-6 object-contain" />
                  <span className="text-[11px] font-medium">{lg.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Upload */}
          <div className="pt-2 border-t border-slate-800">
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Or Upload Custom Company Logo (PNG / SVG)
            </label>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-white cursor-pointer transition">
                <Upload className="w-4 h-4 text-indigo-400" />
                <span>Upload Logo File</span>
                <input type="file" accept="image/png, image/jpeg, image/svg+xml" onChange={handleCustomLogoUpload} className="hidden" />
              </label>

              {design.logoUrl && (
                <button
                  onClick={() => setDesign((p) => ({ ...p, logoUrl: undefined }))}
                  className="text-xs text-rose-400 hover:text-rose-300 underline font-medium cursor-pointer"
                >
                  Remove Logo
                </button>
              )}
            </div>
          </div>

          {/* Logo Size Slider */}
          {design.logoUrl && (
            <div className="pt-2">
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>Logo Proportional Size:</span>
                <span className="font-mono text-indigo-400">{Math.round(design.logoSize * 100)}%</span>
              </div>
              <input
                type="range"
                min={0.2}
                max={0.4}
                step={0.02}
                value={design.logoSize}
                onChange={(e) => setDesign((p) => ({ ...p, logoSize: Number(e.target.value) }))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Auto-locked to High Error Correction (Level H). Limits logo to safe size so phone cameras scan instantly.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
