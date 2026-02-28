CREATE TABLE `app_settings` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`value` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `chat_files` (
	`id` text PRIMARY KEY NOT NULL,
	`chat_id` text NOT NULL,
	`file_key` text NOT NULL,
	`file_name` text NOT NULL,
	`file_url` text NOT NULL,
	`file_size` integer,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`chat_id`) REFERENCES `chats`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `chats` (
	`id` text PRIMARY KEY NOT NULL,
	`pdf_name` text,
	`pdf_url` text,
	`created_at` integer NOT NULL,
	`user_id` text NOT NULL,
	`file_key` text
);
--> statement-breakpoint
CREATE TABLE `feature_flags` (
	`id` text PRIMARY KEY NOT NULL,
	`flag` text NOT NULL,
	`enabled` integer DEFAULT false
);
--> statement-breakpoint
CREATE TABLE `messages` (
	`id` text PRIMARY KEY NOT NULL,
	`chat_id` text NOT NULL,
	`content` text NOT NULL,
	`created_at` integer NOT NULL,
	`role` text NOT NULL,
	`model` text,
	FOREIGN KEY (`chat_id`) REFERENCES `chats`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `sources` (
	`id` text PRIMARY KEY NOT NULL,
	`message_id` text NOT NULL,
	`chat_id` text NOT NULL,
	`data` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`message_id`) REFERENCES `messages`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`chat_id`) REFERENCES `chats`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `subscriptions` (
	`id` text NOT NULL,
	`user_id` text NOT NULL,
	`stripe_customer_id` text NOT NULL,
	`stripe_subscription_id` text,
	`stripe_price_id` text,
	`stripe_current_period_end` integer
);
--> statement-breakpoint
CREATE TABLE `user_settings` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`message_count` integer DEFAULT 0 NOT NULL,
	`free_chats` integer,
	`free_messages` integer,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `subscriptions_user_id_unique` ON `subscriptions` (`user_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `subscriptions_stripe_customer_id_unique` ON `subscriptions` (`stripe_customer_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `subscriptions_stripe_subscription_id_unique` ON `subscriptions` (`stripe_subscription_id`);