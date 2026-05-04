CREATE TABLE `voices` (
  `id` text PRIMARY KEY NOT NULL,
  `user_id` text NOT NULL REFERENCES `users`(`id`) ON DELETE CASCADE,
  `slug` text NOT NULL UNIQUE,
  `title` text NOT NULL,
  `excerpt` text,
  `content` text NOT NULL,
  `cover_image_url` text,
  `city` text,
  `category` text,
  `status` text NOT NULL DEFAULT 'pending',
  `is_featured` integer NOT NULL DEFAULT 0,
  `published_at` integer,
  `created_at` integer NOT NULL,
  `updated_at` integer NOT NULL
);
CREATE INDEX `voices_user_idx` ON `voices`(`user_id`);
CREATE INDEX `voices_slug_idx` ON `voices`(`slug`);
CREATE INDEX `voices_status_idx` ON `voices`(`status`);
CREATE INDEX `voices_featured_idx` ON `voices`(`is_featured`);
CREATE INDEX `voices_published_idx` ON `voices`(`published_at`);
CREATE INDEX `voices_city_idx` ON `voices`(`city`);
