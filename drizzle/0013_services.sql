CREATE TABLE `services` (
  `id` text PRIMARY KEY NOT NULL,
  `user_id` text NOT NULL REFERENCES `users`(`id`) ON DELETE CASCADE,
  `title` text NOT NULL,
  `description` text,
  `category` text NOT NULL,
  `location` text,
  `price_type` text,
  `price` text,
  `contact_phone` text,
  `contact_whatsapp` text,
  `image_urls` text,
  `status` text NOT NULL DEFAULT 'active',
  `created_at` integer NOT NULL,
  `updated_at` integer NOT NULL
);

CREATE INDEX `services_category_idx` ON `services` (`category`);
CREATE INDEX `services_user_idx` ON `services` (`user_id`);
CREATE INDEX `services_status_idx` ON `services` (`status`);
CREATE INDEX `services_created_idx` ON `services` (`created_at`);
