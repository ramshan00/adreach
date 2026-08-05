import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { migrate } from "drizzle-orm/neon-http/migrator";
import { getDatabaseUrl } from "../lib/env";

async function main() {
  const url = getDatabaseUrl();
  console.log("Connecting to Neon Database via HTTP...");
  const sql = neon(url);
  const db = drizzle(sql);
  await migrate(db, { migrationsFolder: "./drizzle" });
  console.log("✅ Migrations applied successfully!");
}

main().catch((err) => {
  console.error("❌ Migration failed:", err);
  process.exit(1);
});
