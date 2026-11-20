import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit } from '@/utils/security';
import { PRICING_PLANS } from '@/services/payment';
import { UserTier } from '@/types';

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1';
  const { allowed, remaining, resetInSeconds } = checkRateLimit(`checkout:${ip}`, {
    limit: 10,
    windowSeconds: 60,
  });

  if (!allowed) {
    return NextResponse.json(
      { error: `Too many requests. Try again in ${resetInSeconds} seconds.` },
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
    const { planId, interval = 'annual', userEmail, userId } = body;

    const validPlan: UserTier = planId === 'enterprise' ? 'enterprise' : 'pro';
    const plan = PRICING_PLANS[validPlan];

    const stripeSecret = process.env.STRIPE_SECRET_KEY;
    const lemonSecret = process.env.LEMON_SQUEEZY_API_KEY;

    // 1. Stripe Checkout Flow
    if (stripeSecret) {
      try {
        // Dynamic import / fetch Stripe Checkout API
        const priceAmount = interval === 'annual' ? plan.annualBilledTotal * 100 : plan.priceMonthly * 100;
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://qr.strixdevs.com';

        const stripeRes = await fetch('https://api.stripe.com/v1/checkout/sessions', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${stripeSecret}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            'payment_method_types[0]': 'card',
            mode: 'subscription',
            'line_items[0][price_data][currency]': 'usd',
            'line_items[0][price_data][product_data][name]': `Strix QR ${plan.name} (${interval})`,
            'line_items[0][price_data][recurring][interval]': interval === 'annual' ? 'year' : 'month',
            'line_items[0][price_data][unit_amount]': String(priceAmount),
            'line_items[0][quantity]': '1',
            success_url: `${appUrl}/?session_id={CHECKOUT_SESSION_ID}&upgrade=success`,
            cancel_url: `${appUrl}/?upgrade=cancel`,
            ...(userEmail ? { customer_email: userEmail } : {}),
            ...(userId ? { 'client_reference_id': userId } : {}),
          }),
        });

        const session = await stripeRes.json();
        if (session.url) {
          return NextResponse.json({ checkoutUrl: session.url, provider: 'stripe' });
        }
      } catch (stripeErr: any) {
        console.error('Stripe API error:', stripeErr);
      }
    }

    // 2. Lemon Squeezy Flow (Merchant of Record alternative)
    if (lemonSecret && process.env.LEMON_SQUEEZY_STORE_ID) {
      // Return custom store checkout URL
      const storeId = process.env.LEMON_SQUEEZY_STORE_ID;
      return NextResponse.json({
        checkoutUrl: `https://strixqr.lemonsqueezy.com/buy/${validPlan}?checkout[custom][user_id]=${userId || ''}`,
        provider: 'lemon_squeezy',
      });
    }

    // 3. Fallback / Test Simulation Mode
    // Allows testing the subscription upgrade flow without requiring live Stripe credentials
    return NextResponse.json({
      checkoutUrl: null,
      provider: 'simulated',
      message: 'Payment gateway not yet connected in environment variables. Upgrading in simulation mode.',
      plan: {
        id: validPlan,
        name: plan.name,
        price: interval === 'annual' ? `$${plan.annualBilledTotal}/year` : `$${plan.priceMonthly}/month`,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to initiate checkout' }, { status: 500 });
  }
}
