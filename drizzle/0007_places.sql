CREATE TABLE `places` (
  `id` text PRIMARY KEY NOT NULL,
  `user_id` text NOT NULL REFERENCES `users`(`id`) ON DELETE CASCADE,
  `title` text NOT NULL,
  `description` text,
  `category` text NOT NULL,
  `location` text,
  `district` text,
  `address` text,
  `image_urls` text,
  `contact_phone` text,
  `contact_whatsapp` text,
  `website` text,
  `status` text NOT NULL DEFAULT 'active',
  `created_at` integer NOT NULL,
  `updated_at` integer NOT NULL
);
CREATE INDEX `places_user_idx` ON `places` (`user_id`);
CREATE INDEX `places_category_idx` ON `places` (`category`);
CREATE INDEX `places_status_idx` ON `places` (`status`);
CREATE INDEX `places_district_idx` ON `places` (`district`);
CREATE INDEX `places_created_idx` ON `places` (`created_at`);
