CREATE TABLE `model_providers` (
	`id` text PRIMARY KEY NOT NULL,
	`kind` text NOT NULL,
	`name` text NOT NULL,
	`base_url` text,
	`sealed_api_key` text,
	`created_at` text NOT NULL
);
