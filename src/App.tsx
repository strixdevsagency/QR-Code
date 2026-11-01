import { useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Header } from './components/Header';
import { QRGenerator } from './components/QRGenerator';
import { QRPreview } from './components/QRPreview';
import { QRScanner } from './components/QRScanner';
import { UserDashboard } from './components/UserDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { AuthModal } from './components/AuthModal';
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
  SavedQRCode,
} from './types';
import { generatePayload } from './utils/qrPayload';
import { Sparkles, Check } from 'lucide-react';

function MainAppContent() {
  const { isAdmin } = useAuth();
  const [activeView, setActiveView] = useState<'generator' | 'scanner' | 'dashboard' | 'admin'>('generator');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

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

  // QR Design Customization (Original design defaults)
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

  // Compute standard payload string
  const payload = generatePayload(payloadType, {
    url: urlValue,
    text: textValue,
    wifi: wifiData,
    vcard: vcardData,
    whatsapp: whatsappData,
    email: emailData,
    crypto: cryptoData,
  });

  // Auto-Fix contrast if user accidentally selected light dots on white bg
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white transition-colors duration-200">
      {/* Navigation Header */}
      <Header
        activeView={activeView}
        setActiveView={setActiveView}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onNavigateToSection={scrollToSection}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-16">
        
        {/* VIEW 1: GENERATOR (The core highlight of the website) */}
        {activeView === 'generator' && (
          <>
            {/* The First Design's Acclaimed Hero Section */}
            <div className="text-center max-w-3xl mx-auto my-6 sm:my-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold mb-4">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Built by StrixDevs • Serving Chicago, New York & Canada</span>
              </div>
              
              <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
                100% Free Lifetime <br className="hidden sm:inline" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-cyan-300 to-indigo-300">
                  QR Code Generator & Scanner
                </span>
              </h1>

              <p className="mt-3 text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
                Never worry about your QR codes expiring after a 14-day trial. Direct static encoding ensures your business cards, menus, and stickers work permanently with zero monthly fees.
              </p>

              <div className="mt-4 flex flex-wrap items-center justify-center gap-3 text-xs text-slate-400">
                <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                  <Check className="w-3.5 h-3.5" /> Direct Static Codes
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                  <Check className="w-3.5 h-3.5" /> High-DPI Vector Print Exports
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                  <Check className="w-3.5 h-3.5" /> No Credit Card Required
                </span>
              </div>
            </div>

            {/* Main Interactive Tool Area (Highlighted Front and Center) */}
            <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Column: QR Generator Form Controls (7 cols) */}
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

              {/* Right Column: Live QR Preview & Non-Intrusive Sidebar Ad (5 cols) */}
              <div className="lg:col-span-5 flex flex-col items-center gap-6 lg:sticky lg:top-24">
                <QRPreview
                  payload={payload}
                  payloadType={payloadType}
                  design={design}
                  onAutoFixContrast={handleAutoFixContrast}
                  onOpenAuth={() => setIsAuthModalOpen(true)}
                />

                {/* Sidebar AdSense Placement (Collapses automatically if no ads configured) */}
                <AdBanner slotType="rectangle" className="w-full" />
              </div>
            </div>

            {/* The Educational "Why Other QR Codes Expire" Section */}
            <ComparisonSection />

            {/* Corporate Sponsorship Intake Form (Direct B2B form at bottom, no logo slider) */}
            <SponsorSection />
          </>
        )}

        {/* VIEW 2: SCANNER */}
        {activeView === 'scanner' && (
          <div className="mt-8">
            <QRScanner />
          </div>
        )}

        {/* VIEW 3: USER DASHBOARD */}
        {activeView === 'dashboard' && (
          <UserDashboard
            onLoadQRToGenerator={handleLoadQRToGenerator}
            onNavigateToGenerator={() => setActiveView('generator')}
          />
        )}

        {/* VIEW 4: ADMIN DASHBOARD */}
        {activeView === 'admin' && isAdmin && (
          <AdminDashboard />
        )}
      </main>

      {/* Global Footer */}
      <Footer />

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
}

export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <MainAppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
