CREATE TABLE `comments` (
  `id` text PRIMARY KEY NOT NULL,
  `user_id` text NOT NULL REFERENCES `users`(`id`) ON DELETE CASCADE,
  `target_type` text NOT NULL,
  `target_id` text NOT NULL,
  `content` text NOT NULL,
  `created_at` integer NOT NULL
);
CREATE INDEX `comments_target_idx` ON `comments` (`target_type`, `target_id`);
CREATE INDEX `comments_user_idx` ON `comments` (`user_id`);
CREATE INDEX `comments_created_idx` ON `comments` (`created_at`);
