import { NextResponse } from 'next/server';
import { checkRateLimit } from '@/utils/security';
import { resolveDynamicQR } from '@/services/qrRegistry';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ codeId: string }> }
) {
  // 0. API Rate Limiting (120 requests/minute per IP)
  const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1';
  const { allowed, resetInSeconds } = checkRateLimit(`resolver:${clientIp}`, {
    limit: 120,
    windowSeconds: 60,
  });

  if (!allowed) {
    return NextResponse.json(
      { error: `Too many scan requests. Rate limited for ${resetInSeconds}s.` },
      { status: 429, headers: { 'Retry-After': String(resetInSeconds) } }
    );
  }

  const { codeId } = await params;
  const url = new URL(request.url);
  const enteredPin = url.searchParams.get('pin') || undefined;
  const userAgent = request.headers.get('user-agent') || undefined;

  // Resolve real dynamic QR code from Cloud Registry & Supabase
  const result = await resolveDynamicQR(codeId, {
    pin: enteredPin,
    userAgent,
  });

  if (result.status === 'not_found') {
    return NextResponse.json({ status: 'not_found' }, { status: 404 });
  }

  if (result.status === 'blocked') {
    return NextResponse.json(
      { status: 'blocked', error: result.error || 'Destination blocked' },
      { status: 400 }
    );
  }

  if (result.status === 'pin_required') {
    return NextResponse.json({ status: 'pin_required', record: result.record }, { status: 403 });
  }

  return NextResponse.json(result, {
    headers: {
      'Cache-Control': 'public, s-maxage=5, stale-while-revalidate=30',
    },
  });
}
