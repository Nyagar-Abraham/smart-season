CREATE TYPE "public"."field_status" AS ENUM('Active', 'At Risk', 'Completed');--> statement-breakpoint
ALTER TABLE "fields" ADD COLUMN "status" "field_status" DEFAULT 'Active' NOT NULL;