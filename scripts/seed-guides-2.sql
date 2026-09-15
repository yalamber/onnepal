-- Diaspora process guides, batch 2 (seed-g5..g8), category 'Guide'. Same
-- conventions as seed-guides.sql: INSERT OR IGNORE on slug, admin author
-- subquery, structural content with official links, last-reviewed dates,
-- and verify-with-officials disclaimers.
--
-- Run locally:  npx wrangler d1 execute onnepal-db --local  --file=./scripts/seed-guides-2.sql
-- Run remotely: npx wrangler d1 execute onnepal-db --remote --file=./scripts/seed-guides-2.sql

INSERT OR IGNORE INTO voices (id, user_id, slug, title, excerpt, content, city, category, status, is_featured, published_at, created_at, updated_at) VALUES

('seed-g5', (SELECT id FROM users WHERE is_admin = 1 ORDER BY created_at LIMIT 1), 'nrn-card-what-it-is-how-to-get-it',
 'The NRN card: what it actually gets you, and how to apply',
 'Nepal''s identity card for non-resident Nepalis — visa-free entry, property and investment rights, and where to apply from abroad.',
 '> **Before you start:** eligibility rules and benefits are set by the NRN Act and its amendments, and they change. Confirm current rules with your Nepali embassy or the Ministry of Foreign Affairs before applying. Last reviewed: September 2026.

## What it is

The **Non-Resident Nepali (NRN) card** is an identity card for people of Nepali origin living abroad. Depending on your situation it covers two broad groups:

- **Foreign citizens of Nepali origin** — you (or a parent/grandparent) held Nepali citizenship, and you now hold another passport.
- **Nepali citizens residing abroad** — living outside Nepal (and outside SAARC countries) for work, business, or study over a qualifying period.

## Why people get it

- **Visa-free entry and stay** in Nepal for foreign citizens of Nepali origin (in place of tourist visas that need renewing).
- **Economic rights** — the NRN framework covers owning property within limits, investing, and opening accounts, subject to the current Act and regulations.
- **A recognized status** for dealing with Nepali institutions from abroad — some banks and offices ask for it.

If you still hold only Nepali citizenship and a Nepali passport, you may not need one for entry — the card matters most after a citizenship change, or for documented NRN status in banking and investment.

## How to apply

1. **Apply through your Nepali embassy or consulate** — missions accept NRN card applications for their jurisdiction. In Nepal, applications go through the Ministry of Foreign Affairs.
2. **Documents** typically include: proof of Nepali origin (your old citizenship certificate or a parent''s/grandparent''s, or your current Nepali passport), your current passport, proof of residence abroad, photos, and the fee.
3. **Processing** happens at the mission; timelines vary — ask yours.

## Things that catch people out

- **Renewals:** the card has a validity period — check yours and renew before travel plans depend on it.
- **Origin documents:** proving Nepali origin after a citizenship change relies on old documents (citizenship certificates, old passports). Keep them safe forever; replacing them from abroad is painful.
- **SAARC-country residents:** the NRN definition traditionally excludes residents of SAARC countries — check the current Act if you live in India or elsewhere in the region.
- **Benefits change:** property and investment limits are set by regulation and get amended. Verify the current rules before making financial decisions based on the card.

## Official sources

- Ministry of Foreign Affairs: [mofa.gov.np](https://mofa.gov.np)
- Your nearest Nepali embassy or consulate — see [our embassy directory](https://onnepal.com/embassies)
- Non-Resident Nepali Association: [nrna.org](https://nrna.org)

If something here is out of date, flag it in discussions and we''ll fix it.',
 NULL, 'Guide', 'published', 0,
 strftime('%s', 'now', '-1 days'), strftime('%s', 'now', '-1 days'), strftime('%s', 'now', '-1 days')),

('seed-g6', (SELECT id FROM users WHERE is_admin = 1 ORDER BY created_at LIMIT 1), 'returning-to-nepal-customs-allowances',
 'Flying home: what you can bring into Nepal without trouble',
 'Gold, phones, TVs, gifts — the customs rules every returning Nepali gets quizzed about at TIA, and where the official limits live.',
 '> **Before you pack:** duty-free allowances and gold limits are revised in the annual Finance Act and can change every fiscal year. This guide describes the shape of the rules, not today''s numbers — **check the Department of Customs passenger rules before you fly.** Last reviewed: September 2026.

## The short version

Nepal''s customs rules for arriving passengers distinguish:

- **Personal effects** — used clothing, personal items, one used phone and laptop for your own use: generally fine.
- **Duty-free allowances** — a defined list (small electronics, a set amount of liquor/cigarettes for those of age, gifts up to a value cap) that changes with the Finance Act.
- **Dutiable goods** — new electronics beyond the allowance (a second phone, a new TV), appliances, and anything in commercial quantity. Declare these at the red channel and pay duty.
- **Restricted/prohibited** — drones need prior approval, and there are rules around currency, antiques (export), and more.

## Gold: the one everyone asks about

Gold gets special treatment and real enforcement:

- **Worn personal jewelry** within the permitted quantity is allowed — the permitted grams differ for jewelry vs. raw gold and are revised periodically.
- **Above the free allowance**, you pay duty per the current schedule; beyond the ceiling, gold can be seized and the traveler prosecuted for smuggling. People have lost real money testing this.
- If you''re carrying family jewelry for a wedding, carry purchase receipts where possible and **declare when in doubt** — the red channel costs duty; the green channel with undeclared gold can cost the gold.

## Things that catch people out

- **"It''s a gift" doesn''t exempt it.** Gifts count toward the value cap.
- **Boxed = new.** A sealed box reads as dutiable merchandise even if you swear it''s personal.
- **One laptop/phone as personal effect** — the second one is where questions start.
- **Keep receipts accessible** for anything valuable you bought abroad, and for items you took OUT of Nepal originally (a laptop you left with, for instance).
- **Cash:** foreign currency above the declaration threshold must be declared on arrival; NPR itself has import/export limits.

## Official sources

- Department of Customs (passenger/traveler rules): [customs.gov.np](https://www.customs.gov.np)
- Tribhuvan International Airport Customs Office — current allowance notices
- Nepal Rastra Bank (currency rules): [nrb.org.np](https://www.nrb.org.np)

Rules here change every fiscal year — if you spot a stale claim, tell us in discussions.',
 NULL, 'Guide', 'published', 0,
 strftime('%s', 'now', '-3 days'), strftime('%s', 'now', '-3 days'), strftime('%s', 'now', '-3 days')),

('seed-g7', (SELECT id FROM users WHERE is_admin = 1 ORDER BY created_at LIMIT 1), 'power-of-attorney-adhikrit-warisnama-from-abroad',
 'Power of attorney from abroad: letting family act for you in Nepal',
 'Selling land, running a citizenship copy, chasing an office — the authenticated अधिकृत वारेसनामा that lets someone in Nepal legally stand in for you.',
 '> **Before you start:** format requirements and attestation fees vary by embassy, and property-related powers have extra formalities. Confirm the current process with your mission and, for property, a Nepali lawyer. Last reviewed: September 2026.

## What it is

A **power of attorney (अधिकृत वारेसनामा)** is a document in which you authorize a specific person in Nepal — usually a family member — to act on your behalf: sign documents, appear at offices, manage or transfer property, operate a bank account, or pursue a court case.

For Nepalis abroad it is the single most useful document that exists, because most Nepali offices still want a physical person at the counter.

## The process, broadly

1. **Draft the document.** It names you, the person you authorize (with citizenship details), and — critically — the **specific powers** you grant. Nepali offices read these narrowly: "manage my affairs" is weaker than "sign the deed transferring plot X in Y municipality."
2. **Have it attested at your Nepali embassy or consulate.** You appear in person with your passport/citizenship; the mission verifies your identity and attests the document. This attestation is what makes it usable in Nepal.
3. **Send the attested original to Nepal.** Courier it — offices want the original, not a scan.
4. **Registration in Nepal** may be required depending on use — property transactions typically need the document registered/verified at the Land Revenue Office; courts have their own rules. Your representative handles this end.

## Things that catch people out

- **Be specific or be rejected.** The most common failure is a vaguely-worded POA that the Land Revenue Office refuses. Get the property schedule, plot numbers, and the exact acts you''re authorizing written in.
- **Property sales by POA draw scrutiny** (they''ve been abused), so expect extra verification, and expect some offices to require the POA to be recent.
- **Revocation is a process too** — if circumstances change, formally revoke through the same channels; don''t assume an unused POA is harmless.
- **Photos and witnesses:** many missions require passport photos of both parties affixed to the document and may want witness details — check your embassy''s checklist before booking the appointment.
- **A POA doesn''t outlive you.** For inheritance planning, that''s a different set of documents.

## Official sources

- Your Nepali embassy or consulate''s consular section — see [our embassy directory](https://onnepal.com/embassies)
- Department of Land Management and Archive: [dolma.gov.np](https://dolma.gov.np) (for property-use requirements)
- Ministry of Foreign Affairs: [mofa.gov.np](https://mofa.gov.np)

Embassy checklists differ — if yours needed something this guide misses, add it in discussions.',
 NULL, 'Guide', 'published', 0,
 strftime('%s', 'now', '-5 days'), strftime('%s', 'now', '-5 days'), strftime('%s', 'now', '-5 days')),

('seed-g8', (SELECT id FROM users WHERE is_admin = 1 ORDER BY created_at LIMIT 1), 'registering-birth-marriage-abroad-nepal',
 'Baby born abroad? Married abroad? Registering it with Nepal',
 'Vital registration through your embassy — why it matters for citizenship and passports later, and how to do it before the paperwork compounds.',
 '> **Before you start:** registration windows, fees, and document lists vary by mission and change over time. Confirm with your embassy and Nepal''s civil registration authority. Last reviewed: September 2026.

## Why bother

Births, marriages, deaths, and divorces of Nepali citizens abroad can be registered with Nepal through your embassy or consulate. It feels skippable — until:

- your **child needs Nepali citizenship or a passport** (the birth registration is the foundation document),
- you need to **prove your marriage** for a dependent visa, property matter, or insurance claim in Nepal,
- an **inheritance** process asks for death registration of a relative who passed away abroad.

Registering close to the event is dramatically easier than reconstructing it years later.

## The process, broadly

1. **Register locally first.** Get the official certificate from the country where the event happened (hospital birth certificate, marriage certificate, etc.).
2. **Apply at your Nepali mission** — the embassy or consulate serving your country registers the event for Nepal''s system. Bring the local certificate, both parents''/spouses'' Nepali documents (citizenship, passports), and photos per the mission''s checklist.
3. **Translations/attestations:** if the local certificate isn''t in English or Nepali, expect to need a certified translation; some documents also need attestation by the local foreign ministry before the Nepali mission accepts them.
4. **Keep the Nepali registration certificate safe** — it''s what Nepal-side offices will ask for later.

## Things that catch people out

- **Registration windows:** registering within the standard window (commonly 35 days for events in Nepal) is straightforward; late registration is usually still possible but may involve extra steps or fees — don''t let it slide for years.
- **Name consistency, again.** The child''s name on the foreign birth certificate should match what you''ll use on Nepali documents — transliteration choices (श्रेष्ठ → Shrestha/Shrestha?) follow the family forever.
- **Both parents'' documents:** citizenship-by-descent questions make the parents'' Nepali citizenship certificates central to a birth registration. If one parent is a foreign citizen, ask the mission what that means for the child''s options **before** assuming.
- **Marriage registered nowhere:** a religious ceremony abroad with no legal registration anywhere is invisible to every system. Make sure the marriage exists legally in at least one country first.

## Official sources

- Department of National ID and Civil Registration: [donidcr.gov.np](https://donidcr.gov.np)
- Your Nepali embassy or consulate — see [our embassy directory](https://onnepal.com/embassies)
- Ministry of Foreign Affairs: [mofa.gov.np](https://mofa.gov.np)

If your embassy''s checklist differed, leave a note in discussions so others know what to expect.',
 NULL, 'Guide', 'published', 0,
 strftime('%s', 'now', '-7 days'), strftime('%s', 'now', '-7 days'), strftime('%s', 'now', '-7 days'));
