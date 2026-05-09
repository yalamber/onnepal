-- Second batch of seeded voices (v9-v16). Same conventions as seed-voices.sql:
--   * `INSERT OR IGNORE` on the unique slug → idempotent re-runs
--   * Author resolved to first admin user via subquery
--   * `published_at` staggered across recent days
--   * Cover image is an R2 key; `imageUrl()` prepends https://images.onnepal.com/
--   * Photographer credit URL carries Unsplash's required UTM params
--
-- Run locally:  npx wrangler d1 execute onnepal-db --local  --file=./scripts/seed-voices-2.sql
-- Run remotely: npx wrangler d1 execute onnepal-db --remote --file=./scripts/seed-voices-2.sql

INSERT OR IGNORE INTO voices (id, user_id, slug, title, excerpt, content, city, category, status, is_featured, published_at, created_at, updated_at) VALUES

('seed-v9', (SELECT id FROM users WHERE is_admin = 1 ORDER BY created_at LIMIT 1), 'boudha-kora-at-dawn',
 'The Boudha kora at dawn',
 'By 5:45 the first monks are circling. By 7 the tour buses arrive. The hour in between is the version of Boudha locals love.',
 '## The kora at dawn

The Boudhanath stupa is one of the few places in Kathmandu where the time of day completely changes what the place is.

If you arrive at 9am like most visitors, the kora — the clockwise circumambulation of the stupa — is shoulder-to-shoulder. Bus tours from Pokhara, day-trippers from Thamel, photographers with monopods, monks with phones, a few cows. The shops are open. The cafés are spilling out. It is wonderful, but it is busy.

Come at 5:45.

The first monks are already two laps in. You can hear the murmur of mantras low under the prayer wheels. The smell of butter lamps drifts from the side temples. The light, when it arrives, hits the eyes of the stupa first — those four pairs of eyes, looking out at the cardinal directions — and works its way down to the white dome. By the time it reaches the base, the rest of the city is still asleep.

This is not a secret. Every Boudha local knows. But for some reason most of the city''s tourists don''t.

### What to do

Walk the kora three times. (Tradition is at least three; locals do many more.) Stop at the southwest corner where there''s an old woman selling cardamom tea from a thermos for Rs 30. Don''t take pictures of the monks unless you ask. You don''t need to spin every prayer wheel — but spinning them in passing, lightly, with the right hand, is the friendly thing.

### When to leave

By 7am the buses arrive. That''s your signal. Walk back into Boudha proper, find Gita Cafe (the unmarked one above the western gate, not the one with the sign), order tea-and-toast, watch the morning fill up.

This is the Boudha worth getting out of bed for.',
 'Kathmandu', 'Neighborhood', 'published', 1,
 strftime('%s', 'now', '-1 days'), strftime('%s', 'now', '-1 days'), strftime('%s', 'now', '-1 days')),

('seed-v10', (SELECT id FROM users WHERE is_admin = 1 ORDER BY created_at LIMIT 1), 'kirtipur-the-city-that-gets-skipped',
 'Kirtipur, the city that gets skipped',
 'Twenty minutes from Patan and somehow not on any tourist itinerary. A weird, layered hilltop Newari town, mostly intact.',
 '## Kirtipur, the city that gets skipped

Most weekend itineraries through the valley list Kathmandu, Patan, Bhaktapur. Kirtipur, which is right there — twenty minutes south of Patan by bus — almost never makes the list. This is wrong, and I am here to fix it.

### The shape of the place

Kirtipur is built on a ridge. The old core sits up high; the newer expansion (Tribhuvan University, the dorms, the cafes) spreads out at the base. To do Kirtipur right you ignore the new town and walk straight up.

The streets are narrow. The houses are mostly traditional Newari — three or four storeys of brick, dark wood, carved windows. The pavement is the original stone. Cars cannot really enter, which means the soundscape is human voices and the occasional motorbike straining up.

### What to look for

The main square has an old shikhara temple (Bagh Bhairab) that is genuinely dramatic at sunset. Next to it is a sword tied to a wall — an offering from a long-ago military victory.

Walk around the back. There are at least four chowks (courtyards) tucked into the lanes. Each has a shrine, a well, a few daily-life things going on. People will look at you because tourists are uncommon. Smile.

### Where to eat

The Newari joint at the south end of the upper square — no name, you''ll know it because there are always at least three people sitting outside on plastic stools — does choila and chiura for around Rs 250. This is among the best meals you can have in the valley for that price.

### Why it''s skipped

The trip''s slightly annoying. There''s no direct bus from Thamel, the language is strongly Newari, and there is no information centre. None of that is bad — it''s why the place is still itself.',
 'Kirtipur', 'Neighborhood', 'published', 0,
 strftime('%s', 'now', '-7 days'), strftime('%s', 'now', '-7 days'), strftime('%s', 'now', '-7 days')),

('seed-v11', (SELECT id FROM users WHERE is_admin = 1 ORDER BY created_at LIMIT 1), 'tihar-in-eight-nights',
 'Tihar in eight nights',
 'Diyas, marigolds, sisters, brothers, dogs, cows, crows. A field guide to Nepal''s most layered week.',
 '## Tihar in eight nights

If you spend Tihar in Nepal you are basically eating sweets and watching candles for a week. This is correct and I support it. But here is what''s actually going on, day by day.

### Day 1 — Kaag Tihar (the crow)

A small plate of food gets put on the rooftop or front steps for the crows. Crows are the messengers of Yama, god of death. We are buying their goodwill. This is a one-minute observance. The streets are quiet.

### Day 2 — Kukur Tihar (the dog)

The dog gets a marigold garland, a tika, and snacks. This is the day the internet loses its mind every year because the photos are extremely good. If you do not have a dog, find one — temple dogs and street dogs are absolutely included.

### Day 3 — Gai Tihar / Lakshmi Puja (the cow, and the goddess)

Cow in the morning — same garland-and-tika treatment. In the evening, every doorway gets cleaned, decorated with rangoli (rice-flour and coloured-powder patterns), and rows and rows of oil lamps are lit to welcome Lakshmi, goddess of wealth. This is the night Kathmandu becomes unrecognisable. Walk anywhere — Thamel, Patan, your own street — at 8pm. The city is on fire in the prettiest way.

Children also come around in groups singing "Bhailo" — a kind of Nepali trick-or-treating without the trick. Give them a few rupees.

### Day 4 — Govardhan Puja / Mha Puja

Newars celebrate Mha Puja, the worship of the self. Yes — you. Your own body and life-force. There''s a mandap drawn at home, sweets, butter lamps. This is also Newari New Year (Nepal Sambat).

### Day 5 — Bhai Tika

The big one. Sisters tika brothers with seven coloured stripes (saptarangi tika). There is a long ritual, garlands made of makhmali (cockscomb) flowers — the only flower that lasts the year, symbolic of the brother''s long life — and an enormous plate of sweets, fruit, and dakshina (cash). Brothers reciprocate. Phones blow up with cousins-of-cousins coordinating logistics. If you have a sister, today is when she''s keeping you alive.

### And then

It ends quietly. The marigolds get composted. The diyas come down. The deusi-bhailo singers move on. The city goes back to itself, slightly heavier from the sweets.',
 'Kathmandu', 'Festival', 'published', 1,
 strftime('%s', 'now', '-3 days'), strftime('%s', 'now', '-3 days'), strftime('%s', 'now', '-3 days')),

('seed-v12', (SELECT id FROM users WHERE is_admin = 1 ORDER BY created_at LIMIT 1), 'coming-back',
 'Coming back',
 'I left for ten years. I came back. This is the unromantic version of why.',
 '## Coming back

Counterpoint to a previous voice on this site about why someone stayed: this is from someone who didn''t, and then did.

I left for an MS in 2014. I lived in the United States for ten years. I had what an outside observer would call the standard immigrant success story: degree, job at a big tech company, green card, savings account, an apartment in a nice part of a nice city. By any spreadsheet, the math worked.

I came back last year. Here is the unromantic version of why.

### The math is incomplete

The spreadsheet does not have a column for the texture of an evening walk. It does not have a column for being able to call your mother and have her come over in fifteen minutes because your kid has a fever. It does not have a column for the friend you have known since you were eight, or the way the light falls in Patan in October.

It is not that those things mean *more* than money or career trajectory. It is that they are not on the same axis. You don''t trade them off — you just notice, after enough years, that one column has been silently emptying out.

### The infrastructure is real

I will not lie about it. The power still cuts out. The roads in winter are bad. The air quality in the dry season is genuinely harmful. You get less efficient at most things. You spend more energy than you used to on things that should not require energy.

I am not arguing that this is fine. I am arguing that I am willing to pay the cost.

### The pull

The thing that finally moved me was small. My grandmother had a stroke. I flew home for the week. I sat with her, ate dal-bhat at 8pm with my parents, walked back through Mangal Bazaar at night past the temples I had forgotten the names of. The next morning I bought a one-way ticket and gave a month''s notice on Monday.

It is a cliché but I''ll say it: the things that matter to me were not where I was living.

### Is it for everyone

No. Most of my classmates are still abroad. They are happy. They are doing important work. I am not saying I made the right choice and they made the wrong one — I am saying I made the choice that was right for me. Almost everything we do, in the end, is like that.

### The version of me here

The version of me that I like best is the one that walks to the corner shop in flip-flops at 9pm to buy curd, and the shopkeeper knows my mother''s name, and the temple dog at the end of the street knows mine.

That''s the column the spreadsheet was missing.',
 'Kathmandu', 'Opinion', 'published', 0,
 strftime('%s', 'now', '-9 days'), strftime('%s', 'now', '-9 days'), strftime('%s', 'now', '-9 days')),

('seed-v13', (SELECT id FROM users WHERE is_admin = 1 ORDER BY created_at LIMIT 1), 'disappearing-potters-of-bhaktapur',
 'The disappearing potters of Bhaktapur',
 'Pottery Square has been making clay for 600 years. There are eight working families left. A short report on what''s at stake.',
 '## The disappearing potters of Bhaktapur

Bhaktapur''s Pottery Square — the small, unassuming open space south of the main Durbar Square, where you can still see clay drying in long flat rows on a sunny afternoon — has been a working pottery for at least six hundred years.

It will probably not exist as a working pottery in another twenty.

### The numbers

I asked the family I always buy from. In the 1980s, around forty households were making pottery on the square. Today, eight families still work clay full-time. The rest sell finished pots their parents made, or have moved into souvenir shops.

The reasons are the reasons every traditional craft is dying. Plastic is cheaper. Aluminium is cheaper. Local clay (sourced from the same fields outside Bhaktapur for centuries) is harder to find as those fields turn into apartment blocks. Sons and daughters become accountants. Imports are everywhere — the small terracotta diyas you light at Tihar are probably from a factory in Uttar Pradesh.

The few clay objects that still sell are the ones that are *only* clay: juju dhau pots (which the yoghurt-makers buy), and the small chiya cups (which Newari tea stalls still prefer). Everything else is being slowly outcompeted.

### What can be done

Honestly? I don''t know. I am not going to pretend a casual blog post has the answer to a structural problem. But here are three small things if you visit:

1. Buy a pot. The small ones cost Rs 200. They are nicer than any IKEA bowl you will ever own and the money goes directly to the family.
2. Don''t haggle aggressively. The margin is already thin.
3. Pass it on. Tell people. The square is worth a slow afternoon of just sitting and watching.

### Why I care

Six hundred years is a long time. Most things don''t last that long. When something does, and it''s still alive, and it''s still being made by hand on a square you can stand on — and it''s about to stop — that''s worth at least a paragraph and a Rs 200 pot.',
 'Bhaktapur', 'Craft', 'published', 1,
 strftime('%s', 'now', '-5 days'), strftime('%s', 'now', '-5 days'), strftime('%s', 'now', '-5 days')),

('seed-v14', (SELECT id FROM users WHERE is_admin = 1 ORDER BY created_at LIMIT 1), 'newari-thali-field-guide',
 'A field guide to Newari thali',
 'Choila, bara, samay baji, juju dhau. The fifteen things on a Newari plate, and what they actually are.',
 '## A field guide to Newari thali

Walk into a Newari restaurant in Kathmandu — Bhojan Griha, Honacha, the small ones in Bhaktapur — and you''ll be handed a brass plate (a *tha:*) with somewhere between ten and twenty small piles of food on it. Most visitors I take eat about three of them and ask what''s going on with the rest. So here is the field guide.

### The base

**Chiura** — beaten flattened rice. The white stuff in the middle. Functions as a starch. Eat with everything.

**Wo / bara** — a thick lentil pancake, around the size of your palm. Often topped with a fried egg or minced meat.

### The proteins (the centerpiece)

**Choila** — grilled buffalo (or chicken), cut into thumb-sized cubes, tossed with mustard oil, garlic, ginger, chillies, and *jimbu* (a local herb that smells like nothing else in the world). The headline.

**Sekuwa** — skewered grilled meat. Charcoal smoke is the point.

**Pakku** — a slow-cooked, almost gravy-stewed meat. Less common but worth ordering.

### The lentils, beans, vegetables

**Bhuti** — soaked and stir-fried beans (often black-eyed peas or soybean).

**Pancha kol** — a five-vegetable curry. Whatever''s in season.

**Bodi** — a long-bean stew.

**Aloo achar** — Newari-style cold potato salad with sesame and timur (Sichuan pepper).

### The pickles

**Lapsi achar** — a sour-sweet pickle from a small valley fruit, distinct enough that you''ll either love it or be confused.

**Mooli achar** — radish.

**Tomato achar** — tomato.

(There will probably be more. Try them.)

### The fermented and the strange

**Saa-li / sukuti** — dried, sometimes fried meat. Salty.

**Chatamari** — a thin rice-flour pancake with toppings. Sometimes called "Newari pizza" but it isn''t really.

### The drink

**Aila** — Newari rice spirit, served warm in small clay cups. Strong. Don''t drink it like beer.

### The end

**Juju dhau** — the King of Yoghurt, served from an unglazed clay pot. (See: a previous voice on the King of Yoghurt.) Sweet, set, custard-thick. End the meal here.

### How to eat it

With your right hand. There''s no fixed order. Take a small mouthful of chiura, mix it with a little of one or two things, eat. Repeat. Drink aila slowly.

### Where

In Kathmandu, Newa Lahana (Kirtipur side) is the cheapest and most authentic. Bhojan Griha (Dilli Bazaar) is the most touristy but actually still good. Honacha in Patan Durbar is the move for choila plus aila plus a view.',
 'Kathmandu', 'Food', 'published', 1,
 strftime('%s', 'now', '-1 days', '-12 hours'), strftime('%s', 'now', '-1 days', '-12 hours'), strftime('%s', 'now', '-1 days', '-12 hours')),

('seed-v15', (SELECT id FROM users WHERE is_admin = 1 ORDER BY created_at LIMIT 1), 'ilam-in-the-off-season',
 'Ilam in the off season',
 'Tea, mist, near silence. Eastern Nepal''s tea district is most photographed in spring. It is best in November.',
 '## Ilam in the off season

If you''ve seen photos of Ilam — the eastern hill district that produces most of Nepal''s tea — they were probably taken in March or April. Bright green new growth, women with woven baskets on their backs, sunlight through the leaves. It is rightfully iconic.

Go in November.

### Why

In the off season the bushes are darker, almost teal-green. The mornings are full of mist that doesn''t quite burn off. The pickers are not in the fields because the flush is over, which means the gardens are quiet. There are no group tours. There is one cafe in Kanyam open at 7am.

You will hear actual silence.

### How to get there

Most people fly to Bhadrapur and hire a jeep up to Ilam (3-4 hours). Adventurous routes from Kathmandu involve a day-and-a-half of bus and are not recommended unless you genuinely enjoy that kind of thing.

### Where to stay

The big tea-estate guesthouses (Kanyam, Sandakpur) are the obvious option. If you want quieter: there are a few homestays run by tea-farming families further north, around Antu Danda. The hot water is variable but the mountain views from the back porch will be clear in November.

### What to do

1. **Walk the rows.** Pick any path through the bushes. You don''t need a guide for this. You''ll be alone.
2. **Antu Danda sunrise.** A short drive from town. On a clear November dawn you''ll see Kangchenjunga clearly, with the tea fields in the foreground.
3. **Tea house, slowly.** The Kanyam estate''s small tasting room serves their full grade range — silver tip, golden monkey, a smoky black — for Rs 700. Plan two hours.
4. **The border.** Ilam is right against the Indian border (Pashupatinagar). Walking across is informal, atmospheric, and worth an afternoon.

### What not to do

Don''t try to "see it all in one day." The point is not coverage. The point is sitting on a porch with tea in November.',
 'Ilam', 'Guide', 'published', 0,
 strftime('%s', 'now', '-11 days'), strftime('%s', 'now', '-11 days'), strftime('%s', 'now', '-11 days')),

('seed-v16', (SELECT id FROM users WHERE is_admin = 1 ORDER BY created_at LIMIT 1), 'kathmandu-live-music-actually',
 'Where Kathmandu''s live music actually happens',
 'Not Thamel. A short list of small venues across the city where the actual scene plays.',
 '## Where Kathmandu''s live music actually happens

If you ask a hostel for "live music in Kathmandu" you will be sent to Thamel, where you will hear a Nepali cover band playing "Country Roads" for the seventh time that night, indifferently. This is not the scene.

Here''s where the scene actually is.

### Jazz Upstairs (Lazimpat)

A small, low-lit room above an Italian restaurant. Friday and Saturday nights from 8pm. The house quartet plays standards but the sit-ins are the point — a rotating cast of Kathmandu''s jazz musicians shows up. Cover charge: a drink minimum. The piano is in tune.

### House of Music (Thamel — but the back of Thamel)

Yes, technically Thamel, but at the quiet end. Original songwriters most weeknights, full-band sets on weekends. Newari, English, sometimes Hindi. Prashant Tamang has played here. So has Astha Tamang-Maskey on a quiet Tuesday.

### Mojo (Pulchowk)

Loud rock. The band Albatross has practically a residency. If you want a 22-year-old crowd shouting along to "Saadbau" in a sweaty basement, this is your place.

### LOD Bar (Jhamel)

Smaller, more curated. The owner is a producer; the lineup tilts indie-singer-songwriter. There''s a small open-mic on Wednesdays that is genuinely good (the regular performers are signed artists experimenting with new material).

### The unmarked bar above Patan Square

I''m not telling you which one. Walk around the back of the square in the evening. You''ll find it. Acoustic sets every other Friday. You''re welcome.

### The scene is small

Nepal''s live music scene is not vast. The same forty musicians cycle through these venues, often three nights a week. After two weeks of going out, you will recognise the bass player. After a month, you will recognise the bass player''s girlfriend. This is part of the charm.',
 'Kathmandu', 'Culture', 'published', 0,
 strftime('%s', 'now', '-13 days'), strftime('%s', 'now', '-13 days'), strftime('%s', 'now', '-13 days'));

-- Cover images + photographer credits (Unsplash). UTM params per Unsplash API
-- attribution guidelines so the photographer gets referral credit.
UPDATE voices SET
  cover_image_url   = 'seed/voices/boudha-kora.jpg',
  cover_credit_name = 'Meghraj Neupane',
  cover_credit_url  = 'https://unsplash.com/@meghraz?utm_source=onnepal&utm_medium=referral'
WHERE id = 'seed-v9';

UPDATE voices SET
  cover_image_url   = 'seed/voices/kirtipur-the-skipped.jpg',
  cover_credit_name = 'Saroj Shahi',
  cover_credit_url  = 'https://unsplash.com/@sarojshahi?utm_source=onnepal&utm_medium=referral'
WHERE id = 'seed-v10';

UPDATE voices SET
  cover_image_url   = 'seed/voices/tihar-eight-nights.jpg',
  cover_credit_name = 'Suchandra Roy Chowdhury',
  cover_credit_url  = 'https://unsplash.com/@artsy_lens21?utm_source=onnepal&utm_medium=referral'
WHERE id = 'seed-v11';

UPDATE voices SET
  cover_image_url   = 'seed/voices/coming-back.jpg',
  cover_credit_name = 'Slava Auchynnikau',
  cover_credit_url  = 'https://unsplash.com/@auchynnikau?utm_source=onnepal&utm_medium=referral'
WHERE id = 'seed-v12';

UPDATE voices SET
  cover_image_url   = 'seed/voices/bhaktapur-potters.jpg',
  cover_credit_name = 'Ritesh Singh',
  cover_credit_url  = 'https://unsplash.com/@creatographer?utm_source=onnepal&utm_medium=referral'
WHERE id = 'seed-v13';

UPDATE voices SET
  cover_image_url   = 'seed/voices/newari-thali-guide.jpg',
  cover_credit_name = 'Abhishek Sanwa Limbu',
  cover_credit_url  = 'https://unsplash.com/@abhishek_sanwa?utm_source=onnepal&utm_medium=referral'
WHERE id = 'seed-v14';

UPDATE voices SET
  cover_image_url   = 'seed/voices/ilam-off-season.jpg',
  cover_credit_name = 'Vasanth Kedige',
  cover_credit_url  = 'https://unsplash.com/@kedige?utm_source=onnepal&utm_medium=referral'
WHERE id = 'seed-v15';

UPDATE voices SET
  cover_image_url   = 'seed/voices/kathmandu-live-music.jpg',
  cover_credit_name = 'Sebastian Ervi',
  cover_credit_url  = 'https://unsplash.com/@sebastianervi?utm_source=onnepal&utm_medium=referral'
WHERE id = 'seed-v16';
