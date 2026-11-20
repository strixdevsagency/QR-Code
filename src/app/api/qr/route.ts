import { NextResponse } from 'next/server';
import { checkRateLimit, sanitizeText, validateRedirectUrl } from '@/utils/security';
import { registerQRCode } from '@/services/qrRegistry';
import { getDynamicQRUrl } from '@/utils/url';

// Server-side in-memory QR store (fallback)
const qrcodes: any[] = [];

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
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1';
  const { allowed, resetInSeconds } = checkRateLimit(`qr_create:${ip}`, {
    limit: 60,
    windowSeconds: 60,
  });

  if (!allowed) {
    return NextResponse.json(
      { error: `Too many QR operations. Try again in ${resetInSeconds} seconds.` },
      { status: 429 }
    );
  }

  try {
    const data = await request.json();

    // Validate dynamic destination if url
    if (data.isDynamic && data.dynamicConfig?.destinationType === 'url') {
      const safety = validateRedirectUrl(data.dynamicConfig.destinationPayload);
      if (!safety.safe) {
        return NextResponse.json(
          { error: `Dynamic destination blocked: ${safety.reason}` },
          { status: 400 }
        );
      }
    }

    const newQR = {
      id: data.id || `sqr_${Date.now()}`,
      userId: data.userId || 'anonymous',
      title: sanitizeText(data.title || 'Untitled QR', 100),
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
    await registerQRCode(newQR as any);
    return NextResponse.json({ success: true, qr: newQR });
  } catch {
    return NextResponse.json({ error: 'Failed to save QR' }, { status: 500 });
  }
}

