CREATE TABLE `lost_found` (
  `id` text PRIMARY KEY NOT NULL,
  `user_id` text NOT NULL REFERENCES `users`(`id`) ON DELETE CASCADE,
  `type` text NOT NULL DEFAULT 'lost',
  `title` text NOT NULL,
  `description` text,
  `category` text NOT NULL,
  `location` text,
  `item_date` text,
  `reward` text,
  `contact_phone` text,
  `contact_whatsapp` text,
  `image_urls` text,
  `status` text NOT NULL DEFAULT 'open',
  `created_at` integer NOT NULL,
  `updated_at` integer NOT NULL
);
CREATE INDEX `lost_found_user_idx` ON `lost_found` (`user_id`);
CREATE INDEX `lost_found_type_idx` ON `lost_found` (`type`);
CREATE INDEX `lost_found_category_idx` ON `lost_found` (`category`);
CREATE INDEX `lost_found_status_idx` ON `lost_found` (`status`);
CREATE INDEX `lost_found_created_idx` ON `lost_found` (`created_at`);
