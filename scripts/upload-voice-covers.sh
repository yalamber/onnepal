#!/usr/bin/env bash
#
# Download the 8 sample voice cover photos from Unsplash and upload them to R2.
# The seed SQL in `seed-voices.sql` then references them by R2 key only —
# `seed/voices/<slug>.jpg` — and the `imageUrl()` helper resolves those at
# render time to `https://images.onnepal.com/seed/voices/<slug>.jpg`.
#
# This script is idempotent: re-running re-downloads + re-uploads, overwriting.
# Pre-req: `wrangler login` and CLOUDFLARE_ACCOUNT_ID set (or single account).
#
# Usage:
#   ./scripts/upload-voice-covers.sh remote   # production R2
#   ./scripts/upload-voice-covers.sh local    # wrangler dev R2 emulator

set -euo pipefail
target="${1:-remote}"
flag="--${target}"

tmp="$(mktemp -d -t voice-covers-XXXXXX)"
trap 'rm -rf "$tmp"' EXIT

# slug → unsplash photo id
declare -a entries=(
  "patan-after-the-rain:1731052368947-9f262c4e9f4c"      # building / Kathmandu architecture
  "twelve-momo-joints:1534422298391-e4f8c172dddb"        # dumplings
  "champadevi-half-day-hike:1637217644936-6b505db635f3"  # mountain trail
  "pokhara-lakeside-mornings:1647679208171-85d25dcc22c2" # Phewa lake
  "indra-jatra-walking-tour:1770122473457-915e601b42a9"  # Nepal festival
  "bhaktapur-juju-dhau:1633931764525-0234c405c8e7"       # yogurt in clay
  "why-i-stayed:1580424917967-a8867a6e676e"              # mountains / pastoral
  "janakpur-by-train:1685858874777-b87106319be7"         # rural railway
)

for entry in "${entries[@]}"; do
  slug="${entry%%:*}"
  photo_id="${entry##*:}"
  echo "→ ${slug}"
  curl -sS -L -o "${tmp}/${slug}.jpg" \
    "https://images.unsplash.com/photo-${photo_id}?w=1600&q=80&auto=format&fit=crop"
  npx wrangler r2 object put "onnepal-images/seed/voices/${slug}.jpg" \
    --file="${tmp}/${slug}.jpg" \
    --content-type="image/jpeg" \
    --cache-control="public, max-age=31536000, immutable" \
    "${flag}" >/dev/null
  echo "   uploaded"
done

echo
echo "Done. Now apply the seed:"
echo "  npx wrangler d1 execute onnepal-db ${flag} --file=./scripts/seed-voices.sql"
