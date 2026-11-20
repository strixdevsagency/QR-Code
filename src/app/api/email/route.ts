import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit } from '@/utils/security';
import {
  sendWelcomeEmail,
  sendScanAlertEmail,
  sendProUpgradeEmail,
  sendContactInquiryEmail,
  sendManualProOrderEmail,
} from '@/services/email';

export async function POST(req: NextRequest) {
  // 1. IP rate limiting (max 10 requests per minute per IP to prevent spamming)
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1';
  const { allowed, remaining, resetInSeconds } = checkRateLimit(`email:${ip}`, {
    limit: 10,
    windowSeconds: 60,
  });

  if (!allowed) {
    return NextResponse.json(
      { error: `Too many email requests. Try again in ${resetInSeconds} seconds.` },
      {
        status: 429,
        headers: {
          'Retry-After': String(resetInSeconds),
          'X-RateLimit-Remaining': String(remaining),
        },
      }
    );
  }

  try {
    const body = await req.json();
    const {
      action,
      type,
      to,
      email,
      name,
      phone,
      company,
      category,
      message,
      qrTitle,
      scanCount,
      location,
      device,
      planName,
      amount,
      amountPaid,
      interval,
      paymentMethod,
      notes,
    } = body;

    // A. Manual Pro Subscription Order Request Handler
    if (action === 'manual_pro_order' || type === 'manual_pro_order') {
      const customerEmail = email || to;
      if (!customerEmail || typeof customerEmail !== 'string' || !customerEmail.includes('@')) {
        return NextResponse.json({ error: 'Valid customer email address is required.' }, { status: 400 });
      }

      const result = await sendManualProOrderEmail({
        name: name || 'Creator',
        email: customerEmail,
        phone,
        planName: planName || 'Strix QR Pro',
        interval: interval || 'annual',
        amount: amount || amountPaid || '$79.00/year',
        paymentMethod: paymentMethod || 'Direct Contact / Manual Invoice',
        company,
        notes,
      });

      return NextResponse.json({
        success: result.success,
        messageId: result.messageId,
        simulated: result.simulated,
      });
    }

    // B. Contact Inquiry Form Handler
    if (action === 'contact_inquiry' || type === 'contact') {
      const contactEmail = email || to;
      if (!contactEmail || typeof contactEmail !== 'string' || !contactEmail.includes('@')) {
        return NextResponse.json({ error: 'Valid contact email address is required.' }, { status: 400 });
      }
      if (!message || typeof message !== 'string') {
        return NextResponse.json({ error: 'Inquiry message cannot be empty.' }, { status: 400 });
      }

      const result = await sendContactInquiryEmail({
        name: name || 'Anonymous',
        email: contactEmail,
        company,
        category: category || 'General Inquiry',
        message,
      });

      return NextResponse.json({
        success: result.success,
        messageId: result.messageId,
        simulated: result.simulated,
      });
    }

    // C. Direct Recipient Verification
    const recipient = to || email;
    if (!recipient || typeof recipient !== 'string' || !recipient.includes('@')) {
      return NextResponse.json({ error: 'Valid recipient email address is required.' }, { status: 400 });
    }

    let result;
    if (type === 'welcome') {
      result = await sendWelcomeEmail({ to: recipient, name });
    } else if (type === 'scan_alert') {
      result = await sendScanAlertEmail({
        to: recipient,
        qrTitle: qrTitle || 'Dynamic QR',
        scanCount: scanCount || 1,
        location,
        device,
      });
    } else if (type === 'upgrade_receipt') {
      result = await sendProUpgradeEmail({
        to: recipient,
        name,
        planName: planName || 'Pro Annual',
        amountPaid: amountPaid || '$79.00',
      });
    } else {
      return NextResponse.json({ error: `Unsupported email template type: ${type}` }, { status: 400 });
    }

    return NextResponse.json({
      success: result.success,
      messageId: result.messageId,
      simulated: result.simulated,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to dispatch email' }, { status: 500 });
  }
}
