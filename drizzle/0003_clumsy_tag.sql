CREATE TABLE `bookmarks` (
	`id` text PRIMARY KEY NOT NULL,
	`reading_id` text NOT NULL,
	`user_id` text NOT NULL,
	`page` integer NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`reading_id`) REFERENCES `readings`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_bookmarks_user_reading_page` ON `bookmarks` (`user_id`,`reading_id`,`page`);