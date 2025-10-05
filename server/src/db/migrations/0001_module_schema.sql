CREATE SCHEMA "modules";
--> statement-breakpoint
CREATE TABLE "modules"."files" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"content" text NOT NULL,
	"content_hash" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "files_content_hash_unique" UNIQUE("content_hash")
);
--> statement-breakpoint
CREATE TABLE "modules"."module_to_file" (
	"module_id" uuid NOT NULL,
	"file_id" uuid NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_entry_point" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT false NOT NULL,
	CONSTRAINT "module_to_file_module_id_file_id_pk" PRIMARY KEY("module_id","file_id")
);
--> statement-breakpoint
CREATE TABLE "modules"."modules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"instructions" jsonb DEFAULT '[]' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "modules_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "modules"."user_modules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"module_id" uuid NOT NULL,
	"files" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "modules"."module_to_file" ADD CONSTRAINT "module_to_file_module_id_modules_id_fk" FOREIGN KEY ("module_id") REFERENCES "modules"."modules"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "modules"."module_to_file" ADD CONSTRAINT "module_to_file_file_id_files_id_fk" FOREIGN KEY ("file_id") REFERENCES "modules"."files"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "modules"."user_modules" ADD CONSTRAINT "user_modules_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "modules"."user_modules" ADD CONSTRAINT "user_modules_module_id_modules_id_fk" FOREIGN KEY ("module_id") REFERENCES "modules"."modules"("id") ON DELETE cascade ON UPDATE no action;