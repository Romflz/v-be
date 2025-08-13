CREATE TYPE "public"."user_role" AS ENUM('user', 'business');--> statement-breakpoint
CREATE TABLE "businesses" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"name" text DEFAULT '' NOT NULL,
	"description" text,
	"website" text,
	"contact_email" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"uid" text NOT NULL,
	"name" text NOT NULL,
	"email" text,
	"picture" text,
	"email_verified" boolean DEFAULT false NOT NULL,
	"sign_in_provider" text,
	"tenant" text,
	"role" "user_role" DEFAULT 'user' NOT NULL,
	"last_login_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "businesses" ADD CONSTRAINT "businesses_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "businesses_user_id_uq" ON "businesses" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "users_uid_idx" ON "users" USING btree ("uid");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_uq" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "users_tenant_idx" ON "users" USING btree ("tenant");--> statement-breakpoint
CREATE INDEX "users_last_login_idx" ON "users" USING btree ("last_login_at");--> statement-breakpoint
CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");