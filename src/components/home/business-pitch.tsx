import { SubdomainChecker } from '@/components/subdomain-checker';

export function BusinessPitch() {
  return (
    <section className="section">
      <div className="pitch-card">
        <div>
          <div className="t-eyebrow" style={{ color: 'var(--ink-300)' }}>
            <span className="dot" /> For business owners
          </div>
          <h2 className="pitch-title">
            Your business deserves more than a <em style={{ color: 'var(--accent)', fontStyle: 'italic' }}>Facebook page.</em>
          </h2>
          <p className="pitch-blurb">
            Get a real web presence in minutes — your own subdomain, products, menu, gallery, reviews, and contact info.
          </p>
          <dl className="pitch-features">
            <div>
              <dt>Your own URL</dt>
              <dd>yourshop.onnepal.com</dd>
            </div>
            <div>
              <dt>All your links</dt>
              <dd>Social, WhatsApp, maps</dd>
            </div>
            <div>
              <dt>Products & menu</dt>
              <dd>Photos, prices, availability</dd>
            </div>
            <div>
              <dt>Up to 5 businesses</dt>
              <dd>One account, many pages</dd>
            </div>
          </dl>
        </div>
        <div>
          <SubdomainChecker variant="dark" />
          <p className="t-meta" style={{ marginTop: 12, color: 'var(--ink-400)' }}>
            Free. No credit card. Takes 5 minutes.
          </p>
        </div>
      </div>
    </section>
  );
}
