CREATE TABLE `capability_calls` (
	`id` text PRIMARY KEY NOT NULL,
	`workspace_id` text NOT NULL,
	`run_id` text NOT NULL,
	`capability_id` text NOT NULL,
	`target` text NOT NULL,
	`arguments` text NOT NULL,
	`status` text NOT NULL,
	`result` text,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `capability_calls_run` ON `capability_calls` (`run_id`);--> statement-breakpoint
CREATE TABLE `connections` (
	`id` text PRIMARY KEY NOT NULL,
	`workspace_id` text NOT NULL,
	`kind` text NOT NULL,
	`label` text NOT NULL,
	`sealed_secret` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `connections_workspace` ON `connections` (`workspace_id`);--> statement-breakpoint
CREATE TABLE `grants` (
	`id` text PRIMARY KEY NOT NULL,
	`workspace_id` text NOT NULL,
	`capability_id` text NOT NULL,
	`target` text NOT NULL,
	`scope` text NOT NULL,
	`created_by` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `grants_workspace` ON `grants` (`workspace_id`);--> statement-breakpoint
CREATE TABLE `inbox_items` (
	`id` text PRIMARY KEY NOT NULL,
	`workspace_id` text NOT NULL,
	`run_id` text,
	`origin` text NOT NULL,
	`task_id` text,
	`title` text NOT NULL,
	`is_blocking` integer NOT NULL,
	`payload` text NOT NULL,
	`state` text NOT NULL,
	`status` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `inbox_items_task_id_unique` ON `inbox_items` (`task_id`);--> statement-breakpoint
CREATE INDEX `inbox_items_workspace_status` ON `inbox_items` (`workspace_id`,`status`);--> statement-breakpoint
CREATE INDEX `inbox_items_run` ON `inbox_items` (`run_id`);--> statement-breakpoint
CREATE TABLE `memberships` (
	`workspace_id` text NOT NULL,
	`user_id` text NOT NULL,
	`role` text NOT NULL,
	`created_at` text NOT NULL,
	PRIMARY KEY(`workspace_id`, `user_id`)
);
--> statement-breakpoint
CREATE TABLE `observations` (
	`id` text PRIMARY KEY NOT NULL,
	`workspace_id` text NOT NULL,
	`run_id` text NOT NULL,
	`kind` text NOT NULL,
	`detail` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `observations_run_kind` ON `observations` (`run_id`,`kind`);--> statement-breakpoint
CREATE TABLE `passkeys` (
	`credential_id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`public_key` text NOT NULL,
	`counter` integer NOT NULL,
	`transports` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `projects` (
	`id` text PRIMARY KEY NOT NULL,
	`workspace_id` text NOT NULL,
	`name` text NOT NULL,
	`runner_id` text NOT NULL,
	`path` text NOT NULL,
	`environment_id` text NOT NULL,
	`connection_ids` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `push_subscriptions` (
	`endpoint` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`p256dh` text NOT NULL,
	`auth` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `push_subscriptions_user` ON `push_subscriptions` (`user_id`);--> statement-breakpoint
CREATE TABLE `runners` (
	`id` text PRIMARY KEY NOT NULL,
	`workspace_id` text NOT NULL,
	`name` text NOT NULL,
	`platform` text NOT NULL,
	`token_hash` text NOT NULL,
	`paired_at` text NOT NULL,
	`last_seen_at` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `runners_token_hash_unique` ON `runners` (`token_hash`);--> statement-breakpoint
CREATE TABLE `runs` (
	`id` text PRIMARY KEY NOT NULL,
	`workspace_id` text NOT NULL,
	`project_id` text NOT NULL,
	`standard_id` text NOT NULL,
	`principal` text NOT NULL,
	`spec` text NOT NULL,
	`added_capabilities` text NOT NULL,
	`state` text NOT NULL,
	`status` text NOT NULL,
	`summary` text,
	`outputs` text,
	`conversation_id` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `runs_workspace_created` ON `runs` (`workspace_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `runs_status` ON `runs` (`status`);--> statement-breakpoint
CREATE TABLE `sessions` (
	`token_hash` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`created_at` text NOT NULL,
	`expires_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `sessions_user_id` ON `sessions` (`user_id`);--> statement-breakpoint
CREATE TABLE `settings` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`display_name` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `workspaces` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`kind` text NOT NULL,
	`created_at` text NOT NULL
);
