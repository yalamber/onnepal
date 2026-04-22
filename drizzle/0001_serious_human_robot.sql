CREATE TABLE `classifieds` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`price` text,
	`category` text NOT NULL,
	`location` text,
	`contact_phone` text,
	`contact_whatsapp` text,
	`image_urls` text,
	`status` text DEFAULT 'active' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`expires_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `classifieds_user_idx` ON `classifieds` (`user_id`);--> statement-breakpoint
CREATE INDEX `classifieds_category_idx` ON `classifieds` (`category`);--> statement-breakpoint
CREATE INDEX `classifieds_status_idx` ON `classifieds` (`status`);--> statement-breakpoint
CREATE INDEX `classifieds_created_idx` ON `classifieds` (`created_at`);--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`username` text NOT NULL,
	`password_hash` text NOT NULL,
	`subdomain` text,
	`business_name` text,
	`business_category` text,
	`description` text,
	`logo_url` text,
	`cover_image_url` text,
	`phone` text,
	`address` text,
	`business_hours` text,
	`primary_color` text DEFAULT '#2563eb',
	`accent_color` text DEFAULT '#1d4ed8',
	`is_published` integer DEFAULT false NOT NULL,
	`onboarding_step` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_users`("id", "email", "username", "password_hash", "subdomain", "business_name", "business_category", "description", "logo_url", "cover_image_url", "phone", "address", "business_hours", "primary_color", "accent_color", "is_published", "onboarding_step", "created_at", "updated_at") SELECT "id", "email", "username", "password_hash", "subdomain", "business_name", "business_category", "description", "logo_url", "cover_image_url", "phone", "address", "business_hours", "primary_color", "accent_color", "is_published", "onboarding_step", "created_at", "updated_at" FROM `users`;--> statement-breakpoint
DROP TABLE `users`;--> statement-breakpoint
ALTER TABLE `__new_users` RENAME TO `users`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_username_unique` ON `users` (`username`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_subdomain_unique` ON `users` (`subdomain`);--> statement-breakpoint
CREATE INDEX `users_subdomain_idx` ON `users` (`subdomain`);