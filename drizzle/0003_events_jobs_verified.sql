-- Events table
CREATE TABLE `events` (
  `id` text PRIMARY KEY NOT NULL,
  `user_id` text NOT NULL REFERENCES `users`(`id`) ON DELETE CASCADE,
  `title` text NOT NULL,
  `description` text,
  `category` text NOT NULL,
  `start_date` text NOT NULL,
  `end_date` text,
  `start_time` text,
  `end_time` text,
  `venue` text,
  `location` text,
  `ticket_price` text,
  `ticket_url` text,
  `contact_phone` text,
  `contact_whatsapp` text,
  `image_urls` text,
  `status` text NOT NULL DEFAULT 'upcoming',
  `created_at` integer NOT NULL,
  `updated_at` integer NOT NULL
);
CREATE INDEX `events_user_idx` ON `events` (`user_id`);
CREATE INDEX `events_category_idx` ON `events` (`category`);
CREATE INDEX `events_status_idx` ON `events` (`status`);
CREATE INDEX `events_start_date_idx` ON `events` (`start_date`);

-- Jobs table
CREATE TABLE `jobs` (
  `id` text PRIMARY KEY NOT NULL,
  `user_id` text NOT NULL REFERENCES `users`(`id`) ON DELETE CASCADE,
  `title` text NOT NULL,
  `company` text NOT NULL,
  `description` text,
  `category` text NOT NULL,
  `type` text NOT NULL DEFAULT 'full-time',
  `location` text,
  `is_remote` integer NOT NULL DEFAULT 0,
  `salary` text,
  `experience` text,
  `apply_url` text,
  `contact_email` text,
  `contact_phone` text,
  `image_urls` text,
  `status` text NOT NULL DEFAULT 'open',
  `created_at` integer NOT NULL,
  `updated_at` integer NOT NULL,
  `expires_at` integer
);
CREATE INDEX `jobs_user_idx` ON `jobs` (`user_id`);
CREATE INDEX `jobs_category_idx` ON `jobs` (`category`);
CREATE INDEX `jobs_type_idx` ON `jobs` (`type`);
CREATE INDEX `jobs_status_idx` ON `jobs` (`status`);
CREATE INDEX `jobs_created_idx` ON `jobs` (`created_at`);

-- Verified badge on businesses
ALTER TABLE `businesses` ADD COLUMN `is_verified` integer NOT NULL DEFAULT 0;
