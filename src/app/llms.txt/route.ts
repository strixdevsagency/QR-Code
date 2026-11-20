import { NextResponse } from 'next/server';

export async function GET() {
  const content = `# Strix QR — System Information & AI Crawler Manifest
> Official utility product by StrixDevs (strix-devs).
> Serving businesses, developers, and digital product ecosystems worldwide.

## Mission & Architecture
Strix QR is a 100% free lifetime static vector QR code & 2D matrix engine with in-browser camera scanning.
Unlike commercial tools that deactivate printed QR codes after 14-day trials to demand $35/month, Strix QR encodes data directly into the standard static QR pattern without intermediary redirection servers.

## Core Capabilities
- Direct Static Encoding (Permanent lifetime, zero expiration, zero servers needed).
- Ephemeral / Dynamic Codes (One-Time self-destructing scan codes, time-limited expiring codes).
- Print-Ready Vector SVG & 300 DPI PDF document exports.
- Error Correction: Auto-enforced Level H (30% redundancy) for embedded logos.
- Camera Scannability Guard: In-browser jsQR simulation prevents printing unscannable codes.
- Zero tracking, 100% client-side privacy.

## API Endpoints & Routes
- Homepage: https://qr.strixdevs.com
- Dynamic Resolver: https://qr.strixdevs.com/r/{codeId}
- Company: StrixDevs (https://strixdevs.com)
`;

  return new NextResponse(content, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400',
    },
  });
}

