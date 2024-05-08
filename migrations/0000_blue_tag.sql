CREATE TABLE `likes` (
	`session_id` text,
	`collection` text,
	`slug` text,
	PRIMARY KEY(`collection`, `session_id`, `slug`)
);
