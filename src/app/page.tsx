'use client';

import React, { useState } from 'react';
import { Header } from '../components/layout/Header';
import { HeroSection } from '../components/marketing/HeroSection';
import { QRGenerator } from '../components/generator/QRGenerator';
import { QRPreview } from '../components/preview/QRPreview';
import { QRScanner } from '../components/scanner/QRScanner';
import { ComparisonSection } from '../components/marketing/ComparisonSection';
import { SponsorSection } from '../components/marketing/SponsorSection';
import { Footer } from '../components/layout/Footer';
import { AdBanner } from '../components/monetization/AdBanner';
import { UserDashboard } from '../components/dashboard/UserDashboard';
import { AdminDashboard } from '../components/admin/AdminDashboard';
import { AuthModal } from '../components/AuthModal';
import { QRResolverView } from '../components/QRResolverView';
import type { QRType, QRDesignOptions, WifiData, VCardData, WhatsappData, CryptoData, SavedQRCode, ExpiryMode } from '../types';
import { generatePayload } from '../utils/qrPayload';

export default function HomePage() {
  const [activeView, setActiveView] = useState<'generator' | 'scanner' | 'dashboard' | 'admin'>('generator');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [resolverCodeId, setResolverCodeId] = useState<string | null>(null);

  // Payload inputs
  const [payloadType, setPayloadType] = useState<QRType>('url');
  const [urlValue, setUrlValue] = useState<string>('https://strixdevs.com');
  const [wifiData, setWifiData] = useState<WifiData>({
    ssid: 'StrixDevs-Guest',
    password: 'WelcomeChicago2026',
    encryption: 'WPA',
    hidden: false,
  });
  const [vcardData, setVcardData] = useState<VCardData>({
    firstName: 'Alex',
    lastName: 'Vance',
    company: 'StrixDevs Partner',
    title: 'Managing Director',
    phone: '+1 (312) 555-0144',
    email: 'alex@strixdevs.com',
    website: 'https://strixdevs.com',
    street: '100 N LaSalle St',
    city: 'Chicago',
    country: 'USA',
  });
  const [whatsappData, setWhatsappData] = useState<WhatsappData>({
    phone: '13125550144',
    message: 'Hello StrixDevs, I want to inquire about custom software development!',
  });
  const [textValue, setTextValue] = useState<string>('Permanent QR Code created with StrixDevs QR');
  const [emailData, setEmailData] = useState({
    email: 'contact@strixdevs.com',
    subject: 'Project Inquiry',
    body: 'Hi StrixDevs, let us discuss building our next digital product.',
  });
  const [cryptoData, setCryptoData] = useState<CryptoData>({
    currency: 'BTC',
    address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
    amount: '0.01',
  });

  // Expiration & Security Mode
  const [expiryMode, setExpiryMode] = useState<ExpiryMode>('lifetime');
  const [timeLimitPreset, setTimeLimitPreset] = useState<string>('24h');

  // Design state
  const [design, setDesign] = useState<QRDesignOptions>({
    dotsType: 'rounded',
    dotsColor: '#0f172a',
    dotsColorEnd: '#4f46e5',
    isGradient: false,
    gradientType: 'linear',
    cornerSquareType: 'extra-rounded',
    cornerSquareColor: '#0f172a',
    cornerDotType: 'dot',
    cornerDotColor: '#0f172a',
    backgroundColor: '#ffffff',
    margin: 8,
    logoUrl: undefined,
    logoSize: 0.35,
    validityTerm: 'lifetime',
  });

  const payload = generatePayload(payloadType, {
    url: urlValue,
    text: textValue,
    wifi: wifiData,
    vcard: vcardData,
    whatsapp: whatsappData,
    email: emailData,
    crypto: cryptoData,
  });

  const handleAutoFixContrast = () => {
    setDesign((prev) => ({
      ...prev,
      dotsColor: '#0f172a',
      cornerSquareColor: '#0f172a',
      cornerDotColor: '#0f172a',
      backgroundColor: '#ffffff',
      isGradient: false,
    }));
  };

  const handleLoadQRToGenerator = (savedQR: SavedQRCode) => {
    setPayloadType(savedQR.qrType);
    if (savedQR.qrType === 'url') setUrlValue(savedQR.payload);
    else setTextValue(savedQR.payload);
    setDesign(savedQR.design);
    setActiveView('generator');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToSection = (id: string) => {
    if (activeView !== 'generator') {
      setActiveView('generator');
      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      <Header
        activeView={activeView}
        setActiveView={setActiveView}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onNavigateToSection={scrollToSection}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-16">
        {activeView === 'generator' && (
          <>
            <HeroSection />

            <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-7">
                <QRGenerator
                  payloadType={payloadType}
                  setPayloadType={setPayloadType}
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
                  design={design}
                  setDesign={setDesign}
                  expiryMode={expiryMode}
                  setExpiryMode={setExpiryMode}
                  timeLimitPreset={timeLimitPreset}
                  setTimeLimitPreset={setTimeLimitPreset}
                />
              </div>

              <div className="lg:col-span-5 flex flex-col items-center gap-6 lg:sticky lg:top-24">
                <QRPreview
                  payload={payload}
                  payloadType={payloadType}
                  design={design}
                  expiryMode={expiryMode}
                  timeLimitPreset={timeLimitPreset}
                  onAutoFixContrast={handleAutoFixContrast}
                  onOpenAuth={() => setIsAuthModalOpen(true)}
                  onTriggerDynamicResolver={(codeId) => setResolverCodeId(codeId)}
                />
                <AdBanner slotType="rectangle" className="w-full" />
              </div>
            </div>

            <ComparisonSection />
            <SponsorSection />
          </>
        )}

        {activeView === 'scanner' && (
          <div className="mt-8">
            <QRScanner />
          </div>
        )}

        {activeView === 'dashboard' && (
          <UserDashboard
            onLoadQRToGenerator={handleLoadQRToGenerator}
            onNavigateToGenerator={() => setActiveView('generator')}
            onOpenTestScan={(codeId) => setResolverCodeId(codeId)}
          />
        )}

        {activeView === 'admin' && (
          <AdminDashboard />
        )}
      </main>

      <Footer />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      {resolverCodeId && (
        <QRResolverView
          codeId={resolverCodeId}
          onClose={() => setResolverCodeId(null)}
        />
      )}
    </div>
  );
}

