CREATE TABLE `password_reset_tokens` (
  `id` text PRIMARY KEY NOT NULL,
  `user_id` text NOT NULL REFERENCES `users`(`id`) ON DELETE CASCADE,
  `token_hash` text NOT NULL UNIQUE,
  `expires_at` integer NOT NULL,
  `consumed_at` integer,
  `created_at` integer NOT NULL
);
CREATE INDEX `prt_user_idx` ON `password_reset_tokens`(`user_id`);
CREATE INDEX `prt_token_hash_idx` ON `password_reset_tokens`(`token_hash`);
CREATE INDEX `prt_expires_idx` ON `password_reset_tokens`(`expires_at`);
