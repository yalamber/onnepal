/**
 * Transactional email templates for OnNepal.
 * Each template returns { subject, html, text } and is consumed by sendEmail().
 *
 * Style: warm-paper background, ink-on-paper text, Fraunces-ish serif title in
 * an inline font-family stack (mail clients ignore web fonts). Single-column,
 * 600px wide, button is a teal pill.
 */

import { htmlToPlain } from './email';

const SITE_URL = 'https://onnepal.com';

interface Template { subject: string; html: string; text: string }

function shell(title: string, body: string, footer?: string): string {
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escape(title)}</title></head>
<body style="margin:0;padding:0;background:#f3f1ec;font-family:-apple-system,'Segoe UI',Helvetica,Arial,sans-serif;color:#0f1419;line-height:1.5;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f3f1ec;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="background:#fbfaf7;border:1px solid #dde0e4;border-radius:18px;overflow:hidden;max-width:600px;">
        <tr><td style="padding:32px 32px 0;">
          <div style="font-family:'JetBrains Mono',ui-monospace,Menlo,monospace;font-size:11px;letter-spacing:0.14em;color:#5a6470;text-transform:uppercase;">OnNepal</div>
          <h1 style="font-family:'Fraunces',Georgia,serif;font-weight:500;font-size:32px;letter-spacing:-0.02em;line-height:1.1;margin:16px 0 24px;color:#0f1419;">${title}</h1>
        </td></tr>
        <tr><td style="padding:0 32px 32px;font-size:16px;color:#2a323b;">${body}</td></tr>
        ${footer ? `<tr><td style="padding:24px 32px;border-top:1px solid #dde0e4;background:#f6f7f8;font-size:13px;color:#5a6470;">${footer}</td></tr>` : ''}
      </table>
      <div style="margin-top:16px;font-size:12px;color:#8a929c;font-family:-apple-system,Helvetica,Arial,sans-serif;">
        OnNepal · Kathmandu · <a href="${SITE_URL}" style="color:#0f7a8e;text-decoration:none;">onnepal.com</a>
      </div>
    </td></tr>
  </table>
</body></html>`;
}

function escape(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function btn(href: string, label: string): string {
  return `<a href="${href}" style="display:inline-block;background:#0f1419;color:#fbfaf7;text-decoration:none;padding:14px 24px;border-radius:999px;font-weight:500;font-size:15px;">${escape(label)}</a>`;
}

export function passwordResetEmail({ resetUrl, displayName, expiresInMinutes }: {
  resetUrl: string;
  displayName?: string | null;
  expiresInMinutes: number;
}): Template {
  const greet = displayName ? `Hi ${escape(displayName)},` : 'Hi there,';
  const html = shell(
    `Reset your <em style="color:#0f7a8e;font-style:italic;">password.</em>`,
    `<p style="margin:0 0 16px;">${greet}</p>
     <p style="margin:0 0 24px;">Someone (we hope it was you) asked to reset the password on your OnNepal account. Click the button to choose a new one — the link expires in ${expiresInMinutes} minutes.</p>
     <p style="margin:0 0 24px;">${btn(resetUrl, 'Reset password →')}</p>
     <p style="margin:0 0 16px;font-size:14px;color:#5a6470;">If the button doesn't work, copy and paste this link into your browser:</p>
     <p style="margin:0 0 24px;font-size:13px;color:#5a6470;word-break:break-all;"><a href="${resetUrl}" style="color:#0f7a8e;text-decoration:underline;">${escape(resetUrl)}</a></p>`,
    `Didn't request this? You can safely ignore this email — your password won't change unless you click the link above and choose a new one.`,
  );
  return {
    subject: 'Reset your OnNepal password',
    html,
    text: htmlToPlain(html),
  };
}
