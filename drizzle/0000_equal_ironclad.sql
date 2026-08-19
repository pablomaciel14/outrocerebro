CREATE TABLE `readings` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`title` text NOT NULL,
	`file_name` text NOT NULL,
	`r2_key` text NOT NULL,
	`markdown` text DEFAULT '' NOT NULL,
	`status` text DEFAULT 'wishlist' NOT NULL,
	`current_page` integer DEFAULT 1 NOT NULL,
	`total_pages` integer DEFAULT 1 NOT NULL,
	`total_seconds` integer DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`completed_at` text
);
--> statement-breakpoint
CREATE INDEX `idx_readings_user_updated` ON `readings` (`user_id`,`updated_at`);--> statement-breakpoint
CREATE INDEX `idx_readings_user_status` ON `readings` (`user_id`,`status`);