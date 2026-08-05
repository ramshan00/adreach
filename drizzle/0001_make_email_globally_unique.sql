ALTER TABLE "registrations"
  DROP CONSTRAINT IF EXISTS "registrations_event_email_unique";

ALTER TABLE "registrations"
  ADD CONSTRAINT "registrations_email_unique" UNIQUE ("email");
