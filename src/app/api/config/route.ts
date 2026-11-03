import { NextResponse } from 'next/server';

const config = {
  googleAnalyticsId: 'G-STRIX2026X',
  googleAnalyticsEnabled: false,
  googleTagManagerId: 'GTM-STRIX99',
  googleTagManagerEnabled: false,
  adSensePublisherId: 'ca-pub-9988776655443322',
  adSenseEnabled: false,
  adSlots: [
    {
      id: 'leaderboard',
      name: 'Top Header Leaderboard',
      dimensions: '728x90',
      enabled: false,
      adClient: '',
      adSlot: '',
      customHtml: '',
    },
    {
      id: 'sidebar',
      name: 'Preview Canvas Sticky Sidebar',
      dimensions: '300x250',
      enabled: false,
      adClient: '',
      adSlot: '',
      customHtml: '',
    },
  ],
};

export async function GET() {
  return NextResponse.json({ success: true, config });
}

export async function POST(request: Request) {
  try {
    const updates = await request.json();
    Object.assign(config, updates);
    return NextResponse.json({ success: true, config });
  } catch {
    return NextResponse.json({ error: 'Failed to update configuration' }, { status: 500 });
  }
}

