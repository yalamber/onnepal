/**
 * Email helper — wraps the Cloudflare Email Sending Workers binding.
 *
 * In production: calls env.EMAIL.send(...) directly. Requires Workers Paid
 * plan + verified sender domain (see DEPLOYMENT_STEPS.md).
 *
 * In dev / when the binding is missing: logs the email to stderr instead of
 * throwing, so local flows that depend on email don't 500.
 */

import { getEmailBinding } from '@/lib/cloudflare';
import type { SendEmailMessage, SendEmailResult } from '@/types/cloudflare';

export const FROM_NOREPLY = 'noreply@onnepal.com';

interface SendOpts {
  to: string;
  subject: string;
  html: string;
  text: string;
  from?: string;
  replyTo?: string;
}

export async function sendEmail(opts: SendOpts): Promise<SendEmailResult | null> {
  const message: SendEmailMessage = {
    from: opts.from ?? FROM_NOREPLY,
    to: opts.to,
    subject: opts.subject,
    html: opts.html,
    text: opts.text,
    ...(opts.replyTo ? { replyTo: opts.replyTo } : {}),
  };

  const binding = getEmailBinding();
  if (!binding) {
    // No binding — fall through to a no-op log so dev / preview environments
    // (where email isn't wired) don't crash transactional flows.
    console.warn('[email] No EMAIL binding; skipping send.', {
      to: message.to,
      subject: message.subject,
    });
    return null;
  }

  try {
    // Wrangler's local stub resolves to `undefined` instead of `{messageId}`,
    // so don't trust the shape — log conservatively.
    const result = await binding.send(message);
    console.log('[email] sent', {
      messageId: result?.messageId ?? '(local-stub)',
      to: message.to,
      subject: message.subject,
    });
    return result ?? null;
  } catch (err) {
    // Don't propagate — email failures should not break the calling flow
    // (e.g. signup must succeed even if welcome mail fails). Log + return null.
    console.error('[email] send failed', {
      to: message.to,
      subject: message.subject,
      error: err instanceof Error ? err.message : String(err),
    });
    return null;
  }
}

/**
 * Strip a small HTML doc to a plain-text fallback for the `text` field.
 * Crude but adequate for transactional templates that we control.
 */
export function htmlToPlain(html: string): string {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|h[1-6]|li)>/gi, '\n\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
