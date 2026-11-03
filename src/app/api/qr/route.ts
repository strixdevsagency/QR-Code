import { NextResponse } from 'next/server';

// Server-side in-memory QR store
const qrcodes: any[] = [
  {
    id: 'onetime_coupon_101',
    userId: 'user_demo',
    title: 'One-Time Secret VIP Discount ($50 Off)',
    qrType: 'url',
    payload: 'https://strixdevs.com/r/onetime_coupon_101',
    design: {
      dotsType: 'classy',
      dotsColor: '#1e293b',
      isGradient: true,
      dotsColorEnd: '#4f46e5',
      gradientType: 'linear',
      cornerSquareType: 'extra-rounded',
      cornerSquareColor: '#4f46e5',
      cornerDotType: 'dot',
      cornerDotColor: '#4f46e5',
      backgroundColor: '#ffffff',
      margin: 8,
      logoSize: 0.35,
      validityTerm: 'lifetime',
    },
    downloadCount: 38,
    createdAt: '2026-11-01T09:15:00Z',
    isDynamic: true,
    dynamicConfig: {
      mode: 'one_time',
      maxScans: 1,
      currentScans: 0,
      isBurned: false,
      isRevoked: false,
      destinationType: 'url',
      destinationPayload: 'https://strixdevs.com/?discount=VIP-STRIX-50',
    },
  },
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (userId) {
    const userQrs = qrcodes.filter((q) => q.userId === userId);
    return NextResponse.json({ success: true, qrs: userQrs });
  }

  return NextResponse.json({ success: true, qrs: qrcodes });
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const newQR = {
      id: data.id || `sqr_${Date.now()}`,
      userId: data.userId || 'anonymous',
      title: data.title || 'Untitled QR',
      qrType: data.qrType || 'url',
      payload: data.payload || '',
      design: data.design,
      downloadCount: 0,
      createdAt: new Date().toISOString(),
      isDynamic: Boolean(data.isDynamic),
      dynamicConfig: data.dynamicConfig,
    };

    if (newQR.isDynamic) {
      newQR.payload = `/r/${newQR.id}`;
    }

    qrcodes.unshift(newQR);
    return NextResponse.json({ success: true, qr: newQR });
  } catch {
    return NextResponse.json({ error: 'Failed to save QR' }, { status: 500 });
  }
}

