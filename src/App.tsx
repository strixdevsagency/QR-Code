import { useState } from 'react';
import { Header } from './components/Header';
import { QRGenerator } from './components/QRGenerator';
import { QRPreview } from './components/QRPreview';
import { QRScanner } from './components/QRScanner';
import { AdBanner } from './components/AdBanner';
import { ComparisonSection } from './components/ComparisonSection';
import { SponsorSection } from './components/SponsorSection';
import { Footer } from './components/Footer';
import type {
  QRType,
  QRDesignOptions,
  WifiData,
  VCardData,
  WhatsappData,
  CryptoData,
} from './types';
import { generatePayload } from './utils/qrPayload';

export function App() {
  const [activeTab, setActiveTab] = useState<'generate' | 'scan'>('generate');

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
    title: 'Director',
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

  // QR Design Customization
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

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onNavigateToSection={scrollToSection}
      />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 pt-5 pb-12">
        {/* AdSense Top Banner */}
        <AdBanner slotType="leaderboard" className="mb-4" />

        {/* Hero Section */}
        <div className="text-center max-w-2xl mx-auto my-5">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-indigo-400 block mb-1.5">
            100% Free Lifetime Utility
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Permanent QR Code Generator & Scanner
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-slate-400">
            Direct static codes with zero expiration. Export vector SVG, PDF, or PNG. No subscription traps.
          </p>
        </div>

        {/* Tool Section */}
        {activeTab === 'generate' ? (
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
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
              />
            </div>

            <div className="lg:col-span-5 flex flex-col items-center gap-4 lg:sticky lg:top-20">
              <QRPreview
                payload={payload}
                design={design}
                onAutoFixContrast={handleAutoFixContrast}
              />
              <AdBanner slotType="rectangle" className="w-full" />
            </div>
          </div>
        ) : (
          <div className="mt-6">
            <QRScanner />
          </div>
        )}

        <AdBanner slotType="in-feed" className="my-10" />

        <ComparisonSection />

        <SponsorSection />
      </main>

      <Footer />
    </div>
  );
}

export default App;
