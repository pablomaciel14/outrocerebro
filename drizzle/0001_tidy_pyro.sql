CREATE TABLE `highlights` (
	`id` text PRIMARY KEY NOT NULL,
	`reading_id` text NOT NULL,
	`user_id` text NOT NULL,
	`source` text NOT NULL,
	`page` integer,
	`quote` text NOT NULL,
	`color` text DEFAULT 'yellow' NOT NULL,
	`note` text DEFAULT '' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`reading_id`) REFERENCES `readings`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_highlights_user_reading` ON `highlights` (`user_id`,`reading_id`);