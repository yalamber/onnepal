CREATE TABLE `bookmarks` (
  `id` text PRIMARY KEY NOT NULL,
  `user_id` text NOT NULL REFERENCES `users`(`id`) ON DELETE CASCADE,
  `target_type` text NOT NULL,
  `target_id` text NOT NULL,
  `created_at` integer NOT NULL
);
CREATE INDEX `bookmarks_user_idx` ON `bookmarks` (`user_id`);
CREATE INDEX `bookmarks_target_idx` ON `bookmarks` (`target_type`, `target_id`);

CREATE TABLE `reports` (
  `id` text PRIMARY KEY NOT NULL,
  `user_id` text NOT NULL REFERENCES `users`(`id`) ON DELETE CASCADE,
  `target_type` text NOT NULL,
  `target_id` text NOT NULL,
  `reason` text NOT NULL,
  `status` text NOT NULL DEFAULT 'pending',
  `created_at` integer NOT NULL
);
CREATE INDEX `reports_user_idx` ON `reports` (`user_id`);
CREATE INDEX `reports_status_idx` ON `reports` (`status`);
