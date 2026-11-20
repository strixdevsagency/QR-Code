import { buildStrixEmailHtml } from './emailTemplateBuilder';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://qr.strixdevs.com';

export interface InquiryEmailData {
  name: string;
  email: string;
  company?: string;
  category: string;
  message: string;
}

export interface OrderEmailData {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  planName: string;
  interval: string;
  amount: string;
  paymentMethod?: string;
  notes?: string;
}

// 1. Client Confirmation: Inquiry Received
export function buildClientInquiryEmail(data: InquiryEmailData) {
  const subject = `Inquiry Confirmed: Welcome to Strix QR, ${data.name}`;
  const preheader = `We received your inquiry regarding ${data.category}. Our engineering team will follow up shortly.`;

  const contentHtml = `
    <div style="background-color: #181922; border: 1px solid #27272a; border-radius: 14px; padding: 20px; margin-bottom: 20px;">
      <div style="font-size: 13px; color: #71717a; text-transform: uppercase; font-weight: 700; letter-spacing: 0.05em; margin-bottom: 12px;">
        Inquiry Summary
      </div>
      <div style="font-size: 13px; color: #ffffff; margin-bottom: 8px;">
        <strong style="color: #a1a1aa;">Category:</strong> <span style="color: #38bdf8; font-weight: 600;">${data.category}</span>
      </div>
      ${data.company ? `
      <div style="font-size: 13px; color: #ffffff; margin-bottom: 8px;">
        <strong style="color: #a1a1aa;">Company / Brand:</strong> ${data.company}
      </div>` : ''}
      <div style="font-size: 13px; color: #ffffff; margin-bottom: 12px;">
        <strong style="color: #a1a1aa;">Email Address:</strong> ${data.email}
      </div>
      <div style="background-color: #121318; border: 1px solid #27272a; border-radius: 10px; padding: 14px; font-size: 13px; line-height: 1.6; color: #d4d4d8; white-space: pre-wrap;">
        ${data.message}
      </div>
    </div>
    <div style="font-size: 13px; color: #a1a1aa; line-height: 1.6;">
      Our engineers and account leads review every message personally. If your request is urgent or involves enterprise API access, you may also reply directly to this email.
    </div>
  `;

  const html = buildStrixEmailHtml({
    preheader,
    badgeText: 'Inquiry Received',
    title: `Hello ${data.name}, message received!`,
    subtitle: 'Thank you for contacting Strix QR. A representative from StrixDevs will review your message and reply within 24 hours.',
    contentHtml,
    ctaText: 'Explore Strix QR Studio',
    ctaUrl: BASE_URL,
    footerNote: 'You received this confirmation because a contact form was submitted on qr.strixdevs.com.',
  });

  return { subject, html };
}

// 2. Admin Alert: New Client Inquiry
export function buildAdminInquiryEmail(data: InquiryEmailData) {
  const subject = `[Client Lead] ${data.category} — ${data.name} (${data.company || 'Individual'})`;
  const preheader = `Inbound lead from ${data.name} (${data.email}). Message: ${data.message.substring(0, 80)}...`;

  const contentHtml = `
    <div style="background-color: #181922; border: 1px solid #27272a; border-radius: 14px; padding: 20px; margin-bottom: 20px;">
      <div style="font-size: 13px; color: #38bdf8; text-transform: uppercase; font-weight: 800; letter-spacing: 0.05em; margin-bottom: 12px;">
        Prospect Details
      </div>
      <div style="font-size: 13px; color: #ffffff; margin-bottom: 8px;">
        <strong style="color: #a1a1aa;">Name:</strong> ${data.name}
      </div>
      <div style="font-size: 13px; color: #ffffff; margin-bottom: 8px;">
        <strong style="color: #a1a1aa;">Email:</strong> <a href="mailto:${data.email}?subject=Re:%20Strix%20QR%20Inquiry%20(${data.category})" style="color: #38bdf8;">${data.email}</a>
      </div>
      <div style="font-size: 13px; color: #ffffff; margin-bottom: 8px;">
        <strong style="color: #a1a1aa;">Company:</strong> ${data.company || 'Not provided'}
      </div>
      <div style="font-size: 13px; color: #ffffff; margin-bottom: 12px;">
        <strong style="color: #a1a1aa;">Category:</strong> <span style="background-color: rgba(56, 189, 248, 0.15); color: #38bdf8; padding: 2px 8px; border-radius: 6px; font-weight: 700;">${data.category}</span>
      </div>
      <div style="background-color: #0e0f14; border: 1px solid #27272a; border-radius: 10px; padding: 14px; font-size: 13px; line-height: 1.6; color: #e4e4e7; white-space: pre-wrap;">
        ${data.message}
      </div>
    </div>
    <div style="text-align: center; margin-top: 15px;">
      <a href="mailto:${data.email}?subject=Strix%20QR%20Inquiry%20Response%20(${data.category})" style="display: inline-block; background-color: #27272a; color: #ffffff; border: 1px solid #3f3f46; font-size: 13px; font-weight: 600; padding: 10px 20px; border-radius: 10px;">
        Direct Reply to ${data.email}
      </a>
    </div>
  `;

  const html = buildStrixEmailHtml({
    preheader,
    badgeText: 'New Client Inquiry',
    title: `Inbound Message: ${data.name}`,
    subtitle: `Received on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()} UTC`,
    contentHtml,
    ctaText: 'Open Operator CRM',
    ctaUrl: `${BASE_URL}/`,
  });

  return { subject, html };
}

// 3. Client Confirmation: Pro / Team Order Request Received
export function buildClientOrderEmail(data: OrderEmailData) {
  const subject = `Order Request Received: Strix QR ${data.planName}`;
  const preheader = `Thank you for choosing Strix QR Pro (${data.interval}). A billing engineer will contact you shortly with your activation key.`;

  const contentHtml = `
    <div style="background-color: #181922; border: 1px solid #27272a; border-radius: 14px; padding: 20px; margin-bottom: 20px;">
      <div style="font-size: 13px; color: #34d399; text-transform: uppercase; font-weight: 800; letter-spacing: 0.05em; margin-bottom: 12px;">
        ✓ Subscription Request Registered
      </div>
      <div style="font-size: 15px; color: #ffffff; font-weight: 800; margin-bottom: 12px;">
        ${data.planName} <span style="color: #38bdf8;">(${data.interval.toUpperCase()})</span> — ${data.amount}
      </div>
      <div style="font-size: 13px; color: #ffffff; margin-bottom: 8px;">
        <strong style="color: #a1a1aa;">Customer Name:</strong> ${data.name}
      </div>
      <div style="font-size: 13px; color: #ffffff; margin-bottom: 8px;">
        <strong style="color: #a1a1aa;">Contact Email:</strong> ${data.email}
      </div>
      ${data.phone ? `
      <div style="font-size: 13px; color: #ffffff; margin-bottom: 8px;">
        <strong style="color: #a1a1aa;">Phone / WhatsApp:</strong> <span style="color: #34d399; font-weight: 600;">${data.phone}</span>
      </div>` : ''}
    </div>
    <div style="background-color: #121318; border: 1px solid #27272a; border-radius: 12px; padding: 18px; margin-bottom: 20px; font-size: 13px; line-height: 1.6; color: #d4d4d8;">
      <strong style="color: #38bdf8;">What happens next?</strong><br>
      As a boutique dev studio, we manually coordinate billing to ensure smooth onboarding. A Strix Devs engineer will reach out to you directly with convenient payment settlement options (wire, transfer, card, or PayPal). Once confirmed, your unique Pro Activation Voucher code will be delivered instantly.
    </div>
  `;

  const html = buildStrixEmailHtml({
    preheader,
    badgeText: 'Order Inquiry Confirmed',
    title: `Thank you for your order, ${data.name}!`,
    subtitle: `We received your request for ${data.planName}. We are preparing your dedicated setup.`,
    contentHtml,
    ctaText: 'Visit Strix QR Studio',
    ctaUrl: BASE_URL,
    footerNote: 'Questions regarding your order? Simply reply directly to this email.',
  });

  return { subject, html };
}

// 4. Admin Alert: New Pro / Team Order Request
export function buildAdminOrderEmail(data: OrderEmailData) {
  const subject = `🔥 [New Order Request] ${data.planName} (${data.interval}) — ${data.name} (${data.amount})`;
  const preheader = `New order from ${data.name} (${data.email}). Phone: ${data.phone || 'None'}. Amount: ${data.amount}.`;

  const whatsappLink = data.phone
    ? `https://wa.me/${data.phone.replace(/[^0-9]/g, '')}`
    : null;

  const contentHtml = `
    <div style="background-color: #181922; border: 1px solid #27272a; border-radius: 14px; padding: 20px; margin-bottom: 20px;">
      <div style="font-size: 16px; font-weight: 800; color: #38bdf8; margin-bottom: 12px;">
        ${data.planName} (${data.interval}) — ${data.amount}
      </div>
      <div style="font-size: 13px; color: #ffffff; margin-bottom: 8px;">
        <strong style="color: #a1a1aa;">Customer:</strong> ${data.name}
      </div>
      <div style="font-size: 13px; color: #ffffff; margin-bottom: 8px;">
        <strong style="color: #a1a1aa;">Email:</strong> <a href="mailto:${data.email}?subject=Strix%20QR%20Pro%20Order%20Activation" style="color: #38bdf8;">${data.email}</a>
      </div>
      <div style="font-size: 13px; color: #ffffff; margin-bottom: 8px;">
        <strong style="color: #a1a1aa;">Phone / WhatsApp:</strong> ${data.phone ? `<a href="${whatsappLink}" style="color: #34d399; font-weight: 700;">${data.phone} (Open WhatsApp)</a>` : 'Not provided'}
      </div>
      ${data.notes ? `
      <div style="margin-top: 12px; background-color: #0c0d12; border: 1px solid #27272a; border-radius: 8px; padding: 12px; font-size: 12px; color: #e4e4e7;">
        <strong style="color: #a1a1aa;">Customer Notes:</strong><br>${data.notes}
      </div>` : ''}
    </div>
    <div style="margin: 20px 0; text-align: center;">
      <a href="mailto:${data.email}?subject=Strix%20QR%20Pro%20Order%20Payment%20Details" style="display: inline-block; background-color: #27272a; color: #ffffff; border: 1px solid #3f3f46; font-size: 13px; font-weight: 600; padding: 10px 18px; border-radius: 10px; margin-right: 8px;">
        Email Customer
      </a>
      ${whatsappLink ? `
      <a href="${whatsappLink}" target="_blank" style="display: inline-block; background-color: #059669; color: #ffffff; font-size: 13px; font-weight: 600; padding: 10px 18px; border-radius: 10px;">
        Chat on WhatsApp
      </a>` : ''}
    </div>
  `;

  const html = buildStrixEmailHtml({
    preheader,
    badgeText: 'Action Required',
    title: `Inbound Subscription Order`,
    subtitle: `Payment settlement needed. Issue a license code in Admin CRM once confirmed.`,
    contentHtml,
    ctaText: 'Open Customer Orders CRM',
    ctaUrl: `${BASE_URL}/`,
  });

  return { subject, html };
}
