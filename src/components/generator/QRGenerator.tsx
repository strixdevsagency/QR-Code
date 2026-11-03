import React, { useState } from 'react';
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
  expiryMode,
  setExpiryMode,
  timeLimitPreset,
  setTimeLimitPreset,
}) => {
  const [activeTab, setActiveTab] = useState<'content' | 'style' | 'logo'>('content');

  return (
    <div className="w-full bg-[#111827] border border-slate-800 rounded-2xl p-6 shadow-sm">
      {/* 3 Step Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-4 mb-6">
        <button
          onClick={() => setActiveTab('content')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer ${
            activeTab === 'content'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white bg-[#090d16]'
          }`}
        >
          1. Content & Expiration
        </button>

        <button
          onClick={() => setActiveTab('style')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer ${
            activeTab === 'style'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white bg-[#090d16]'
          }`}
        >
          2. Style & Colors
        </button>

        <button
          onClick={() => setActiveTab('logo')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer ${
            activeTab === 'logo'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white bg-[#090d16]'
          }`}
        >
          3. Center Logo
        </button>
      </div>

      {/* Tab 1: Content & Expiration Mode */}
      {activeTab === 'content' && (
        <div className="space-y-6">
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
            emailData={emailData}
            setEmailData={setEmailData}
            cryptoData={cryptoData}
            setCryptoData={setCryptoData}
          />
        </div>
      )}

      {/* Tab 2: Style & Colors */}
      {activeTab === 'style' && (
        <StyleControls design={design} setDesign={setDesign} />
      )}

      {/* Tab 3: Center Logo */}
      {activeTab === 'logo' && (
        <LogoControls design={design} setDesign={setDesign} />
      )}
    </div>
  );
};
