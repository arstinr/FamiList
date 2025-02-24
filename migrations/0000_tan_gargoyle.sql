CREATE TYPE "public"."task_importance" AS ENUM('low', 'medium', 'high');--> statement-breakpoint
CREATE TYPE "public"."task_urgency" AS ENUM('low', 'medium', 'high');--> statement-breakpoint
CREATE TABLE "lists" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"user_id" serial NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tasks" (
	"id" serial PRIMARY KEY NOT NULL,
	"list_id" serial NOT NULL,
	"description" text NOT NULL,
	"notes" text,
	"completed" boolean DEFAULT false NOT NULL,
	"assigned_to" text,
	"urgency" "task_urgency" DEFAULT 'medium',
	"importance" "task_importance" DEFAULT 'medium'
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
