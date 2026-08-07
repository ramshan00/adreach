import { spawnSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const apiDir = join(root, "src", "app", "api");
const parkedDir = join(root, ".hostinger-build-park", "api");

function parkApi() {
  if (!existsSync(apiDir)) return false;
  mkdirSync(dirname(parkedDir), { recursive: true });
  rmSync(parkedDir, { recursive: true, force: true });
  cpSync(apiDir, parkedDir, { recursive: true });
  rmSync(apiDir, { recursive: true, force: true });
  return true;
}

function restoreApi() {
  if (!existsSync(parkedDir)) return;
  rmSync(apiDir, { recursive: true, force: true });
  mkdirSync(dirname(apiDir), { recursive: true });
  cpSync(parkedDir, apiDir, { recursive: true });
  rmSync(join(root, ".hostinger-build-park"), { recursive: true, force: true });
}

if (!process.env.NEXT_PUBLIC_API_URL?.trim()) {
  console.error(
    "build:hostinger requires NEXT_PUBLIC_API_URL (Vercel API origin, e.g. https://adreach-psi.vercel.app)",
  );
  process.exit(1);
}

process.env.NEXT_STATIC = "true";

let parked = false;
let exitCode = 0;

try {
  parked = parkApi();

  // Drop cached route types that still reference /api while it is parked.
  rmSync(join(root, ".next"), { recursive: true, force: true });

  const result = spawnSync("npx", ["next", "build"], {
    cwd: root,
    stdio: "inherit",
    env: process.env,
    shell: true,
  });

  exitCode = result.status ?? 1;
  if (exitCode === 0) {
    console.log("Hostinger static export ready in out/. Upload contents into Hostinger /seminar/.");
  }
} catch (error) {
  console.error(error);
  exitCode = 1;
} finally {
  if (parked) restoreApi();
}

process.exit(exitCode);
