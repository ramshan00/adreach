import { boolean, index, pgTable, timestamp, unique, uuid, varchar } from "drizzle-orm/pg-core";

export const registrations = pgTable("registrations", {
  id: uuid("id").defaultRandom().primaryKey(),
  eventSlug: varchar("event_slug", { length: 80 }).notNull(),
  fullName: varchar("full_name", { length: 80 }).notNull(),
  mobile: varchar("mobile", { length: 13 }).notNull(),
  email: varchar("email", { length: 150 }).notNull(),
  designation: varchar("designation", { length: 80 }),
  consent: boolean("consent").notNull(),
  utmSource: varchar("utm_source", { length: 200 }),
  utmMedium: varchar("utm_medium", { length: 200 }),
  utmCampaign: varchar("utm_campaign", { length: 200 }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  unique("registrations_email_unique").on(table.email),
  index("registrations_created_at_idx").on(table.createdAt),
  index("registrations_event_slug_idx").on(table.eventSlug),
  index("registrations_mobile_idx").on(table.mobile),
]);
