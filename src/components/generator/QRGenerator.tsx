import React, { useState } from 'react';
import { SlidersHorizontal, Palette, Image as ImageIcon } from 'lucide-react';
import { playTactileClick } from '../../utils/audioFeedback';
import type {
  QRType,
  QRDesignOptions,
  WifiData,
  VCardData,
  WhatsappData,
  CryptoData,
  ExpiryMode,
} from '../../types';
import { ExpirationPolicy } from './ExpirationPolicy';
import { TypeSelector } from './TypeSelector';
import { ContentInputs } from './ContentInputs';
import { StyleControls } from './StyleControls';
import { LogoControls } from './LogoControls';

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
  smsData: { phone: string; message: string };
  setSmsData: React.Dispatch<React.SetStateAction<{ phone: string; message: string }>>;
  emailData: { email: string; subject: string; body: string };
  setEmailData: React.Dispatch<React.SetStateAction<{ email: string; subject: string; body: string }>>;
  cryptoData: CryptoData;
  setCryptoData: React.Dispatch<React.SetStateAction<CryptoData>>;
  design: QRDesignOptions;
  setDesign: React.Dispatch<React.SetStateAction<QRDesignOptions>>;
  expiryMode: ExpiryMode;
  setExpiryMode: (mode: ExpiryMode) => void;
  timeLimitPreset: string;
  setTimeLimitPreset: (val: string) => void;
  onOpenPricing?: () => void;
  onOpenAuth?: () => void;
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
  smsData,
  setSmsData,
  emailData,
  setEmailData,
  cryptoData,
  setCryptoData,
  design,
  setDesign,
  expiryMode,
  setExpiryMode,
  timeLimitPreset,
  setTimeLimitPreset,
  onOpenPricing,
  onOpenAuth,
}) => {
  const [activeTab, setActiveTab] = useState<'content' | 'style' | 'logo'>('content');

  return (
    <div className="w-full bg-gradient-to-b from-zinc-900/90 to-zinc-950/90 backdrop-blur-2xl border border-white/[0.1] rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/50 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)]">
      {/* 3 Step Tabs - Modern Segmented Control */}
      <div className="p-1 bg-zinc-950/80 rounded-xl border border-white/[0.08] flex items-center gap-1 mb-6">
        <button
          onClick={() => {
            playTactileClick();
            setActiveTab('content');
          }}
          className={`flex-1 min-w-0 py-2.5 px-2 sm:px-3 rounded-lg text-xs sm:text-sm font-medium transition-all flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer active:scale-[0.97] ${
            activeTab === 'content'
              ? 'bg-[#38bdf8]/15 text-[#38bdf8] shadow-sm border border-[#38bdf8]/35 font-bold ring-1 ring-[#38bdf8]/20'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40'
          }`}
        >
          <SlidersHorizontal className={`w-3.5 h-3.5 shrink-0 ${activeTab === 'content' ? 'text-[#38bdf8]' : 'text-zinc-400'}`} />
          <span className="whitespace-nowrap truncate font-semibold">1. Payload</span>
        </button>

        <button
          onClick={() => {
            playTactileClick();
            setActiveTab('style');
          }}
          className={`flex-1 min-w-0 py-2.5 px-2 sm:px-3 rounded-lg text-xs sm:text-sm font-medium transition-all flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer active:scale-[0.97] ${
            activeTab === 'style'
              ? 'bg-[#38bdf8]/15 text-[#38bdf8] shadow-sm border border-[#38bdf8]/35 font-bold ring-1 ring-[#38bdf8]/20'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40'
          }`}
        >
          <Palette className={`w-3.5 h-3.5 shrink-0 ${activeTab === 'style' ? 'text-[#38bdf8]' : 'text-zinc-400'}`} />
          <span className="whitespace-nowrap truncate font-semibold">
            2. <span className="hidden sm:inline">Matrix </span>Style
          </span>
        </button>

        <button
          onClick={() => {
            playTactileClick();
            setActiveTab('logo');
          }}
          className={`flex-1 min-w-0 py-2.5 px-2 sm:px-3 rounded-lg text-xs sm:text-sm font-medium transition-all flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer active:scale-[0.97] ${
            activeTab === 'logo'
              ? 'bg-[#38bdf8]/15 text-[#38bdf8] shadow-sm border border-[#38bdf8]/35 font-bold ring-1 ring-[#38bdf8]/20'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40'
          }`}
        >
          <ImageIcon className={`w-3.5 h-3.5 shrink-0 ${activeTab === 'logo' ? 'text-[#38bdf8]' : 'text-zinc-400'}`} />
          <span className="whitespace-nowrap truncate font-semibold">
            3. <span className="hidden sm:inline">Center </span>Brand
          </span>
        </button>
      </div>

      {/* Tab 1: Content & Expiration Mode */}
      {activeTab === 'content' && (
        <div className="space-y-6 animate-pop-in">
          <ExpirationPolicy
            expiryMode={expiryMode}
            setExpiryMode={setExpiryMode}
            timeLimitPreset={timeLimitPreset}
            setTimeLimitPreset={setTimeLimitPreset}
          />

          <TypeSelector
            payloadType={payloadType}
            setPayloadType={setPayloadType}
          />

          <ContentInputs
            payloadType={payloadType}
            urlValue={urlValue}
            setUrlValue={setUrlValue}
            wifiData={wifiData}
            setWifiData={setWifiData}
            vcardData={vcardData}
            setVcardData={setVcardData}
            whatsappData={whatsappData}
            setWhatsappData={setWhatsappData}
            textValue={textValue}
            setTextValue={setTextValue}
            smsData={smsData}
            setSmsData={setSmsData}
            emailData={emailData}
            setEmailData={setEmailData}
            cryptoData={cryptoData}
            setCryptoData={setCryptoData}
          />
        </div>
      )}

      {/* Tab 2: Style & Colors */}
      {activeTab === 'style' && (
        <div className="animate-pop-in">
          <StyleControls design={design} setDesign={setDesign} />
        </div>
      )}

      {/* Tab 3: Center Logo */}
      {activeTab === 'logo' && (
        <div className="animate-pop-in">
          <LogoControls
            design={design}
            setDesign={setDesign}
            onOpenPricing={onOpenPricing}
            onOpenAuth={onOpenAuth}
          />
        </div>
      )}
    </div>
  );
};
