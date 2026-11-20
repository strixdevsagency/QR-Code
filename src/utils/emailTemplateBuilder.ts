/**
 * Strix QR — Custom HTML Email Template Generator
 * Ultra-compatible, dark-themed responsive email templates.
 */

interface BaseTemplateOptions {
  preheader: string;
  badgeText: string;
  title: string;
  subtitle?: string;
  contentHtml: string;
  ctaText?: string;
  ctaUrl?: string;
  footerNote?: string;
}

export function buildStrixEmailHtml({
  preheader,
  badgeText,
  title,
  subtitle,
  contentHtml,
  ctaText,
  ctaUrl,
  footerNote,
}: BaseTemplateOptions): string {
  const ctaButtonHtml = ctaText && ctaUrl ? `
    <div style="margin: 30px 0 20px 0; text-align: center;">
      <a href="${ctaUrl}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #38bdf8 0%, #2563eb 100%); color: #ffffff; font-weight: 700; font-size: 14px; text-decoration: none; padding: 13px 32px; border-radius: 12px; box-shadow: 0 4px 14px rgba(56, 189, 248, 0.35);">
        ${ctaText} →
      </a>
    </div>
  ` : '';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body { margin: 0; padding: 0; background-color: #09090b; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; }
    table { border-collapse: separate; }
    a { color: #38bdf8; text-decoration: none; }
  </style>
</head>
<body style="margin: 0; padding: 24px 12px; background-color: #09090b; color: #f4f4f5;">
  <!-- Hidden Preheader -->
  <div style="display: none; max-height: 0px; overflow: hidden; mso-hide: all; font-size: 1px; line-height: 1px; color: #09090b;">
    ${preheader}
  </div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 580px; background-color: #121318; border: 1px solid #27272a; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.6);">
          
          <!-- Brand Header -->
          <tr>
            <td style="padding: 32px 32px 20px 32px; border-bottom: 1px solid #1f2028; background: linear-gradient(180deg, #181922 0%, #121318 100%);">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td>
                    <div style="display: inline-block;">
                      <span style="font-size: 20px; font-weight: 900; letter-spacing: -0.04em; color: #ffffff;">STRIX</span>
                      <span style="display: inline-block; background-color: rgba(56, 189, 248, 0.12); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.3); font-size: 12px; font-weight: 800; padding: 2px 8px; border-radius: 6px; margin-left: 6px; letter-spacing: 0.05em;">QR</span>
                    </div>
                  </td>
                  <td align="right">
                    <span style="display: inline-block; background-color: rgba(255, 255, 255, 0.06); color: #a1a1aa; border: 1px solid rgba(255, 255, 255, 0.1); font-size: 11px; font-weight: 600; padding: 4px 10px; border-radius: 20px;">
                      ${badgeText}
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Body -->
          <tr>
            <td style="padding: 32px 32px 24px 32px;">
              <h1 style="margin: 0 0 10px 0; font-size: 22px; font-weight: 800; color: #ffffff; letter-spacing: -0.02em; line-height: 1.3;">
                ${title}
              </h1>
              ${subtitle ? `<p style="margin: 0 0 24px 0; font-size: 14px; line-height: 1.6; color: #a1a1aa;">${subtitle}</p>` : ''}
              
              <!-- Injected Content Cards -->
              ${contentHtml}

              <!-- Primary Call To Action -->
              ${ctaButtonHtml}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 32px; background-color: #0c0d12; border-top: 1px solid #1f2028; text-align: center;">
              <p style="margin: 0 0 8px 0; font-size: 12px; color: #71717a; line-height: 1.5;">
                ${footerNote || 'Engineered with 100% client-side matrix rendering by StrixDevs.'}
              </p>
              <div style="font-size: 11px; color: #52525b;">
                © ${new Date().getFullYear()} StrixDevs. All rights reserved. • <a href="https://qr.strixdevs.com" style="color: #38bdf8;">qr.strixdevs.com</a>
              </div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}
