CREATE TYPE "public"."business_status" AS ENUM('active', 'inactive');--> statement-breakpoint
CREATE TYPE "public"."user_verification_status" AS ENUM('pending', 'verified', 'unverified');--> statement-breakpoint
ALTER TABLE "businesses" ADD COLUMN "status" "business_status" DEFAULT 'active';--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "verification_status" "user_verification_status" DEFAULT 'pending';