import nodemailer, { type Transporter } from 'nodemailer';
import {
  buildClientInquiryEmail,
  buildAdminInquiryEmail,
  buildClientOrderEmail,
  buildAdminOrderEmail,
  InquiryEmailData,
  OrderEmailData,
} from '../utils/strixEmailTemplates';
import { buildStrixEmailHtml } from '../utils/emailTemplateBuilder';

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

const SMTP_HOST = process.env.SMTP_HOST || 'smtp.gmail.com';
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '465', 10);
const SMTP_SECURE = process.env.SMTP_SECURE === 'true' || SMTP_PORT === 465;
const SMTP_USER = process.env.SMTP_USER || 'strixdevs1.0@gmail.com';
const SMTP_PASS = (process.env.SMTP_PASS || '').replace(/^["']|["']$/g, '');
const STRIX_ADMIN_EMAIL = 'strixdevs1.0@gmail.com';

let cachedTransporter: Transporter | null = null;

function getTransporter(): Transporter | null {
  if (!SMTP_USER || !SMTP_PASS) {
    return null;
  }
  if (!cachedTransporter) {
    cachedTransporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_SECURE,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    });
  }
  return cachedTransporter;
}

/**
 * Low-level email dispatcher using Nodemailer with Gmail SMTP
 */
export async function sendRawEmail({
  to,
  subject,
  html,
  text,
}: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}): Promise<EmailResult> {
  const transporter = getTransporter();

  if (!transporter) {
    console.warn(`[SMTP Warning] Transporter unconfigured. To: ${to} | Subject: "${subject}"`);
    return { success: true, simulated: true, messageId: `sim_${Date.now()}` };
  }

  try {
    const info = await transporter.sendMail({
      from: `"Strix QR" <${SMTP_USER}>`,
      to,
      subject,
      text: text || subject,
      html,
    });

    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (err: any) {
    console.error('[SMTP Send Error]', err);
    return {
      success: false,
      error: err.message || 'SMTP transmission failure',
    };
  }
}

/**
 * 1. Client Contact Inquiry Handler:
 * Sends a confirmation email to the user AND a notification to Strix Devs.
 */
export async function sendContactInquiryEmail(data: InquiryEmailData): Promise<EmailResult> {
  const clientEmail = buildClientInquiryEmail(data);
  const adminEmail = buildAdminInquiryEmail(data);

  // Dispatch confirmation email to client
  const clientRes = await sendRawEmail({
    to: data.email,
    subject: clientEmail.subject,
    html: clientEmail.html,
  });

  // Dispatch alert email to Strix Devs
  const adminRes = await sendRawEmail({
    to: STRIX_ADMIN_EMAIL,
    subject: adminEmail.subject,
    html: adminEmail.html,
  });

  return {
    success: clientRes.success || adminRes.success,
    messageId: clientRes.messageId || adminRes.messageId,
    simulated: clientRes.simulated && adminRes.simulated,
  };
}

/**
 * 2. Manual Pro Subscription Order Request Handler:
 * Sends order confirmation to the client AND an action-required alert to Strix Devs.
 */
export async function sendManualProOrderEmail(data: OrderEmailData): Promise<EmailResult> {
  const clientEmail = buildClientOrderEmail(data);
  const adminEmail = buildAdminOrderEmail(data);

  // Dispatch confirmation email to customer
  const clientRes = await sendRawEmail({
    to: data.email,
    subject: clientEmail.subject,
    html: clientEmail.html,
  });

  // Dispatch actionable lead email to Strix Devs
  const adminRes = await sendRawEmail({
    to: STRIX_ADMIN_EMAIL,
    subject: adminEmail.subject,
    html: adminEmail.html,
  });

  return {
    success: clientRes.success || adminRes.success,
    messageId: clientRes.messageId || adminRes.messageId,
    simulated: clientRes.simulated && adminRes.simulated,
  };
}

/**
 * 3. Welcome Email on Account Creation
 */
export async function sendWelcomeEmail({ to, name }: EmailRecipient): Promise<EmailResult> {
  const userName = name || 'Creator';
  const subject = `Welcome to Strix QR, ${userName}! 🦅`;
  const contentHtml = `
    <p style="font-size: 14px; line-height: 1.6; color: #a1a1aa; margin-bottom: 24px;">
      Your Strix QR studio is ready. You now have access to high-resolution print-ready vector matrix exports, dynamic redirects without re-printing, and real-time scannability verification.
    </p>
  `;
  const html = buildStrixEmailHtml({
    preheader: `Welcome to Strix QR, ${userName}!`,
    badgeText: 'Studio Active',
    title: `Welcome aboard, ${userName}!`,
    subtitle: 'Start generating permanent and dynamic vector QR codes today.',
    contentHtml,
    ctaText: 'Open Your Studio',
    ctaUrl: process.env.NEXT_PUBLIC_APP_URL || 'https://qr.strixdevs.com',
  });

  return sendRawEmail({ to, subject, html });
}

/**
 * 4. Scan Alert Email
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
  const contentHtml = `
    <div style="background-color: #18181b; border: 1px solid #27272a; border-radius: 12px; padding: 16px; margin-bottom: 24px;">
      <div style="font-size: 13px; color: #a1a1aa; margin-bottom: 6px;">Total Scans: <strong style="color: #34d399; font-size: 15px;">${scanCount}</strong></div>
      <div style="font-size: 13px; color: #a1a1aa; margin-bottom: 6px;">Device: <span style="color: #ffffff;">${device || 'Mobile Browser'}</span></div>
      <div style="font-size: 13px; color: #a1a1aa;">Estimated Location: <span style="color: #ffffff;">${location || 'Global Edge'}</span></div>
    </div>
  `;
  const html = buildStrixEmailHtml({
    preheader: `Milestone reached: ${scanCount} scans on "${qrTitle}"`,
    badgeText: 'Scan Telemetry',
    title: `QR Code Scan Milestone`,
    subtitle: `Your dynamic QR code "${qrTitle}" recorded new scans.`,
    contentHtml,
    ctaText: 'Open Vault Dashboard',
    ctaUrl: process.env.NEXT_PUBLIC_APP_URL || 'https://qr.strixdevs.com',
  });

  return sendRawEmail({ to, subject, html });
}

/**
 * 5. Pro Upgrade Receipt Email
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
  const subject = `Payment Confirmed: Welcome to Strix QR ${planName}`;
  const contentHtml = `
    <div style="background-color: #18181b; border: 1px solid #27272a; border-radius: 12px; padding: 16px; margin-bottom: 24px;">
      <div style="font-size: 13px; color: #ffffff; margin-bottom: 8px;"><strong>Plan:</strong> ${planName}</div>
      <div style="font-size: 13px; color: #ffffff;"><strong>Amount:</strong> ${amountPaid}</div>
    </div>
  `;
  const html = buildStrixEmailHtml({
    preheader: `Your Pro access is now active for ${planName}.`,
    badgeText: 'Payment Confirmed',
    title: `Welcome to ${planName}!`,
    subtitle: `Thank you for upgrading, ${userName}. All limits have been removed.`,
    contentHtml,
    ctaText: 'Launch Pro Studio',
    ctaUrl: process.env.NEXT_PUBLIC_APP_URL || 'https://qr.strixdevs.com',
  });

  return sendRawEmail({ to, subject, html });
}
