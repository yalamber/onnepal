-- Diaspora process guides (seed-g1..g4), category 'Guide'. Same conventions
-- as seed-voices.sql: INSERT OR IGNORE on slug, admin author subquery.
--
-- These are deliberately structural ("what the process looks like, where the
-- official sources are") rather than prescriptive (fees and timelines change).
-- Every guide carries a last-reviewed line and a verify-with-officials
-- disclaimer. Update or unpublish if a process changes materially.
--
-- Run locally:  npx wrangler d1 execute onnepal-db --local  --file=./scripts/seed-guides.sql
-- Run remotely: npx wrangler d1 execute onnepal-db --remote --file=./scripts/seed-guides.sql

INSERT OR IGNORE INTO voices (id, user_id, slug, title, excerpt, content, city, category, status, is_featured, published_at, created_at, updated_at) VALUES

('seed-g1', (SELECT id FROM users WHERE is_admin = 1 ORDER BY created_at LIMIT 1), 'renew-nepali-passport-from-abroad',
 'How to renew your Nepali passport from abroad',
 'The e-passport process through your embassy, step by step — pre-enrollment, documents, biometrics, and the mistakes that cost people a second trip.',
 '> **Before you start:** processes, fees, and timelines vary by embassy and change without much notice. This guide describes the general shape of the process. **Always confirm details with your nearest Nepali embassy or consulate before traveling or paying anything.** Last reviewed: June 2026.

## The short version

Nepal now issues **e-passports**, and renewals from abroad go through the Nepali embassy or consulate responsible for your country. The broad steps:

1. **Pre-enroll online** at the Department of Passports portal — [nepalpassport.gov.np](https://nepalpassport.gov.np). You fill the application form online and get an appointment/receipt.
2. **Gather documents.** Typically: your current (or expired) passport, a copy of your **citizenship certificate (नागरिकता)**, and passport-size photos per the spec on the portal. Some missions ask for proof of legal status in the country you live in.
3. **Visit the embassy/consulate in person** for biometrics (fingerprints + photo). This is the step you cannot do remotely — plan the trip.
4. **Pay the fee** as the mission instructs (methods vary — some take bank drafts only).
5. **Wait, then collect.** Passports are printed in Kathmandu and couriered to the mission. Timelines vary widely between missions; ask yours for a realistic estimate, and whether they will post it to you or require pickup.

## Things that catch people out

- **Apply early.** Many countries (and airlines) require 6 months of validity. Renewals from abroad take longer than in Nepal — start when you cross the one-year-left mark, not the final month.
- **Name spellings must match** your citizenship certificate exactly. Discrepancies between old passport, citizenship, and the form are the most common reason applications stall.
- **Lost citizenship copy?** Getting a replacement from your district in Nepal while abroad is its own process — often via a relative with power of attorney. Sort this *before* the passport application.
- **Check which mission covers you.** Not every country has a Nepali embassy; you may be accredited to one in a neighboring country (e.g., several European countries route through Berlin or Brussels).
- **Lost or stolen passport?** That is a different process (police report + travel document). Contact the embassy immediately rather than applying for a regular renewal.

## Official sources

- Department of Passports: [nepalpassport.gov.np](https://nepalpassport.gov.np)
- Ministry of Foreign Affairs (embassy directory): [mofa.gov.np](https://mofa.gov.np)
- Your embassy''s own website and official Facebook page — most missions post current fees and appointment rules there.

If something in this guide is out of date, leave a note in the discussions so we can fix it.',
 NULL, 'Guide', 'published', 0,
 strftime('%s', 'now', '-2 days'), strftime('%s', 'now', '-2 days'), strftime('%s', 'now', '-2 days')),

('seed-g2', (SELECT id FROM users WHERE is_admin = 1 ORDER BY created_at LIMIT 1), 'police-clearance-report-from-abroad',
 'Getting a Nepali police clearance report from abroad',
 'Needed for PR, work visas, and citizenship applications. The online system, what documents you need, and how long to budget.',
 '> **Before you start:** requirements change and vary by destination country. Confirm with Nepal Police and the authority requesting the certificate. Last reviewed: June 2026.

## When you need this

Permanent-residency applications (Australia, Canada), many work visas, some citizenship and adoption processes — anything where the destination country wants proof you have no criminal record in Nepal.

## The process

Nepal Police runs an **Online Police Clearance Report** system:

1. **Apply online** at the Nepal Police OPCR portal — [opcr.nepalpolice.gov.np](https://opcr.nepalpolice.gov.np). You create an account, fill the form, and upload documents.
2. **Documents** typically include: citizenship certificate copy, passport copy, and a recent photo. Applicants abroad usually also provide a copy of their visa/residence permit.
3. **The report references your Nepali address history** — the police verification happens against records in the district(s) where you lived.
4. **Collection:** the certificate can typically be collected in person in Kathmandu by you or an authorized representative, or routed via the embassy — check the current rules on the portal, as the delivery options have changed over the years.

## Things that catch people out

- **Validity windows.** Many destination countries only accept police certificates issued within the last 3–6 months. Don''t get it too early in your application.
- **Name/date mismatches** between your citizenship certificate and passport will stall the application — same as with passports.
- **Translations.** The certificate is issued in English, but if any supporting documents are Nepali-only, the destination country may want certified translations.
- **A representative in Nepal helps.** If the office asks for an in-person step, a family member with a signed authorization letter can usually handle it.

## Official sources

- Nepal Police OPCR: [opcr.nepalpolice.gov.np](https://opcr.nepalpolice.gov.np)
- Nepal Police: [nepalpolice.gov.np](https://www.nepalpolice.gov.np)

If something here is out of date, flag it in discussions and we''ll correct it.',
 NULL, 'Guide', 'published', 0,
 strftime('%s', 'now', '-4 days'), strftime('%s', 'now', '-4 days'), strftime('%s', 'now', '-4 days')),

('seed-g3', (SELECT id FROM users WHERE is_admin = 1 ORDER BY created_at LIMIT 1), 'sending-money-home-comparing-remittance',
 'Sending money home: how to actually compare your options',
 'The advertised rate is not the real rate. A framework for comparing banks, remittance apps, and transfer services — and why hundi is never worth it.',
 '> **This is general information, not financial advice.** Rates change by the hour; check today''s NRB reference rate on our [homepage](https://onnepal.com) before you send. Last reviewed: June 2026.

## The one rule

**Compare the rupees that arrive, not the fee.** A service advertising "zero fees" often takes its cut in a worse exchange rate. The only number that matters:

> NPR received = (amount you send − fees) × exchange rate offered

Run that calculation across two or three services for your actual amount. The winner changes depending on how much you send and where from.

## Your options, roughly

- **Licensed remittance companies** (IME, Prabhu, City Express, Samsara, and the services built into apps your family already uses). Strong networks inside Nepal — cash pickup in most bazaars, or direct bank/wallet deposit.
- **Banks** (international wire to a Nepali bank account). Often the worst rate + highest fee for small amounts, but fine for large one-time transfers; ask both banks about intermediary charges.
- **International transfer apps** (Wise, Remitly, Western Union, etc., where available in your country). Rates vary a lot between them — compare on the day.
- **Wallet deposits** (eSewa, Khalti) — several remitters can deposit straight to a wallet, which is handy for family without a convenient bank branch.

## Why not hundi

Informal hundi networks sometimes quote a better rate. They are **illegal in Nepal**, with zero recourse if your money disappears, and the system undermines the remittance flows the country runs on. The few rupees saved are not worth carrying that risk — and the gap with licensed services has narrowed anyway.

## Practical tips

- **The NRB reference rate** ([our daily strip](https://onnepal.com) shows it) tells you how far a quoted rate is from "fair." A spread of more than 1–2 rupees per dollar deserves a comparison shop.
- **Send larger, less often** if fees are flat — four small monthly transfers usually cost more than one quarterly one. (Balance against your family''s cash-flow needs.)
- **Check the receive side.** Cash pickup hours, the nearest branch to your family, ID required for collection — friction there matters more than 50 paisa of rate.
- **Keep receipts.** You may need transfer records for visa applications or Nepal-side paperwork later.

## Official sources

- Nepal Rastra Bank (reference rates + licensed remitter list): [nrb.org.np](https://www.nrb.org.np)',
 NULL, 'Guide', 'published', 0,
 strftime('%s', 'now', '-6 days'), strftime('%s', 'now', '-6 days'), strftime('%s', 'now', '-6 days')),

('seed-g4', (SELECT id FROM users WHERE is_admin = 1 ORDER BY created_at LIMIT 1), 'noc-no-objection-certificate-study-abroad',
 'The NOC: Nepal''s No Objection Certificate for studying abroad',
 'Every Nepali student heading abroad needs one — and so does the family member managing it from Kathmandu. What it is, where to get it, what to bring.',
 '> **Processes change.** Confirm current requirements at the Ministry of Education portal or office before queuing. Last reviewed: June 2026.

## What it is

The **No Objection Certificate (NOC)** is a letter from Nepal''s Ministry of Education, Science and Technology stating the government has no objection to you studying in a specific country. You need it to:

- **Transfer tuition and living costs abroad** through Nepali banks (the bank will ask for it), and
- **Clear immigration at the airport** when leaving Nepal on a student visa — TIA checks it.

One NOC is tied to one country (and typically one institution). Changing country or university usually means a new NOC.

## The process

1. **Apply online** at the ministry''s NOC portal — [noc.moest.gov.np](https://noc.moest.gov.np) — then complete the in-person step at the NOC section (Kathmandu) as directed.
2. **Documents** typically include: citizenship certificate, passport, your **offer/admission letter** from the foreign institution, and academic transcripts/certificates. Bring originals plus copies.
3. **Pay the fee** (modest, payable as directed at the office/portal).
4. Issuance is usually quick once documents are in order — same day or a few days.

## Things that catch people out

- **Spelling consistency** across passport, citizenship, and the admission letter. (Noticing a theme across these guides? Nepali paperwork lives and dies on matching names.)
- **The bank wants the NOC before remitting tuition.** Sequence: admission letter → NOC → bank transfer → visa file. Don''t book the bank appointment before the NOC exists.
- **Applying from abroad:** if you''re already outside Nepal and need an NOC (e.g., changing study country), a family member in Kathmandu with your documents and an authorization letter can usually process it — confirm current rules with the ministry.
- **Keep extra copies.** Airport immigration, the bank, and sometimes the destination university''s compliance office all want to see it.

## Official sources

- NOC portal, Ministry of Education, Science & Technology: [noc.moest.gov.np](https://noc.moest.gov.np)
- Ministry of Education, Science & Technology: [moest.gov.np](https://moest.gov.np)

Corrections welcome in discussions — these offices update procedures often.',
 NULL, 'Guide', 'published', 0,
 strftime('%s', 'now', '-8 days'), strftime('%s', 'now', '-8 days'), strftime('%s', 'now', '-8 days'));
