import type { Metadata } from 'next';
import './globals.css';
import { AppProviders } from '../components/providers/AppProviders';

export const metadata: Metadata = {
  title: 'Strix QR — 100% Free Lifetime QR Code Generator & Scanner | StrixDevs',
  description: 'Free permanent QR code generator and camera scanner by StrixDevs. Generate vector SVG, PDF, and PNG codes. Never expires, zero subscription fees, no credit card required.',
  keywords: 'free qr code generator, permanent qr code, qr scanner online, qr code without subscription, strixdevs qr, wifi qr code generator, vcard qr code, print ready qr code',
  authors: [{ name: 'StrixDevs', url: 'https://strixdevs.com' }],
  metadataBase: new URL('https://strixdevs.com'),
  openGraph: {
    type: 'website',
    url: 'https://strixdevs.com/tools/qr',
    title: 'Strix QR — Free Lifetime QR Code Generator & Scanner',
    description: 'Create permanent, custom QR codes with high-res SVG and PDF print downloads. Built for businesses, creators, and developers worldwide.',
    siteName: 'Strix QR',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Strix QR — Free Lifetime QR Code Generator & Scanner',
    description: 'Never pay $35/month for QR codes again. 100% static, non-expiring QR generation with live camera scanner.',
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
      </head>
      <body className="bg-[#0b0f19] text-slate-100 font-sans antialiased min-h-screen">
        <AppProviders>
          {children}
        </AppProviders>
      </body>
    </html>
  );
}
