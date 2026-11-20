/**
 * Strix QR — Transactional Email Service
 * Supports Resend, Supabase Auth SMTP, and custom mail transports.
 */

export interface EmailRecipient {
  to: string;
  name?: string;
}

export interface EmailResult {
  success: boolean;
  messageId?: string;
  simulated?: boolean;
  error?: string;
}

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const DEFAULT_FROM_EMAIL = process.env.EMAIL_FROM || 'Strix QR <notifications@strixdevs.com>';

/**
 * Low-level email dispatcher using Resend API (or simulation in local dev)
 */
async function sendRawEmail({
  to,
  subject,
  html,
  text,
}: {
  to: string;
  subject: string;
  html: string;
  text: string;
}): Promise<EmailResult> {
  if (!RESEND_API_KEY) {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[Email Simulated] To: ${to} | Subject: "${subject}"`);
    }
    return {
      success: true,
      simulated: true,
      messageId: `sim_${Date.now()}`,
    };
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: DEFAULT_FROM_EMAIL,
        to: [to],
        subject,
        html,
        text,
      }),
    });

    if (!res.ok) {
      const errorJson = await res.json().catch(() => ({}));
      return {
        success: false,
        error: errorJson.message || `Resend HTTP ${res.status}`,
      };
    }

    const data = await res.json();
    return {
      success: true,
      messageId: data.id,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Unknown network error while sending email',
    };
  }
}

/**
 * 1. Welcome Email on Account Creation
 */
export async function sendWelcomeEmail({ to, name }: EmailRecipient): Promise<EmailResult> {
  const userName = name || 'Creator';
  const subject = `Welcome to Strix QR, ${userName}! 🦅`;
  const text = `Hi ${userName},\n\nWelcome to Strix QR. You now have access to high-fidelity static and dynamic QR code generation, scannability verification, and vector downloads.\n\nStart creating: https://qr.strixdevs.com/\n\nThe Strix QR Team`;

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #09090b; color: #f4f4f5; padding: 40px 24px; border-radius: 16px; border: 1px solid #27272a;">
      <div style="margin-bottom: 24px;">
        <span style="font-size: 20px; font-weight: 800; letter-spacing: -0.03em; color: #ffffff;">STRIX <span style="color: #60a5fa;">QR</span></span>
      </div>
      <h1 style="font-size: 22px; font-weight: 700; color: #ffffff; margin-bottom: 12px;">Welcome aboard, ${userName}!</h1>
      <p style="font-size: 14px; line-height: 1.6; color: #a1a1aa; margin-bottom: 24px;">
        Your Strix QR studio is ready. You can now generate high-resolution print-ready codes, manage dynamic redirects without re-printing, and verify real-time scannability.
      </p>
      <div style="margin-bottom: 32px;">
        <a href="https://qr.strixdevs.com/" style="display: inline-block; background-color: #ffffff; color: #09090b; padding: 12px 24px; border-radius: 10px; font-size: 14px; font-weight: 600; text-decoration: none;">
          Open Your Studio →
        </a>
      </div>
      <hr style="border: none; border-top: 1px solid #27272a; margin: 24px 0;" />
      <p style="font-size: 12px; color: #71717a;">
        Need help or have custom enterprise inquiries? Reply directly to this email or visit <a href="https://qr.strixdevs.com" style="color: #60a5fa; text-decoration: none;">strixdevs.com</a>.
      </p>
    </div>
  `;

  return sendRawEmail({ to, subject, html, text });
}

/**
 * 2. Real-Time Dynamic QR Scan Alert
 */
export async function sendScanAlertEmail({
  to,
  qrTitle,
  scanCount,
  device,
  location,
}: {
  to: string;
  qrTitle: string;
  scanCount: number;
  device?: string;
  location?: string;
}): Promise<EmailResult> {
  const subject = `Scan Activity Alert: "${qrTitle}" reached ${scanCount} scans`;
  const text = `Your dynamic QR code "${qrTitle}" was just scanned!\nTotal Scans: ${scanCount}\nDevice: ${device || 'Mobile Browser'}\nLocation: ${location || 'Global Edge'}\n\nView details: https://qr.strixdevs.com/`;

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #09090b; color: #f4f4f5; padding: 36px 24px; border-radius: 16px; border: 1px solid #27272a;">
      <h2 style="font-size: 18px; font-weight: 700; color: #ffffff; margin-bottom: 12px;">📊 QR Code Scan Milestone</h2>
      <p style="font-size: 14px; color: #a1a1aa; line-height: 1.5; margin-bottom: 20px;">
        Your dynamic QR code <strong style="color: #ffffff;">"${qrTitle}"</strong> recorded a new scan.
      </p>
      <div style="background-color: #18181b; border: 1px solid #27272a; border-radius: 12px; padding: 16px; margin-bottom: 24px;">
        <div style="font-size: 12px; color: #a1a1aa; margin-bottom: 6px;">Total Lifetime Scans: <strong style="color: #34d399; font-size: 15px;">${scanCount}</strong></div>
        <div style="font-size: 12px; color: #a1a1aa; margin-bottom: 6px;">Device: <span style="color: #ffffff;">${device || 'Mobile'}</span></div>
        <div style="font-size: 12px; color: #a1a1aa;">Estimated Location: <span style="color: #ffffff;">${location || 'Detected'}</span></div>
      </div>
      <a href="https://qr.strixdevs.com/" style="display: inline-block; background-color: #27272a; color: #ffffff; border: 1px solid #3f3f46; padding: 10px 20px; border-radius: 8px; font-size: 13px; font-weight: 500; text-decoration: none;">
        Open Vault Dashboard
      </a>
    </div>
  `;

  return sendRawEmail({ to, subject, html, text });
}

/**
 * 3. Pro Upgrade Confirmation / Receipt
 */
export async function sendProUpgradeEmail({
  to,
  name,
  planName,
  amountPaid,
}: {
  to: string;
  name?: string;
  planName: string;
  amountPaid: string;
}): Promise<EmailResult> {
  const userName = name || 'Customer';
  const subject = `Welcome to Strix QR Pro — Payment Confirmed (${planName})`;
  const text = `Hi ${userName},\n\nYour upgrade to ${planName} is confirmed! Payment of ${amountPaid} was processed successfully.\n\nAll Pro features including unlimited dynamic QRs, 300+ DPI vector exports, smart routing, and ad-free access are unlocked.\n\nThank you for choosing Strix QR.`;

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #09090b; color: #f4f4f5; padding: 40px 24px; border-radius: 16px; border: 1px solid #27272a;">
      <h1 style="font-size: 20px; font-weight: 700; color: #ffffff; margin-bottom: 12px;">🌟 Payment Confirmed: Welcome to ${planName}!</h1>
      <p style="font-size: 14px; line-height: 1.6; color: #a1a1aa; margin-bottom: 24px;">
        Thank you for upgrading, ${userName}. Your Pro subscription is now active with all limits removed.
      </p>
      <div style="background-color: #18181b; border: 1px solid #27272a; border-radius: 12px; padding: 16px; margin-bottom: 24px;">
        <div style="font-size: 13px; color: #ffffff; margin-bottom: 8px;"><strong>Plan:</strong> ${planName}</div>
        <div style="font-size: 13px; color: #ffffff;"><strong>Amount:</strong> ${amountPaid}</div>
      </div>
      <a href="https://qr.strixdevs.com/" style="display: inline-block; background-color: #3b82f6; color: #ffffff; padding: 12px 24px; border-radius: 10px; font-size: 14px; font-weight: 600; text-decoration: none;">
        Launch Pro Studio →
      </a>
    </div>
  `;

  return sendRawEmail({ to, subject, html, text });
}

/**
 * 4. User Contact & Collaboration Inquiry Notification
 */
export async function sendContactInquiryEmail({
  name,
  email,
  company,
  category,
  message,
}: {
  name: string;
  email: string;
  company?: string;
  category: string;
  message: string;
}): Promise<EmailResult> {
  const recipient = process.env.CONTACT_EMAIL || 'support@strixdevs.com';
  const subject = `[Strix QR Inquiry] ${category} - ${name} (${company || 'Individual'})`;
  const text = `New Contact Inquiry received on Strix QR:\n\nName: ${name}\nEmail: ${email}\nCompany: ${company || 'N/A'}\nCategory: ${category}\n\nMessage:\n${message}\n\nSubmitted at: ${new Date().toISOString()}`;

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background-color: #09090b; color: #f4f4f5; padding: 36px 24px; border-radius: 16px; border: 1px solid #27272a;">
      <div style="margin-bottom: 20px;">
        <span style="font-size: 18px; font-weight: 800; color: #ffffff;">STRIX <span style="color: #38bdf8;">[ QR ]</span></span>
        <span style="font-size: 12px; color: #71717a; margin-left: 8px;">New Contact & Collaboration Inquiry</span>
      </div>
      <div style="background-color: #18181b; border: 1px solid #27272a; border-radius: 12px; padding: 18px; margin-bottom: 20px;">
        <div style="font-size: 13px; margin-bottom: 8px;"><strong style="color: #a1a1aa;">Name:</strong> <span style="color: #ffffff;">${name}</span></div>
        <div style="font-size: 13px; margin-bottom: 8px;"><strong style="color: #a1a1aa;">Email:</strong> <a href="mailto:${email}" style="color: #38bdf8; text-decoration: none;">${email}</a></div>
        <div style="font-size: 13px; margin-bottom: 8px;"><strong style="color: #a1a1aa;">Company:</strong> <span style="color: #ffffff;">${company || 'N/A'}</span></div>
        <div style="font-size: 13px;"><strong style="color: #a1a1aa;">Category:</strong> <span style="color: #38bdf8; font-weight: 600;">${category}</span></div>
      </div>
      <div style="background-color: #12131a; border: 1px solid #27272a; border-radius: 12px; padding: 18px; margin-bottom: 20px;">
        <div style="font-size: 12px; color: #71717a; margin-bottom: 6px; text-transform: uppercase; font-weight: 700; letter-spacing: 0.05em;">Message Content</div>
        <div style="font-size: 14px; line-height: 1.6; color: #e4e4e7; white-space: pre-wrap;">${message}</div>
      </div>
      <div style="font-size: 12px; color: #71717a;">
        Direct reply to this email will contact: <a href="mailto:${email}" style="color: #38bdf8;">${email}</a>
      </div>
    </div>
  `;

  return sendRawEmail({ to: recipient, subject, html, text });
}

/**
 * 5. Manual Pro Subscription Order Request
 * Used when automated merchant gateways are unconfigured: sends customer order details to StrixDevs billing.
 */
export async function sendManualProOrderEmail({
  name,
  email,
  phone,
  planName,
  interval,
  amount,
  paymentMethod,
  company,
  notes,
}: {
  name: string;
  email: string;
  phone?: string;
  planName: string;
  interval: string;
  amount: string;
  paymentMethod?: string;
  company?: string;
  notes?: string;
}): Promise<EmailResult> {
  const recipient = process.env.BILLING_EMAIL || process.env.CONTACT_EMAIL || 'billing@strixdevs.com';
  const subject = `[Strix QR Pro Order] ${planName} (${interval}) - ${name}`;
  const text = `New Pro Subscription Order Request:\n\nCustomer: ${name} (${email})\nPhone/WhatsApp: ${phone || 'Not provided'}\nCompany: ${company || 'Individual / Independent'}\nPlan: ${planName} (${interval})\nAmount: ${amount}\nNotes: ${notes || 'None'}\n\nSubmitted at: ${new Date().toISOString()}\n\nPlease reach out directly to the customer with payment instructions.`;

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background-color: #09090b; color: #f4f4f5; padding: 36px 24px; border-radius: 16px; border: 1px solid #27272a;">
      <div style="margin-bottom: 20px;">
        <span style="font-size: 18px; font-weight: 800; color: #ffffff;">STRIX <span style="color: #38bdf8;">[ QR ]</span></span>
        <span style="font-size: 12px; color: #71717a; margin-left: 8px;">Manual Pro Order Request</span>
      </div>
      <div style="background-color: #18181b; border: 1px solid #27272a; border-radius: 12px; padding: 18px; margin-bottom: 20px;">
        <div style="font-size: 15px; margin-bottom: 10px; color: #38bdf8; font-weight: 800;">${planName} (${interval}) — ${amount}</div>
        <div style="font-size: 13px; margin-bottom: 8px;"><strong style="color: #a1a1aa;">Customer Name:</strong> <span style="color: #ffffff;">${name}</span></div>
        <div style="font-size: 13px; margin-bottom: 8px;"><strong style="color: #a1a1aa;">Email:</strong> <a href="mailto:${email}" style="color: #38bdf8; text-decoration: none;">${email}</a></div>
        ${phone ? `<div style="font-size: 13px; margin-bottom: 8px;"><strong style="color: #a1a1aa;">Phone / WhatsApp:</strong> <span style="color: #34d399; font-weight: 600;">${phone}</span></div>` : ''}
        ${company ? `<div style="font-size: 13px; margin-bottom: 8px;"><strong style="color: #a1a1aa;">Company / Brand:</strong> <span style="color: #ffffff;">${company}</span></div>` : ''}
      </div>
      ${notes ? `
      <div style="background-color: #12131a; border: 1px solid #27272a; border-radius: 12px; padding: 16px; margin-bottom: 20px;">
        <div style="font-size: 11px; color: #71717a; margin-bottom: 6px; text-transform: uppercase; font-weight: 700;">Customer Notes</div>
        <div style="font-size: 13px; color: #e4e4e7; white-space: pre-wrap;">${notes}</div>
      </div>
      ` : ''}
      <div style="font-size: 12px; color: #71717a; line-height: 1.5;">
        <strong>Next Step:</strong> Contact the customer at <a href="mailto:${email}" style="color: #38bdf8;">${email}</a> ${phone ? `or via WhatsApp at ${phone}` : ''} with manual payment instructions to activate their Pro subscription.
      </div>
    </div>
  `;

  return sendRawEmail({ to: recipient, subject, html, text });
}
