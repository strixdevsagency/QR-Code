'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '../components/layout/Header';
import { HeroSection } from '../components/marketing/HeroSection';
import { QRGenerator } from '../components/generator/QRGenerator';
import { BulkGenerator } from '../components/generator/BulkGenerator';
import { QRPreview } from '../components/preview/QRPreview';
import { QRScanner } from '../components/scanner/QRScanner';
import { UseCasesSection } from '../components/marketing/UseCasesSection';
import { ComparisonSection } from '../components/marketing/ComparisonSection';
import { FAQSection } from '../components/marketing/FAQSection';
import { ContactSection } from '../components/marketing/ContactSection';
import { Footer } from '../components/layout/Footer';
import { AdBanner } from '../components/monetization/AdBanner';
import { UnifiedDashboard } from '../components/dashboard/UnifiedDashboard';
import { AuthModal } from '../components/AuthModal';
import { PricingModal } from '../components/pricing/PricingModal';
import { QRResolverView } from '../components/resolver/QRResolverView';
import { useAuth } from '../context/AuthContext';
import type { QRType, QRDesignOptions, WifiData, VCardData, WhatsappData, CryptoData, SavedQRCode, ExpiryMode } from '../types';
import { generatePayload } from '../utils/qrPayload';
import { generatePresetLogoSvg } from '../utils/presetBadges';

export default function HomePage() {
  const { updateUserTier } = useAuth();
  const [activeView, setActiveView] = useState<'generator' | 'bulk' | 'scanner' | 'dashboard' | 'admin'>('generator');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isPricingModalOpen, setIsPricingModalOpen] = useState<boolean>(false);
  const [resolverCodeId, setResolverCodeId] = useState<string | null>(null);

  // Payload inputs
  const [payloadType, setPayloadType] = useState<QRType>('url');
  const [urlValue, setUrlValue] = useState<string>('https://strixdevs.com');
  const [wifiData, setWifiData] = useState<WifiData>({
    ssid: '',
    password: '',
    encryption: 'WPA',
    hidden: false,
  });
  const [vcardData, setVcardData] = useState<VCardData>({
    firstName: '',
    lastName: '',
    company: '',
    title: '',
    phone: '',
    email: '',
    website: '',
    street: '',
    city: '',
    country: '',
  });
  const [whatsappData, setWhatsappData] = useState<WhatsappData>({
    phone: '',
    message: '',
  });
  const [textValue, setTextValue] = useState<string>('Strix QR — Production-Grade Vector QR Engine');
  const [smsData, setSmsData] = useState<{ phone: string; message: string }>({
    phone: '',
    message: '',
  });
  const [emailData, setEmailData] = useState({
    email: '',
    subject: '',
    body: '',
  });
  const [cryptoData, setCryptoData] = useState<CryptoData>({
    currency: 'BTC',
    address: '',
    amount: '',
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
    logoSize: 0.26,
    validityTerm: 'lifetime',
  });

  const payload = generatePayload(payloadType, {
    url: urlValue,
    text: textValue,
    wifi: wifiData,
    vcard: vcardData,
    whatsapp: whatsappData,
    sms: smsData,
    email: emailData,
    crypto: cryptoData,
  });

  // Synchronize preset badge ink colors with QR dots and background colors
  useEffect(() => {
    if (design.presetLogoId) {
      const updatedSvg = generatePresetLogoSvg(
        design.presetLogoId,
        design.dotsColor,
        design.backgroundColor,
        design.isGradient,
        design.dotsColorEnd,
        design.badgeColor
      );
      if (design.logoUrl !== updatedSvg) {
        setDesign((prev) => ({ ...prev, logoUrl: updatedSvg }));
      }
    }
  }, [
    design.presetLogoId,
    design.dotsColor,
    design.backgroundColor,
    design.isGradient,
    design.dotsColorEnd,
    design.badgeColor,
    design.logoUrl,
  ]);

  const handleAutoFixContrast = () => {
    setDesign((prev) => {
      const fixedSvg = prev.presetLogoId
        ? generatePresetLogoSvg(
            prev.presetLogoId,
            '#0f172a',
            '#ffffff',
            false
          )
        : prev.logoUrl;

      // Ensure finder eye geometry is optical-grade compatible:
      // Square frame + circle dot causes diagonal ratio distortion in optical sensors.
      // Align to smooth extra-rounded + circle dot, or square + square dot.
      let targetCornerSquare = prev.cornerSquareType;
      let targetCornerDot = prev.cornerDotType;
      if (targetCornerSquare === 'square' && targetCornerDot === 'dot') {
        targetCornerSquare = 'extra-rounded';
      }

      return {
        ...prev,
        dotsColor: '#0f172a',
        cornerSquareColor: '#0f172a',
        cornerDotColor: '#0f172a',
        backgroundColor: '#ffffff',
        isGradient: false,
        badgeColor: undefined,
        customEyeColors: false,
        cornerSquareType: targetCornerSquare,
        cornerDotType: targetCornerDot,
        // Replace high-jam dot patterns with smooth rounded modules
        dotsType: prev.dotsType === 'dots' || prev.dotsType === 'classy' ? 'rounded' : prev.dotsType,
        // Restore ISO 18004 compliant 4-module quiet zone (minimum 12px)
        margin: Math.max(prev.margin, 12),
        logoSize: prev.logoUrl ? 0.20 : 0.26,
        logoUrl: fixedSvg,
      };
    });
  };

  const handleLoadQRToGenerator = (savedQR: SavedQRCode) => {
    setPayloadType(savedQR.qrType);
    if (savedQR.qrType === 'url') setUrlValue(savedQR.payload);
    else setTextValue(savedQR.payload);
    setDesign(savedQR.design);
    setActiveView('generator');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLoadScannedToGenerator = (rawPayload: string, type: QRType = 'url') => {
    setPayloadType(type);
    if (type === 'url') {
      setUrlValue(rawPayload);
    } else {
      setTextValue(rawPayload);
    }
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
    <div className={`bg-[#09090b] text-zinc-100 flex flex-col font-sans selection:bg-[#38bdf8]/20 selection:text-white ${
      activeView === 'dashboard' || activeView === 'admin' ? 'h-screen w-full overflow-hidden' : 'min-h-screen'
    }`}>
      {activeView !== 'dashboard' && activeView !== 'admin' && (
        <Header
          activeView={activeView}
          setActiveView={setActiveView}
          onOpenAuth={() => setIsAuthModalOpen(true)}
          onOpenPricing={() => setIsPricingModalOpen(true)}
          onNavigateToSection={scrollToSection}
        />
      )}

      <main className={`flex-1 w-full mx-auto ${
        activeView === 'dashboard' || activeView === 'admin'
          ? 'h-full w-full overflow-hidden p-0 max-w-full m-0'
          : 'max-w-7xl px-4 sm:px-6 lg:px-8 pt-6 pb-16'
      }`}>
        {activeView === 'generator' && (
          <>
            <HeroSection />

            {/* Top Leaderboard Ad Slot (Active in Free Mode) */}
            <AdBanner
              slotType="leaderboard"
              onOpenPricing={() => setIsPricingModalOpen(true)}
              className="w-full my-4"
            />

            <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
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
                  smsData={smsData}
                  setSmsData={setSmsData}
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
                  onOpenPricing={() => setIsPricingModalOpen(true)}
                  onOpenAuth={() => setIsAuthModalOpen(true)}
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
                  onOpenPricing={() => setIsPricingModalOpen(true)}
                  onTriggerDynamicResolver={(codeId) => setResolverCodeId(codeId)}
                />
                <AdBanner
                  slotType="rectangle"
                  onOpenPricing={() => setIsPricingModalOpen(true)}
                  className="w-full"
                />
              </div>
            </div>

            <UseCasesSection />
            <ComparisonSection />

            {/* In-Feed Banner Ad Slot (Active in Free Mode) */}
            <AdBanner
              slotType="in-feed"
              onOpenPricing={() => setIsPricingModalOpen(true)}
              className="w-full my-8"
            />

            <FAQSection />
            <ContactSection />
          </>
        )}

        {activeView === 'bulk' && (
          <div className="mt-8">
            <BulkGenerator
              design={design}
              onOpenPricing={() => setIsPricingModalOpen(true)}
              onOpenAuth={() => setIsAuthModalOpen(true)}
            />
          </div>
        )}

        {activeView === 'scanner' && (
          <div className="mt-8">
            <QRScanner onLoadToGenerator={handleLoadScannedToGenerator} />
          </div>
        )}

        {(activeView === 'dashboard' || activeView === 'admin') && (
          <UnifiedDashboard
            onLoadQRToGenerator={handleLoadQRToGenerator}
            onNavigateToGenerator={() => setActiveView('generator')}
            onOpenTestScan={(codeId) => setResolverCodeId(codeId)}
            onOpenPricing={() => setIsPricingModalOpen(true)}
          />
        )}
      </main>

      {activeView !== 'dashboard' && activeView !== 'admin' && <Footer />}

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      <PricingModal
        isOpen={isPricingModalOpen}
        onClose={() => setIsPricingModalOpen(false)}
        onPlanSelected={(tier) => updateUserTier(tier)}
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

