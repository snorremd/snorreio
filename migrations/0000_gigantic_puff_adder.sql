CREATE TABLE `likes` (
	`session_id` text,
	`slug` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `likes_session_id_slug_unique` ON `likes` (`session_id`,`slug`);