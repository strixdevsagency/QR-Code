import type { Metadata } from 'next';
import './globals.css';
import { AppProviders } from '../components/providers/AppProviders';

export const metadata: Metadata = {
  title: 'Strix QR — Production-Grade Vector QR Code & 2D Matrix Engine',
  description: 'Free, non-expiring vector QR code and 2D matrix engine by StrixDevs. Generate instant SVG, PDF, and PNG matrix codes with zero tracking and zero server dependencies.',
  keywords: 'free qr code generator, permanent qr code, vector qr code svg, qr scanner online, wifi qr code generator, vcard qr code, print ready qr code, strix qr, strixdevs',
  authors: [{ name: 'StrixDevs', url: 'https://strixdevs.com' }],
  metadataBase: new URL('https://qr.strixdevs.com'),
  alternates: {
    canonical: 'https://qr.strixdevs.com',
  },
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
  openGraph: {
    type: 'website',
    url: 'https://qr.strixdevs.com',
    title: 'Strix QR — Production-Grade Vector QR Code & 2D Matrix Engine',
    description: 'Generate custom, permanent QR codes with instant vector SVG and 300 DPI PDF exports. Encoded directly in your browser with zero redirects.',
    siteName: 'Strix QR',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Strix QR — Production-Grade Vector QR Code & 2D Matrix Engine',
    description: 'Production-ready vector QR code engine. 100% direct matrix encoding with instant SVG and PDF downloads.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'SoftwareApplication',
        name: 'Strix QR',
        operatingSystem: 'All',
        applicationCategory: 'UtilitiesApplication',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        publisher: { '@type': 'Organization', name: 'StrixDevs', url: 'https://strixdevs.com' },
        description: 'A completely free, non-expiring QR code generator and camera scanner utility built by StrixDevs.',
      },
      {
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: 'Do Strix QR codes expire after a trial period?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'No. Strix QR uses direct static encoding without intermediary redirect servers. Your QR codes will work indefinitely with zero recurring fees.',
            },
          },
          {
            '@type': 'Question',
            name: 'Is it safe to print these QR codes on business cards and restaurant menus?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Yes. Strix QR exports print-shop ready vector SVG and PDF files with automatic Level H error correction.',
            },
          },
        ],
      },
    ],
  };

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {process.env.NEXT_PUBLIC_ADSENSE_PUB_ID && (
          <script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_PUB_ID}`}
            crossOrigin="anonymous"
          />
        )}
      </head>
      <body className="bg-[#09090b] text-zinc-100 font-sans antialiased min-h-screen selection:bg-zinc-800 selection:text-white">
        <AppProviders>
          {children}
        </AppProviders>
      </body>
    </html>
  );
}
