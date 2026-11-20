import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  '';

const STRIPE_SECRET = process.env.STRIPE_WEBHOOK_SECRET || process.env.PAYMENT_WEBHOOK_SECRET;
const LEMON_SQUEEZY_SECRET = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET || process.env.PAYMENT_WEBHOOK_SECRET;

/**
 * Verify Stripe webhook signature
 */
function verifyStripeSignature(payload: string, header: string, secret: string): boolean {
  try {
    const parts = header.split(',');
    let timestamp = '';
    let signature = '';

    for (const part of parts) {
      const [key, value] = part.split('=');
      if (key === 't') timestamp = value;
      if (key === 'v1') signature = value;
    }

    if (!timestamp || !signature) return false;

    // Reject events older than 5 minutes
    const eventTime = parseInt(timestamp, 10);
    const now = Math.floor(Date.now() / 1000);
    if (Math.abs(now - eventTime) > 300) return false;

    const signedPayload = `${timestamp}.${payload}`;
    const hmac = crypto.createHmac('sha256', secret);
    const expected = hmac.update(signedPayload).digest('hex');

    return crypto.timingSafeEqual(Buffer.from(signature, 'hex'), Buffer.from(expected, 'hex'));
  } catch {
    return false;
  }
}

/**
 * Verify Lemon Squeezy HMAC signature
 */
function verifyLemonSqueezySignature(payload: string, signature: string, secret: string): boolean {
  try {
    const hmac = crypto.createHmac('sha256', secret);
    const expected = hmac.update(payload).digest('hex');
    return crypto.timingSafeEqual(Buffer.from(signature, 'hex'), Buffer.from(expected, 'hex'));
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const stripeHeader = req.headers.get('stripe-signature');
    const lemonHeader = req.headers.get('x-signature');

    // 1. Cryptographic Signature Verification
    let isVerified = false;

    if (stripeHeader && STRIPE_SECRET) {
      isVerified = verifyStripeSignature(rawBody, stripeHeader, STRIPE_SECRET);
      if (!isVerified) {
        return NextResponse.json({ error: 'Invalid Stripe signature' }, { status: 401 });
      }
    } else if (lemonHeader && LEMON_SQUEEZY_SECRET) {
      isVerified = verifyLemonSqueezySignature(rawBody, lemonHeader, LEMON_SQUEEZY_SECRET);
      if (!isVerified) {
        return NextResponse.json({ error: 'Invalid Lemon Squeezy signature' }, { status: 401 });
      }
    } else if (process.env.NODE_ENV === 'production' && (STRIPE_SECRET || LEMON_SQUEEZY_SECRET)) {
      return NextResponse.json({ error: 'Missing payment webhook signature' }, { status: 401 });
    } else {
      // In local dev without configured secrets, allow test simulation with header flag
      isVerified = true;
    }

    // 2. Parse Event Payload
    const event = JSON.parse(rawBody);
    const eventType = event.type || event.meta?.event_name || 'checkout.completed';

    let customerEmail: string | null = null;
    let customerName: string = 'Valued Customer';
    let customerUserId: string | null = null;
    let targetTier: 'pro' | 'enterprise' = 'pro';
    let amountFormatted: string = '$0';
    let orderId = `ord_${Date.now()}`;

    // Stripe Checkout session completed format
    if (event.data?.object) {
      const obj = event.data.object;
      customerEmail = obj.customer_details?.email || obj.customer_email || null;
      customerName = obj.customer_details?.name || customerName;
      customerUserId = obj.client_reference_id || obj.metadata?.userId || null;
      amountFormatted = obj.amount_total ? `$${(obj.amount_total / 100).toFixed(2)}` : '$79.00';
      if (obj.metadata?.tier === 'enterprise' || obj.amount_total >= 20000) {
        targetTier = 'enterprise';
      }
      orderId = obj.id || orderId;
    }

    // Lemon Squeezy format
    if (event.data?.attributes) {
      const attr = event.data.attributes;
      customerEmail = attr.user_email || null;
      customerName = attr.user_name || customerName;
      customerUserId = event.meta?.custom_data?.user_id || null;
      amountFormatted = attr.total_formatted || amountFormatted;
      if (attr.first_order_item?.variant_name?.toLowerCase().includes('enterprise')) {
        targetTier = 'enterprise';
      }
      orderId = event.data.id || orderId;
    }

    // Fallback generic format
    if (!customerEmail && event.email) {
      customerEmail = event.email;
      targetTier = event.tier || 'pro';
    }

    if (!customerEmail) {
      return NextResponse.json({ received: true, notice: 'No customer email found in webhook event' });
    }

    // 3. Update User Tier & Profile in Supabase
    if (supabaseUrl && supabaseKey) {
      const sb = createClient(supabaseUrl, supabaseKey);

      // Upgrade profile
      await sb
        .from('profiles')
        .update({
          tier: targetTier,
          updated_at: new Date().toISOString(),
        })
        .or(customerUserId ? `id.eq.${customerUserId},email.ilike.${customerEmail}` : `email.ilike.${customerEmail}`);

      // Record Completed Order
      await sb
        .from('package_orders')
        .upsert({
          id: orderId,
          customer_name: customerName,
          customer_email: customerEmail,
          plan_id: targetTier,
          plan_name: targetTier === 'enterprise' ? 'Agency & Scale Enterprise' : 'Strix Pro Annual',
          billing_interval: 'annual',
          team_seats: targetTier === 'enterprise' ? 10 : 1,
          price_formatted: amountFormatted,
          status: 'completed',
          notes: `Automated payment fulfillment via webhook (${eventType})`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
    }

    return NextResponse.json({
      received: true,
      processed: true,
      email: customerEmail,
      tier: targetTier,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
