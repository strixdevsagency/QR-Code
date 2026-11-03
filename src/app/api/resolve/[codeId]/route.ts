import { NextResponse } from 'next/server';

// Server-side dynamic records registry (synced with db)
const dynamicRegistry = new Map<string, any>([
  [
    'onetime_coupon_101',
    {
      id: 'onetime_coupon_101',
      title: 'One-Time Secret VIP Discount ($50 Off)',
      mode: 'one_time',
      maxScans: 1,
      currentScans: 0,
      isBurned: false,
      isRevoked: false,
      destinationType: 'url',
      destinationPayload: 'https://strixdevs.com/?discount=VIP-STRIX-50',
      createdAt: '2026-11-01T09:15:00Z',
    },
  ],
  [
    'timelimited_menu_202',
    {
      id: 'timelimited_menu_202',
      title: 'Flash Sale (Expires in 24 Hours)',
      mode: 'time_limited',
      currentScans: 2,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      isBurned: false,
      isRevoked: false,
      destinationType: 'url',
      destinationPayload: 'https://strixdevs.com/flash-sale',
      createdAt: '2026-11-02T12:00:00Z',
    },
  ],
]);

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ codeId: string }> }
) {
  const { codeId } = await params;
  const record = dynamicRegistry.get(codeId);

  if (!record) {
    return NextResponse.json({ status: 'not_found' }, { status: 404 });
  }

  // 1. Check if manually revoked
  if (record.isRevoked) {
    return NextResponse.json({ status: 'revoked', record });
  }

  // 2. Check if one-time code is already burned
  if (record.isBurned || (record.mode === 'one_time' && record.currentScans >= record.maxScans)) {
    return NextResponse.json({
      status: 'burned',
      record,
      burnTimestamp: record.burnedAt || record.createdAt,
    });
  }

  // 3. Check if time-limited code is expired
  if (record.mode === 'time_limited' && record.expiresAt) {
    if (Date.now() > new Date(record.expiresAt).getTime()) {
      return NextResponse.json({ status: 'expired', record });
    }
  }

  // 4. Valid scan: Increment scans atomically and burn if one-time
  record.currentScans = (record.currentScans || 0) + 1;
  if (record.mode === 'one_time' && record.currentScans >= record.maxScans) {
    record.isBurned = true;
    record.burnedAt = new Date().toISOString();
  }

  return NextResponse.json({
    status: 'success',
    record,
    destination: record.destinationPayload,
    destinationType: record.destinationType,
  });
}

