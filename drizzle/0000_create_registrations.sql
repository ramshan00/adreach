CREATE TABLE "registrations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_slug" varchar(80) NOT NULL,
	"full_name" varchar(80) NOT NULL,
	"mobile" varchar(13) NOT NULL,
	"email" varchar(150) NOT NULL,
	"designation" varchar(80),
	"consent" boolean NOT NULL,
	"utm_source" varchar(200),
	"utm_medium" varchar(200),
	"utm_campaign" varchar(200),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "registrations_event_email_unique" UNIQUE("event_slug","email")
);
CREATE INDEX "registrations_created_at_idx" ON "registrations" USING btree ("created_at");
CREATE INDEX "registrations_event_slug_idx" ON "registrations" USING btree ("event_slug");
CREATE INDEX "registrations_mobile_idx" ON "registrations" USING btree ("mobile");
