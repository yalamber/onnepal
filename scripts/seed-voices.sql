-- Seed sample voices content. Author = yalamber's account (admin user).
-- Run locally: npx wrangler d1 execute onnepal-db --local --file=./scripts/seed-voices.sql
-- Run remotely: npx wrangler d1 execute onnepal-db --remote --file=./scripts/seed-voices.sql
--
-- Uses ON CONFLICT (slug) DO NOTHING semantics via unique-index INSERT OR IGNORE
-- so re-running this is idempotent (won't dupe).
--
-- 8 voices: 4 featured (homepage mosaic), 4 unfeatured (filling the
-- "Latest voices" community section + the /voices grid).
-- All status='published', publishedAt staggered over recent days.

INSERT OR IGNORE INTO voices (id, user_id, slug, title, excerpt, content, city, category, status, is_featured, published_at, created_at, updated_at) VALUES
('seed-v1', (SELECT id FROM users WHERE is_admin = 1 ORDER BY created_at LIMIT 1), 'patan-after-the-rain',
 'A walk through Patan after the rain',
 'The brick courtyards turn copper, the chowks empty out, and for an hour Patan belongs only to the walkers. A field guide.',
 '## After the rain

Patan is a different city for the hour after a monsoon shower. The tourists who fill Durbar Square at noon retreat under awnings. The brick takes on that particular wet-copper colour you only see on the old buildings. Cars go quiet. The smell of smoke from the Bhimsen temple cuts harder.

If you have an umbrella and an hour, this is the walk.

### Start at Mangal Bazaar

Begin at the south end of Durbar Square, just below the Krishna Mandir. The square will be mostly empty — a couple of locals on plastic chairs, the lazy temple dogs.

### Cross to Hakha tole

Cut west through the narrow lane next to Bhimsen Mandir. There is a chowk with a small Ganesh shrine where, almost reliably, a man sells freshly fried sel roti from a tin.

### Find the carved windows on Sundhara marg

There''s a stretch of three or four houses with original carved struts and lattice windows. Easy to walk past on a normal day; impossible to ignore in the wet.

### End at the Patan Museum cafe

The cafe in the museum courtyard has the best view of Sundari Chowk in the rain. Order tea. Stay too long.',
 'Lalitpur', 'Neighborhood', 'published', 1,
 strftime('%s', 'now', '-2 days'), strftime('%s', 'now', '-2 days'), strftime('%s', 'now', '-2 days')),

('seed-v2', (SELECT id FROM users WHERE is_admin = 1 ORDER BY created_at LIMIT 1), 'twelve-momo-joints',
 'Twelve momo joints worth a detour',
 'Not a list of the most famous spots — a list of the ones I keep going back to. Greasy buff, juicy chicken, a couple of surprises.',
 '## Twelve momo joints worth a detour

Disclaimer: this is not the definitive list. It is *my* list, refined over a decade of probably eating too many momos.

### Lazimpat / Hattisar

**1. Yangling Tibetan, Lazimpat.** Buff momos. The dough is the right thickness. Dip is fierce.

**2. New Everest Momo, Hattisar.** Underrated. The chicken jhol is what you order.

### Patan

**3. Bota, Jhamsikhel.** Steamed buff. The ginger they slip into the filling.

**4. The momo cart at the south gate of Patan Durbar Square.** No name. Cash only. There is no menu — you say a number, you get that many. They are perfect.

### Boudha

**5. Saturday Cafe.** Tibetan momos with sui (broth) on the side.

### And seven more I''m not telling you about until you find your own first.',
 'Kathmandu', 'Food', 'published', 1,
 strftime('%s', 'now', '-4 days'), strftime('%s', 'now', '-4 days'), strftime('%s', 'now', '-4 days')),

('seed-v3', (SELECT id FROM users WHERE is_admin = 1 ORDER BY created_at LIMIT 1), 'champadevi-half-day-hike',
 'A guide to half-day hikes from the Kathmandu valley',
 'Champadevi, Phulchowki, Shivapuri base, Nagarkot ridge. When you have four hours and a craving for altitude.',
 '## Half-day hikes around the valley

You don''t need a long weekend to remember why you live here.

### Champadevi (4-5 hours round trip)

Start at Hattiban resort. The trail climbs steadily through pine forest. Around the saddle there are mountain views on a clear morning. The summit shrine is small but the view of the valley is unreasonable.

### Phulchowki (5-6 hours)

The longer one. Start at Godavari. Best in October-November when the rhododendrons are not in bloom but the visibility is.

### Shivapuri base loop (3 hours)

For days when you don''t feel like climbing. Enter at Budhanilkantha, do the lower loop, exit at the same spot. Birdsong is the point.

### Nagarkot ridge walk (4 hours)

Catch a Sajha bus or share-jeep to Nagarkot. Walk the ridge towards Telkot. Take a taxi back. Best if you start at 5am and watch the Himalayas turn pink.',
 'Kathmandu', 'Trail', 'published', 1,
 strftime('%s', 'now', '-6 days'), strftime('%s', 'now', '-6 days'), strftime('%s', 'now', '-6 days')),

('seed-v4', (SELECT id FROM users WHERE is_admin = 1 ORDER BY created_at LIMIT 1), 'pokhara-lakeside-mornings',
 'Lakeside mornings in Pokhara, before the boats',
 'The shore at 5:45am is somebody else''s city. Ten minutes from the tourist strip, completely different. A small love letter.',
 '## Pokhara, before the boats

The trick to Pokhara is being awake before the rest of it.

By 7am the lakeside fills up. Tourists order American breakfasts. Boatmen position themselves. The reflection of Machhapuchhre — when the cloud lifts — is filtered through twenty selfie sticks.

But at 5:45am, walking south from the southern lakeside down to the dam side, you are mostly alone. Fishermen are hauling their first nets. The water is still and silver. The coffee shop near Hotel Lake Star opens at 6 sharp. A black coffee, a borrowed plastic chair, and the mountains.

This is the city worth coming for.',
 'Pokhara', 'Neighborhood', 'published', 1,
 strftime('%s', 'now', '-8 days'), strftime('%s', 'now', '-8 days'), strftime('%s', 'now', '-8 days')),

('seed-v5', (SELECT id FROM users WHERE is_admin = 1 ORDER BY created_at LIMIT 1), 'indra-jatra-walking-tour',
 'Indra Jatra after-hours, mapped',
 'The chariots, the pole-raising, the hidden chowks. A residents guide to the festival you think you know.',
 '## Indra Jatra, mapped

Indra Jatra is one of those festivals that looks chaotic from the outside and is in fact precisely choreographed. Here is the resident''s tour.

### The pole-raising at Hanuman Dhoka

Start of the festival proper. The lingo (a wooden pole) is raised on the first day. If you go, go early — by mid-morning the square is impassable.

### The Kumari rath jatra

The Kumari''s chariot is pulled through the old city over three nights. The route is fixed; the timing slips. Locals know to camp at intersections and wait.

### Lakhe, Sawa Bhakku, and the masked dances

These appear in pockets through the old city, mostly after dark. The trick is knowing which chowk has which dance on which night. Ask the elders sitting on the rest-platforms (phalcha) — they will tell you.

### After it ends

The pole comes down on the eighth day. Most tourists have moved on to Dashain prep by then. The takedown is its own quiet ceremony. Worth the late evening.',
 'Kathmandu', 'Festival', 'published', 0,
 strftime('%s', 'now', '-10 days'), strftime('%s', 'now', '-10 days'), strftime('%s', 'now', '-10 days')),

('seed-v6', (SELECT id FROM users WHERE is_admin = 1 ORDER BY created_at LIMIT 1), 'bhaktapur-juju-dhau',
 'A short essay on juju dhau',
 'Bhaktapur''s "king of yoghurt" is more interesting than the postcard says. Earthen pots, century-old families, and why the texture is what it is.',
 '## Juju dhau

Juju dhau — "the king of yoghurt" — is one of those things you can buy in Kathmandu but should eat in Bhaktapur. The reason is fresh.

The yoghurt comes in unglazed clay pots about the size of a small cup. The clay matters. The porous walls let some of the water wick out, concentrating the rest. By the time you eat it the texture is between custard and cheese.

A handful of families in Bhaktapur make most of the city''s juju dhau. The recipe is closely held. Buffalo milk, cardamom, a hint of saffron, and a starter culture passed forward across generations. The fermentation is slow.

You can buy a pot for under Rs 100 in Bhaktapur Durbar Square. Eat it sitting on the edge of the square, with the sun coming off the brick.',
 'Bhaktapur', 'Food', 'published', 0,
 strftime('%s', 'now', '-12 days'), strftime('%s', 'now', '-12 days'), strftime('%s', 'now', '-12 days')),

('seed-v7', (SELECT id FROM users WHERE is_admin = 1 ORDER BY created_at LIMIT 1), 'why-i-stayed',
 'Why I stayed',
 'Everyone in my class moved abroad. Here is the unpolished version of why I didn''t.',
 '## Why I stayed

This is not a defense of Nepal. It is a defense of staying.

When I was 22, every classmate I knew was applying for an MS abroad. Australia, Canada, the US, Germany. The reasons were good ones — pay, opportunity, escape from a politics that had become tiring before it had even become interesting. I did the GRE. I had the offers. I didn''t go.

I have spent a decade since trying to articulate why.

The cleanest version is this: the things I want to be near are here. My grandmother''s house is here. The trail to Champadevi is here. The friend I have known since I was 8 is here. The version of me that I like best is the version that walks home through Patan in the dusk.

It is not for everyone. The infrastructure is not what it should be. The corruption is not what it should be. The brain drain is real and it costs us. I do not pretend it doesn''t.

But staying is also a choice. And someone has to stay.',
 'Lalitpur', 'Opinion', 'published', 0,
 strftime('%s', 'now', '-14 days'), strftime('%s', 'now', '-14 days'), strftime('%s', 'now', '-14 days')),

('seed-v8', (SELECT id FROM users WHERE is_admin = 1 ORDER BY created_at LIMIT 1), 'janakpur-by-train',
 'Janakpur by train (yes, train)',
 'Nepal has one passenger railway. It runs to Janakpur. A short report on what the journey is like.',
 '## Janakpur by train

Did you know Nepal has a passenger railway?

The Janakpur–Jaynagar line, which runs from the Mithila plains across the Indian border, is Nepal''s only operational passenger train. After years of disrepair the new Indian-supplied DEMU coaches now run a daily service.

The journey from Janakpur to the border at Bijalpura is short — under an hour. But the experience is the point. The train is full of people who use it for genuinely practical reasons. Vendors, students, traders. The fields slide past. The train smells of metal and tea.

I went in November. The fare was under Rs 100. The seats were padded. The conductor came through clipping tickets, exactly like a real railway. I forgot I was in Nepal for a few minutes.

Janakpur deserves more visitors anyway. The Janaki Mandir. The kunds. Mithila painting in the streets. Go see it. And take the train at least once while you are there.',
 'Janakpur', 'Guide', 'published', 0,
 strftime('%s', 'now', '-18 days'), strftime('%s', 'now', '-18 days'), strftime('%s', 'now', '-18 days'));
