// Cloudflare environment bindings
export interface CloudflareEnv extends Record<string, unknown> {
  DB: D1Database;
  IMAGES: R2Bucket;
  JWT_SECRET: string;
  VINEXT_CACHE: KVNamespace;
  EMAIL: SendEmailBinding;
}

/**
 * Cloudflare Email Sending Workers binding (public beta).
 * Configured in wrangler.jsonc under `send_email`.
 */
export interface SendEmailBinding {
  // Production resolves to a SendEmailResult with messageId; the local wrangler
  // stub resolves to undefined. Callers must tolerate either.
  send(message: SendEmailMessage): Promise<SendEmailResult | undefined>;
}

export interface SendEmailMessage {
  /** Sender address. Must be on a verified domain. */
  from: string;
  /** Recipient address. */
  to: string;
  /** Subject line. */
  subject: string;
  /** HTML body. At least one of html/text must be provided. */
  html?: string;
  /** Plain-text body. At least one of html/text must be provided. */
  text?: string;
  /** Optional reply-to header. */
  replyTo?: string;
}

export interface SendEmailResult {
  messageId: string;
}
