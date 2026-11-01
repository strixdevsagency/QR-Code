import { useState } from 'react';
import type {
  QRType,
  QRDesignOptions,
  WifiData,
  VCardData,
  WhatsappData,
  CryptoData,
  DotType,
  CornerSquareType,
} from '../types';
import {
  Link2,
  Wifi,
  Contact2,
  MessageSquare,
  Coins,
  Mail,
  FileText,
  SlidersHorizontal,
  Palette,
  Sparkles,
  Upload,
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
    { id: 'url', label: 'Website Link', icon: <Link2 className="w-3.5 h-3.5" /> },
    { id: 'wifi', label: 'WiFi Connect', icon: <Wifi className="w-3.5 h-3.5" /> },
    { id: 'vcard', label: 'Digital Card', icon: <Contact2 className="w-3.5 h-3.5" /> },
    { id: 'whatsapp', label: 'WhatsApp', icon: <MessageSquare className="w-3.5 h-3.5" /> },
    { id: 'email', label: 'Email', icon: <Mail className="w-3.5 h-3.5" /> },
    { id: 'crypto', label: 'Crypto Pay', icon: <Coins className="w-3.5 h-3.5" /> },
    { id: 'text', label: 'Plain Text', icon: <FileText className="w-3.5 h-3.5" /> },
  ];

  const dotPatterns: { id: DotType; label: string }[] = [
    { id: 'rounded', label: 'Soft Round' },
    { id: 'dots', label: 'Micro Dots' },
    { id: 'classy', label: 'Classy' },
    { id: 'square', label: 'Standard' },
    { id: 'extra-rounded', label: 'Ultra Smooth' },
  ];

  const cornerSquares: { id: CornerSquareType; label: string }[] = [
    { id: 'extra-rounded', label: 'Pill Eye' },
    { id: 'dot', label: 'Circular' },
    { id: 'square', label: 'Classic Box' },
  ];

  const luxuryColorPresets = [
    { name: 'Onyx Black', dots: '#0f172a', bg: '#ffffff' },
    { name: 'Electric Indigo', dots: '#4f46e5', bg: '#ffffff' },
    { name: 'Cyber Cyan', dots: '#0891b2', bg: '#ffffff' },
    { name: 'Royal Violet', dots: '#7c3aed', bg: '#ffffff' },
    { name: 'Forest Jade', dots: '#059669', bg: '#ffffff' },
    { name: 'Crimson Rose', dots: '#e11d48', bg: '#ffffff' },
  ];

  const presetLogos = [
    { label: 'WiFi Icon', url: 'https://cdn-icons-png.flaticon.com/512/93/93158.png' },
    { label: 'WhatsApp', url: 'https://cdn-icons-png.flaticon.com/512/3670/3670051.png' },
    { label: 'Instagram', url: 'https://cdn-icons-png.flaticon.com/512/3955/3955024.png' },
    { label: 'Maps', url: 'https://cdn-icons-png.flaticon.com/512/854/854878.png' },
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
    <div className="w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/50 dark:shadow-black/50 transition-all">
      
      {/* Floating Segmented Controller Tabs */}
      <div className="flex items-center p-1 rounded-2xl bg-slate-100 dark:bg-slate-950 mb-7 shadow-inner">
        <button
          onClick={() => setActiveTab('content')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
            activeTab === 'content'
              ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>1. QR Payload</span>
        </button>

        <button
          onClick={() => setActiveTab('style')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
            activeTab === 'style'
              ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Palette className="w-3.5 h-3.5" />
          <span>2. Art & Color</span>
        </button>

        <button
          onClick={() => setActiveTab('logo')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
            activeTab === 'logo'
              ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>3. Center Brand</span>
        </button>
      </div>

      {/* TAB 1: CONTENT */}
      {activeTab === 'content' && (
        <div className="space-y-6">
          {/* Format selector chips */}
          <div className="flex flex-wrap gap-2">
            {types.map((t) => (
              <button
                key={t.id}
                onClick={() => setPayloadType(t.id)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                  payloadType === t.id
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                    : 'bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800/80 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                {t.icon}
                <span>{t.label}</span>
              </button>
            ))}
          </div>

          {/* Seamless Frameless Inputs */}
          <div className="pt-2">
            {payloadType === 'url' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Destination Link
                </label>
                <div className="relative">
                  <input
                    type="url"
                    value={urlValue}
                    onChange={(e) => setUrlValue(e.target.value)}
                    placeholder="https://yourbrand.com or https://restaurantmenu.com"
                    className="w-full px-5 py-4 rounded-2xl bg-slate-100/80 dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/80 font-mono shadow-inner transition"
                  />
                </div>
              </div>
            )}

            {payloadType === 'wifi' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                    Network Name (SSID)
                  </label>
                  <input
                    type="text"
                    value={wifiData.ssid}
                    onChange={(e) => setWifiData((p) => ({ ...p, ssid: e.target.value }))}
                    placeholder="e.g. ChicagoCafe-Guest-WiFi"
                    className="w-full px-5 py-3.5 rounded-2xl bg-slate-100/80 dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/80 shadow-inner"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                      Password
                    </label>
                    <input
                      type="text"
                      value={wifiData.password}
                      onChange={(e) => setWifiData((p) => ({ ...p, password: e.target.value }))}
                      placeholder="Network Password"
                      className="w-full px-5 py-3.5 rounded-2xl bg-slate-100/80 dark:bg-slate-950 text-slate-900 dark:text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/80 shadow-inner"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                      Encryption
                    </label>
                    <select
                      value={wifiData.encryption}
                      onChange={(e) => setWifiData((p) => ({ ...p, encryption: e.target.value as any }))}
                      className="w-full px-5 py-3.5 rounded-2xl bg-slate-100/80 dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/80 shadow-inner"
                    >
                      <option value="WPA">WPA / WPA2 / WPA3 (Default)</option>
                      <option value="WEP">WEP (Legacy)</option>
                      <option value="nopass">None (Open Network)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {payloadType === 'vcard' && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={vcardData.firstName}
                    onChange={(e) => setVcardData((p) => ({ ...p, firstName: e.target.value }))}
                    placeholder="First Name"
                    className="w-full px-4 py-3 rounded-2xl bg-slate-100/80 dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500 shadow-inner"
                  />
                  <input
                    type="text"
                    value={vcardData.lastName}
                    onChange={(e) => setVcardData((p) => ({ ...p, lastName: e.target.value }))}
                    placeholder="Last Name"
                    className="w-full px-4 py-3 rounded-2xl bg-slate-100/80 dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500 shadow-inner"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={vcardData.company}
                    onChange={(e) => setVcardData((p) => ({ ...p, company: e.target.value }))}
                    placeholder="Company / Restaurant"
                    className="w-full px-4 py-3 rounded-2xl bg-slate-100/80 dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500 shadow-inner"
                  />
                  <input
                    type="tel"
                    value={vcardData.phone}
                    onChange={(e) => setVcardData((p) => ({ ...p, phone: e.target.value }))}
                    placeholder="Phone Number"
                    className="w-full px-4 py-3 rounded-2xl bg-slate-100/80 dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500 shadow-inner"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="email"
                    value={vcardData.email}
                    onChange={(e) => setVcardData((p) => ({ ...p, email: e.target.value }))}
                    placeholder="Email Address"
                    className="w-full px-4 py-3 rounded-2xl bg-slate-100/80 dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500 shadow-inner"
                  />
                  <input
                    type="url"
                    value={vcardData.website}
                    onChange={(e) => setVcardData((p) => ({ ...p, website: e.target.value }))}
                    placeholder="https://brand.com"
                    className="w-full px-4 py-3 rounded-2xl bg-slate-100/80 dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500 shadow-inner"
                  />
                </div>
              </div>
            )}

            {payloadType === 'whatsapp' && (
              <div className="space-y-3">
                <input
                  type="text"
                  value={whatsappData.phone}
                  onChange={(e) => setWhatsappData((p) => ({ ...p, phone: e.target.value }))}
                  placeholder="Phone with country code (e.g. 13125550144)"
                  className="w-full px-5 py-3.5 rounded-2xl bg-slate-100/80 dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 shadow-inner"
                />
                <textarea
                  rows={2}
                  value={whatsappData.message}
                  onChange={(e) => setWhatsappData((p) => ({ ...p, message: e.target.value }))}
                  placeholder="Pre-filled greeting message"
                  className="w-full px-5 py-3.5 rounded-2xl bg-slate-100/80 dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 shadow-inner"
                />
              </div>
            )}

            {payloadType === 'crypto' && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <select
                    value={cryptoData.currency}
                    onChange={(e) => setCryptoData((p) => ({ ...p, currency: e.target.value as any }))}
                    className="w-full px-4 py-3 rounded-2xl bg-slate-100/80 dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 shadow-inner"
                  >
                    <option value="BTC">Bitcoin (BTC)</option>
                    <option value="ETH">Ethereum (ETH)</option>
                    <option value="SOL">Solana (SOL)</option>
                  </select>
                  <input
                    type="text"
                    value={cryptoData.amount || ''}
                    onChange={(e) => setCryptoData((p) => ({ ...p, amount: e.target.value }))}
                    placeholder="Amount (optional)"
                    className="w-full px-4 py-3 rounded-2xl bg-slate-100/80 dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 shadow-inner"
                  />
                </div>
                <input
                  type="text"
                  value={cryptoData.address}
                  onChange={(e) => setCryptoData((p) => ({ ...p, address: e.target.value }))}
                  placeholder="Wallet address"
                  className="w-full px-5 py-3.5 rounded-2xl bg-slate-100/80 dark:bg-slate-950 text-slate-900 dark:text-white text-sm font-mono focus:ring-2 focus:ring-indigo-500 shadow-inner"
                />
              </div>
            )}

            {payloadType === 'email' && (
              <div className="space-y-3">
                <input
                  type="email"
                  value={emailData.email}
                  onChange={(e) => setEmailData((p) => ({ ...p, email: e.target.value }))}
                  placeholder="Recipient Email"
                  className="w-full px-5 py-3.5 rounded-2xl bg-slate-100/80 dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 shadow-inner"
                />
                <input
                  type="text"
                  value={emailData.subject}
                  onChange={(e) => setEmailData((p) => ({ ...p, subject: e.target.value }))}
                  placeholder="Subject Line"
                  className="w-full px-5 py-3.5 rounded-2xl bg-slate-100/80 dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 shadow-inner"
                />
              </div>
            )}

            {payloadType === 'text' && (
              <textarea
                rows={3}
                value={textValue}
                onChange={(e) => setTextValue(e.target.value)}
                placeholder="Enter raw text, serial codes, or Wi-Fi notes..."
                className="w-full px-5 py-3.5 rounded-2xl bg-slate-100/80 dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 shadow-inner"
              />
            )}
          </div>
        </div>
      )}

      {/* TAB 2: STYLE & LUXURY PRESETS */}
      {activeTab === 'style' && (
        <div className="space-y-6">
          {/* Luxury Curated Presets */}
          <div>
            <span className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2.5">
              Luxury Palette Presets
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {luxuryColorPresets.map((palette) => (
                <button
                  key={palette.name}
                  onClick={() =>
                    setDesign((p) => ({
                      ...p,
                      dotsColor: palette.dots,
                      cornerSquareColor: palette.dots,
                      cornerDotColor: palette.dots,
                      backgroundColor: palette.bg,
                    }))
                  }
                  className="flex items-center gap-2.5 p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-950 hover:bg-slate-200 dark:hover:bg-slate-800 transition text-left cursor-pointer"
                >
                  <span
                    className="w-4 h-4 rounded-full shadow-xs shrink-0"
                    style={{ backgroundColor: palette.dots }}
                  />
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                    {palette.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Matrix Pattern Style */}
          <div>
            <span className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
              Matrix Geometry
            </span>
            <div className="flex flex-wrap gap-2">
              {dotPatterns.map((pat) => (
                <button
                  key={pat.id}
                  onClick={() => setDesign((p) => ({ ...p, dotsType: pat.id }))}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                    design.dotsType === pat.id
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                      : 'bg-slate-100 dark:bg-slate-950 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
                  }`}
                >
                  {pat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Corner Eyes */}
          <div>
            <span className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
              Corner Eye Framing
            </span>
            <div className="flex flex-wrap gap-2">
              {cornerSquares.map((sq) => (
                <button
                  key={sq.id}
                  onClick={() => setDesign((p) => ({ ...p, cornerSquareType: sq.id }))}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                    design.cornerSquareType === sq.id
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                      : 'bg-slate-100 dark:bg-slate-950 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
                  }`}
                >
                  {sq.label}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Color Pickers */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-850 grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Pattern Color</span>
              <div className="flex items-center gap-2.5">
                <input
                  type="color"
                  value={design.dotsColor}
                  onChange={(e) => setDesign((p) => ({ ...p, dotsColor: e.target.value }))}
                  className="w-10 h-10 rounded-xl bg-transparent cursor-pointer"
                />
                <span className="font-mono text-slate-800 dark:text-slate-200 font-bold">{design.dotsColor}</span>
              </div>
            </div>

            <div>
              <span className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Canvas Background</span>
              <div className="flex items-center gap-2.5">
                <input
                  type="color"
                  value={design.backgroundColor}
                  onChange={(e) => setDesign((p) => ({ ...p, backgroundColor: e.target.value }))}
                  className="w-10 h-10 rounded-xl bg-transparent cursor-pointer"
                />
                <span className="font-mono text-slate-800 dark:text-slate-200 font-bold">{design.backgroundColor}</span>
              </div>
            </div>
          </div>

          {/* Margin */}
          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
              <span>Print Quiet Zone</span>
              <span className="font-mono text-indigo-600 dark:text-indigo-400 font-bold">{design.margin}px</span>
            </div>
            <input
              type="range"
              min={0}
              max={25}
              value={design.margin}
              onChange={(e) => setDesign((p) => ({ ...p, margin: Number(e.target.value) }))}
              className="w-full h-2 bg-slate-100 dark:bg-slate-950 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
          </div>
        </div>
      )}

      {/* TAB 3: CENTER LOGO */}
      {activeTab === 'logo' && (
        <div className="space-y-6">
          <div>
            <span className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2.5">
              Quick Brand Emblems
            </span>
            <div className="flex flex-wrap gap-3">
              {presetLogos.map((lg) => (
                <button
                  key={lg.label}
                  onClick={() => setDesign((p) => ({ ...p, logoUrl: lg.url }))}
                  className={`px-4 py-2.5 rounded-2xl flex items-center gap-2 text-xs font-bold transition cursor-pointer ${
                    design.logoUrl === lg.url
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                      : 'bg-slate-100 dark:bg-slate-950 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
                  }`}
                >
                  <img src={lg.url} alt={lg.label} className="w-4 h-4 object-contain" />
                  <span>{lg.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-850 flex items-center gap-4">
            <label className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs cursor-pointer transition shadow-md shadow-indigo-600/20">
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Custom Business Logo</span>
              <input type="file" accept="image/*" onChange={handleCustomLogoUpload} className="hidden" />
            </label>

            {design.logoUrl && (
              <button
                onClick={() => setDesign((p) => ({ ...p, logoUrl: undefined }))}
                className="text-xs text-rose-500 hover:underline font-bold"
              >
                Clear Logo
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
