CREATE TYPE "public"."business_status" AS ENUM('active', 'inactive', 'suspended');--> statement-breakpoint
CREATE TYPE "public"."provider_type" AS ENUM('individual', 'agency', 'business');--> statement-breakpoint
CREATE TYPE "public"."review_type" AS ENUM('client_to_provider', 'provider_to_client');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('client', 'provider');--> statement-breakpoint
CREATE TYPE "public"."user_verification_status" AS ENUM('pending', 'verified', 'unverified');--> statement-breakpoint
CREATE TYPE "public"."user_visibility" AS ENUM('public', 'private', 'anonymous');--> statement-breakpoint
CREATE TABLE "clients" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"first_name" text DEFAULT '' NOT NULL,
	"last_name" text DEFAULT '' NOT NULL,
	"bio" text,
	"company" text,
	"location" text,
	"timezone" text,
	"total_jobs_posted" integer DEFAULT 0,
	"total_spent" integer DEFAULT 0,
	"avg_rating" integer DEFAULT 0,
	"total_reviews" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "clients_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "providers" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"business_name" text NOT NULL,
	"tagline" text,
	"description" text,
	"provider_type" "provider_type" DEFAULT 'individual',
	"website" text,
	"contact_email" text,
	"linkedin" text,
	"portfolio" text,
	"location" text,
	"timezone" text,
	"is_available" boolean DEFAULT true,
	"hourly_rate" integer,
	"currency" text DEFAULT 'USD',
	"total_jobs" integer DEFAULT 0,
	"completion_rate" integer DEFAULT 100,
	"avg_rating" integer DEFAULT 0,
	"total_reviews" integer DEFAULT 0,
	"status" "business_status" DEFAULT 'active',
	"verified_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "providers_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "reviews" (
	"id" serial PRIMARY KEY NOT NULL,
	"reviewer_id" integer NOT NULL,
	"reviewee_id" integer NOT NULL,
	"review_type" "review_type" NOT NULL,
	"job_id" integer,
	"contract_id" integer,
	"rating" integer NOT NULL,
	"title" text,
	"comment" text NOT NULL,
	"communication_rating" integer,
	"quality_rating" integer,
	"timeliness_rating" integer,
	"professionalism_rating" integer,
	"is_public" boolean DEFAULT true,
	"is_verified" boolean DEFAULT false,
	"response" text,
	"response_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_preferences" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"visibility" "user_visibility" DEFAULT 'public',
	"show_email" boolean DEFAULT false,
	"show_phone" boolean DEFAULT false,
	"email_notifications" boolean DEFAULT true,
	"sms_notifications" boolean DEFAULT false,
	"push_notifications" boolean DEFAULT true,
	"notify_new_messages" boolean DEFAULT true,
	"notify_job_updates" boolean DEFAULT true,
	"notify_reviews" boolean DEFAULT true,
	"notify_payments" boolean DEFAULT true,
	"language" text DEFAULT 'en',
	"currency" text DEFAULT 'USD',
	"theme" text DEFAULT 'light',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_preferences_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"uid" text NOT NULL,
	"sign_in_provider" text,
	"tenant" text,
	"name" text NOT NULL,
	"picture" text,
	"email" text,
	"email_verified" boolean DEFAULT false NOT NULL,
	"mobile_number_prefix" text,
	"mobile_number" text,
	"mobile_number_verified" boolean DEFAULT false NOT NULL,
	"role" "user_role" DEFAULT 'client' NOT NULL,
	"verification_status" "user_verification_status" DEFAULT 'pending',
	"last_login_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_uid_unique" UNIQUE("uid"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "clients" ADD CONSTRAINT "clients_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "providers" ADD CONSTRAINT "providers_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_reviewer_id_users_id_fk" FOREIGN KEY ("reviewer_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_reviewee_id_users_id_fk" FOREIGN KEY ("reviewee_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_preferences" ADD CONSTRAINT "user_preferences_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "clients_user_id_uq" ON "clients" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "clients_created_at_idx" ON "clients" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "providers_user_id_uq" ON "providers" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "providers_status_idx" ON "providers" USING btree ("status");--> statement-breakpoint
CREATE INDEX "providers_is_available_idx" ON "providers" USING btree ("is_available");--> statement-breakpoint
CREATE INDEX "providers_avg_rating_idx" ON "providers" USING btree ("avg_rating");--> statement-breakpoint
CREATE INDEX "providers_created_at_idx" ON "providers" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "reviews_unique_per_job" ON "reviews" USING btree ("reviewer_id","reviewee_id","job_id");--> statement-breakpoint
CREATE INDEX "reviews_reviewer_idx" ON "reviews" USING btree ("reviewer_id");--> statement-breakpoint
CREATE INDEX "reviews_reviewee_idx" ON "reviews" USING btree ("reviewee_id");--> statement-breakpoint
CREATE INDEX "reviews_type_idx" ON "reviews" USING btree ("review_type");--> statement-breakpoint
CREATE INDEX "reviews_rating_idx" ON "reviews" USING btree ("rating");--> statement-breakpoint
CREATE INDEX "reviews_created_at_idx" ON "reviews" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "user_preferences_user_id_uq" ON "user_preferences" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "users_uid_idx" ON "users" USING btree ("uid");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_uq" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "users_tenant_idx" ON "users" USING btree ("tenant");--> statement-breakpoint
CREATE INDEX "users_role_idx" ON "users" USING btree ("role");--> statement-breakpoint
CREATE INDEX "users_last_login_idx" ON "users" USING btree ("last_login_at");--> statement-breakpoint
CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");