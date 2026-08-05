import "server-only";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { getDatabaseUrl } from "@/lib/env";

export function getDb() {
  return drizzle(neon(getDatabaseUrl()));
}
