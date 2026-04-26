CREATE TABLE `messages` (
  `id` text PRIMARY KEY NOT NULL,
  `sender_id` text NOT NULL REFERENCES `users`(`id`) ON DELETE CASCADE,
  `recipient_id` text NOT NULL REFERENCES `users`(`id`) ON DELETE CASCADE,
  `listing_type` text NOT NULL,
  `listing_id` text NOT NULL,
  `listing_title` text NOT NULL,
  `content` text NOT NULL,
  `is_read` integer NOT NULL DEFAULT 0,
  `created_at` integer NOT NULL
);
CREATE INDEX `messages_sender_idx` ON `messages` (`sender_id`);
CREATE INDEX `messages_recipient_idx` ON `messages` (`recipient_id`);
CREATE INDEX `messages_listing_idx` ON `messages` (`listing_type`, `listing_id`);
CREATE INDEX `messages_created_idx` ON `messages` (`created_at`);
