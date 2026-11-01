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
import { SponsorMarquee } from './components/SponsorMarquee';
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
import { ShieldCheck, Zap, Sparkles } from 'lucide-react';

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
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#030712] text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-300">
      {/* Sleek Floating Header */}
      <Header
        activeView={activeView}
        setActiveView={setActiveView}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onNavigateToSection={scrollToSection}
      />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 pt-6 pb-20">
        
        {/* AdSense Slot (Auto-collapsed when empty) */}
        <AdBanner slotType="leaderboard" className="mb-4" />

        {/* VIEW 1: GENERATOR */}
        {activeView === 'generator' && (
          <>
            {/* The High-Impact Psychological Hero Stage */}
            <div className="text-center max-w-3xl mx-auto my-8 sm:my-12">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-400 font-bold text-xs mb-5 shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Zero Expiration • Zero Tracking • 100% Free Forever</span>
              </div>
              
              <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.1]">
                The QR Code Generator <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-400">
                  That Never Dies.
                </span>
              </h1>

              <p className="mt-4 text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-xl mx-auto leading-relaxed font-medium">
                No 14-day trials. No \$35/month surprises. Direct static encoding ensures your business cards, menus, and stickers work permanently.
              </p>

              <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs font-semibold text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" /> Permanent Direct Encoding
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                  <Zap className="w-4 h-4 text-indigo-500" /> High-DPI Vector Print Exports
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                  <Sparkles className="w-4 h-4 text-amber-500" /> Trusted in Chicago & New York
                </span>
              </div>
            </div>

            {/* The Studio Canvas Generator Stage */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mt-8">
              
              {/* Left Column: Generator Form (7 cols) */}
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

              {/* Right Column: Studio Showcase Canvas (5 cols) */}
              <div className="lg:col-span-5 flex flex-col items-center gap-6 lg:sticky lg:top-24">
                <QRPreview
                  payload={payload}
                  payloadType={payloadType}
                  design={design}
                  onAutoFixContrast={handleAutoFixContrast}
                  onOpenAuth={() => setIsAuthModalOpen(true)}
                />

                {/* Sidebar Ad Slot (Auto-collapsed when empty) */}
                <AdBanner slotType="rectangle" className="w-full" />
              </div>
            </div>

            {/* In-Feed Ad Slot (Auto-collapsed when empty) */}
            <AdBanner slotType="in-feed" className="my-10" />

            {/* Architecture Truth Comparison */}
            <ComparisonSection />

            {/* The Brand Sponsor Logo Slider / Marquee */}
            <SponsorMarquee />
          </>
        )}

        {/* VIEW 2: IN-BROWSER SCANNER */}
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
