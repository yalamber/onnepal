-- Add photographer credit fields to voices.
-- Rendered on the voice detail page as "Photo by <name> on <source>".
-- The URL is already expected to carry any UTM params required by the
-- source platform (Unsplash needs ?utm_source=<app>&utm_medium=referral).

ALTER TABLE voices ADD COLUMN cover_credit_name TEXT;
ALTER TABLE voices ADD COLUMN cover_credit_url TEXT;
