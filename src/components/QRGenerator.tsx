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

  const types: { id: QRType; label: string }[] = [
    { id: 'url', label: 'URL / Link' },
    { id: 'wifi', label: 'WiFi' },
    { id: 'vcard', label: 'vCard Contact' },
    { id: 'whatsapp', label: 'WhatsApp' },
    { id: 'email', label: 'Email' },
    { id: 'crypto', label: 'Crypto' },
    { id: 'text', label: 'Plain Text' },
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

  const presetLogos = [
    { label: 'WiFi', url: 'https://cdn-icons-png.flaticon.com/512/93/93158.png' },
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
    <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
      
      {/* Clean Tabs */}
      <div className="flex items-center gap-1 border-b border-slate-800 pb-3 mb-5 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('content')}
          className={`px-3 py-1.5 rounded-lg transition ${
            activeTab === 'content'
              ? 'bg-indigo-600 text-white'
              : 'text-slate-400 hover:text-slate-200 bg-slate-800/40'
          }`}
        >
          1. Content
        </button>
        <button
          onClick={() => setActiveTab('style')}
          className={`px-3 py-1.5 rounded-lg transition ${
            activeTab === 'style'
              ? 'bg-indigo-600 text-white'
              : 'text-slate-400 hover:text-slate-200 bg-slate-800/40'
          }`}
        >
          2. Styling
        </button>
        <button
          onClick={() => setActiveTab('logo')}
          className={`px-3 py-1.5 rounded-lg transition ${
            activeTab === 'logo'
              ? 'bg-indigo-600 text-white'
              : 'text-slate-400 hover:text-slate-200 bg-slate-800/40'
          }`}
        >
          3. Logo
        </button>
      </div>

      {/* TAB 1: CONTENT DATA */}
      {activeTab === 'content' && (
        <div className="space-y-4">
          {/* Format pills */}
          <div className="flex flex-wrap gap-1.5">
            {types.map((t) => (
              <button
                key={t.id}
                onClick={() => setPayloadType(t.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  payloadType === t.id
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-800/70 text-slate-300 hover:bg-slate-800'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Form fields */}
          <div className="pt-2">
            {payloadType === 'url' && (
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Target Website URL</label>
                <input
                  type="url"
                  value={urlValue}
                  onChange={(e) => setUrlValue(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-750 text-white text-sm focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>
            )}

            {payloadType === 'wifi' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Network Name (SSID)</label>
                  <input
                    type="text"
                    value={wifiData.ssid}
                    onChange={(e) => setWifiData((p) => ({ ...p, ssid: e.target.value }))}
                    placeholder="Guest-WiFi"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-750 text-white text-sm"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Password</label>
                    <input
                      type="text"
                      value={wifiData.password}
                      onChange={(e) => setWifiData((p) => ({ ...p, password: e.target.value }))}
                      placeholder="Password"
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-750 text-white text-sm font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Security</label>
                    <select
                      value={wifiData.encryption}
                      onChange={(e) => setWifiData((p) => ({ ...p, encryption: e.target.value as any }))}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-750 text-white text-sm"
                    >
                      <option value="WPA">WPA/WPA2/WPA3</option>
                      <option value="WEP">WEP</option>
                      <option value="nopass">None (Open)</option>
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
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-750 text-white text-sm"
                  />
                  <input
                    type="text"
                    value={vcardData.lastName}
                    onChange={(e) => setVcardData((p) => ({ ...p, lastName: e.target.value }))}
                    placeholder="Last Name"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-750 text-white text-sm"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={vcardData.company}
                    onChange={(e) => setVcardData((p) => ({ ...p, company: e.target.value }))}
                    placeholder="Company"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-750 text-white text-sm"
                  />
                  <input
                    type="tel"
                    value={vcardData.phone}
                    onChange={(e) => setVcardData((p) => ({ ...p, phone: e.target.value }))}
                    placeholder="Phone Number"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-750 text-white text-sm"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="email"
                    value={vcardData.email}
                    onChange={(e) => setVcardData((p) => ({ ...p, email: e.target.value }))}
                    placeholder="Email"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-750 text-white text-sm"
                  />
                  <input
                    type="url"
                    value={vcardData.website}
                    onChange={(e) => setVcardData((p) => ({ ...p, website: e.target.value }))}
                    placeholder="Website"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-750 text-white text-sm"
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
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-750 text-white text-sm"
                />
                <textarea
                  rows={2}
                  value={whatsappData.message}
                  onChange={(e) => setWhatsappData((p) => ({ ...p, message: e.target.value }))}
                  placeholder="Pre-filled message"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-750 text-white text-sm"
                />
              </div>
            )}

            {payloadType === 'crypto' && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <select
                    value={cryptoData.currency}
                    onChange={(e) => setCryptoData((p) => ({ ...p, currency: e.target.value as any }))}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-750 text-white text-sm"
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
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-750 text-white text-sm"
                  />
                </div>
                <input
                  type="text"
                  value={cryptoData.address}
                  onChange={(e) => setCryptoData((p) => ({ ...p, address: e.target.value }))}
                  placeholder="Wallet Address"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-750 text-white text-sm font-mono"
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
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-750 text-white text-sm"
                />
                <input
                  type="text"
                  value={emailData.subject}
                  onChange={(e) => setEmailData((p) => ({ ...p, subject: e.target.value }))}
                  placeholder="Subject"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-750 text-white text-sm"
                />
              </div>
            )}

            {payloadType === 'text' && (
              <textarea
                rows={3}
                value={textValue}
                onChange={(e) => setTextValue(e.target.value)}
                placeholder="Enter text payload..."
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-750 text-white text-sm"
              />
            )}
          </div>

          {/* Validity selector */}
          <div className="pt-3 border-t border-slate-800/80">
            <div className="flex items-center justify-between mb-2 text-xs">
              <span className="text-slate-400 font-medium">Validity Term:</span>
              <span className="text-emerald-400 font-semibold">100% Free • Non-Expiring</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              {(['lifetime', '1year', '6months'] as const).map((term) => (
                <button
                  key={term}
                  type="button"
                  onClick={() => setDesign((prev) => ({ ...prev, validityTerm: term }))}
                  className={`py-1.5 px-2 rounded-lg border font-medium text-center transition ${
                    design.validityTerm === term
                      ? 'border-indigo-500 bg-indigo-500/20 text-white'
                      : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {term === 'lifetime' ? 'Lifetime' : term === '1year' ? '1 Year' : '6 Months'}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: STYLING */}
      {activeTab === 'style' && (
        <div className="space-y-4">
          <div>
            <span className="block text-xs text-slate-400 font-medium mb-1.5">Pattern Style</span>
            <div className="flex flex-wrap gap-1.5">
              {dotPatterns.map((pat) => (
                <button
                  key={pat.id}
                  onClick={() => setDesign((p) => ({ ...p, dotsType: pat.id }))}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
                    design.dotsType === pat.id
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-800/70 text-slate-300'
                  }`}
                >
                  {pat.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="block text-xs text-slate-400 font-medium mb-1.5">Corner Frame</span>
            <div className="flex flex-wrap gap-1.5">
              {cornerSquares.map((sq) => (
                <button
                  key={sq.id}
                  onClick={() => setDesign((p) => ({ ...p, cornerSquareType: sq.id }))}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
                    design.cornerSquareType === sq.id
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-800/70 text-slate-300'
                  }`}
                >
                  {sq.label}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800/80 grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="block text-slate-400 mb-1">Dots Color</span>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={design.dotsColor}
                  onChange={(e) => setDesign((p) => ({ ...p, dotsColor: e.target.value }))}
                  className="w-8 h-8 rounded border border-slate-750 bg-transparent cursor-pointer"
                />
                <span className="font-mono text-slate-300">{design.dotsColor}</span>
              </div>
            </div>

            <div>
              <span className="block text-slate-400 mb-1">Background Canvas</span>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={design.backgroundColor}
                  onChange={(e) => setDesign((p) => ({ ...p, backgroundColor: e.target.value }))}
                  className="w-8 h-8 rounded border border-slate-750 bg-transparent cursor-pointer"
                />
                <span className="font-mono text-slate-300">{design.backgroundColor}</span>
              </div>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs text-slate-400 mb-1">
              <span>Print Border Margin</span>
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
      )}

      {/* TAB 3: LOGO */}
      {activeTab === 'logo' && (
        <div className="space-y-4">
          <div>
            <span className="block text-xs text-slate-400 font-medium mb-2">Preset Icons</span>
            <div className="flex gap-2">
              {presetLogos.map((lg) => (
                <button
                  key={lg.label}
                  onClick={() => setDesign((p) => ({ ...p, logoUrl: lg.url }))}
                  className={`p-2 rounded-xl border flex items-center gap-2 text-xs transition ${
                    design.logoUrl === lg.url
                      ? 'border-indigo-500 bg-indigo-500/20 text-white'
                      : 'border-slate-800 bg-slate-950 text-slate-300'
                  }`}
                >
                  <img src={lg.url} alt={lg.label} className="w-4 h-4 object-contain" />
                  <span>{lg.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800/80 flex items-center gap-3">
            <label className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-xs font-semibold text-white cursor-pointer transition">
              <span>Upload Custom Logo</span>
              <input type="file" accept="image/png, image/jpeg, image/svg+xml" onChange={handleCustomLogoUpload} className="hidden" />
            </label>

            {design.logoUrl && (
              <button
                onClick={() => setDesign((p) => ({ ...p, logoUrl: undefined }))}
                className="text-xs text-rose-400 hover:underline"
              >
                Remove
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
