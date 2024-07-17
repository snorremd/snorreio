-- Migration number: 0001 	 2024-07-05T10:06:11.449Z
create table if not exists `likes` (
	`session_id` text not null,
	`collection` text not null,
	`slug` text not null,
  `created_at` integer default 0 not null,
	primary key(`collection`, `session_id`, `slug`)
);