CREATE TABLE `agenda_items` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`title` text NOT NULL,
	`notes` text DEFAULT '' NOT NULL,
	`date` text NOT NULL,
	`start_time` text,
	`end_time` text,
	`kind` text DEFAULT 'task' NOT NULL,
	`color` text DEFAULT 'violet' NOT NULL,
	`done` integer DEFAULT false NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_agenda_items_user_date` ON `agenda_items` (`user_id`,`date`);--> statement-breakpoint
CREATE TABLE `workspace_pages` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`area` text DEFAULT 'memoria' NOT NULL,
	`title` text NOT NULL,
	`content` text DEFAULT '' NOT NULL,
	`icon` text DEFAULT '📝' NOT NULL,
	`favorite` integer DEFAULT false NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_workspace_pages_user_area_updated` ON `workspace_pages` (`user_id`,`area`,`updated_at`);