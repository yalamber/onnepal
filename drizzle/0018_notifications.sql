CREATE TABLE `notifications` (
  `id` text PRIMARY KEY NOT NULL,
  `user_id` text NOT NULL REFERENCES `users`(`id`) ON DELETE CASCADE,
  `type` text NOT NULL,
  `title` text NOT NULL,
  `body` text,
  `link_href` text,
  `is_read` integer NOT NULL DEFAULT 0,
  `created_at` integer NOT NULL
);
CREATE INDEX `notifications_user_idx` ON `notifications`(`user_id`);
CREATE INDEX `notifications_unread_idx` ON `notifications`(`user_id`, `is_read`);
CREATE INDEX `notifications_created_idx` ON `notifications`(`created_at`);

CREATE TABLE `notification_preferences` (
  `id` text PRIMARY KEY NOT NULL,
  `user_id` text NOT NULL REFERENCES `users`(`id`) ON DELETE CASCADE,
  `type` text NOT NULL,
  `in_app` integer NOT NULL DEFAULT 1,
  `created_at` integer NOT NULL,
  `updated_at` integer NOT NULL
);
CREATE UNIQUE INDEX `notification_prefs_unique` ON `notification_preferences`(`user_id`, `type`);
