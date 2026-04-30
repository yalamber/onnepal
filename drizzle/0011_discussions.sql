CREATE TABLE `discussions` (
  `id` text PRIMARY KEY NOT NULL,
  `user_id` text NOT NULL REFERENCES `users`(`id`) ON DELETE CASCADE,
  `title` text NOT NULL,
  `content` text,
  `category` text NOT NULL,
  `is_pinned` integer NOT NULL DEFAULT 0,
  `reply_count` integer NOT NULL DEFAULT 0,
  `last_activity_at` integer NOT NULL,
  `created_at` integer NOT NULL,
  `updated_at` integer NOT NULL
);

CREATE TABLE `discussion_replies` (
  `id` text PRIMARY KEY NOT NULL,
  `discussion_id` text NOT NULL REFERENCES `discussions`(`id`) ON DELETE CASCADE,
  `user_id` text NOT NULL REFERENCES `users`(`id`) ON DELETE CASCADE,
  `content` text NOT NULL,
  `created_at` integer NOT NULL
);

CREATE INDEX `discussions_category_idx` ON `discussions` (`category`);
CREATE INDEX `discussions_user_idx` ON `discussions` (`user_id`);
CREATE INDEX `discussions_last_activity_idx` ON `discussions` (`last_activity_at`);
CREATE INDEX `discussion_replies_discussion_idx` ON `discussion_replies` (`discussion_id`);
CREATE INDEX `discussion_replies_user_idx` ON `discussion_replies` (`user_id`);
