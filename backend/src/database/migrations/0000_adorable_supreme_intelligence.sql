CREATE TYPE "public"."field_stages" AS ENUM('Planted', 'Growing', 'Ready', 'Harvested');--> statement-breakpoint
CREATE TYPE "public"."roles" AS ENUM('admin', 'field_agent');--> statement-breakpoint
CREATE TABLE "field_updates" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "field_updates_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"fieldId" integer NOT NULL,
	"agentId" integer NOT NULL,
	"stageUpdate" "field_stages",
	"notes" text,
	"updatedAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fields" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "fields_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar NOT NULL,
	"cropType" varchar NOT NULL,
	"plantingDate" timestamp NOT NULL,
	"currentStage" "field_stages" DEFAULT 'Planted' NOT NULL,
	"assignedAgentId" integer,
	"updatedAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "users_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"email" varchar NOT NULL,
	"passwordHash" varchar NOT NULL,
	"fullName" varchar,
	"role" "roles" DEFAULT 'field_agent' NOT NULL,
	"isActive" boolean DEFAULT true NOT NULL,
	"updatedAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "field_updates" ADD CONSTRAINT "field_updates_fieldId_fields_id_fk" FOREIGN KEY ("fieldId") REFERENCES "public"."fields"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "field_updates" ADD CONSTRAINT "field_updates_agentId_users_id_fk" FOREIGN KEY ("agentId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fields" ADD CONSTRAINT "fields_assignedAgentId_users_id_fk" FOREIGN KEY ("assignedAgentId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_field_updates_field" ON "field_updates" USING btree ("fieldId");--> statement-breakpoint
CREATE INDEX "idx_field_updates_agent" ON "field_updates" USING btree ("agentId");--> statement-breakpoint
CREATE INDEX "idx_fields_assigned_agent" ON "fields" USING btree ("assignedAgentId");--> statement-breakpoint
CREATE INDEX "idx_users_email" ON "users" USING btree ("email");