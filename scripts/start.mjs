// Cross-platform production start script.
// `next start` does not read process.env.PORT on its own — it needs an
// explicit `-p <port>`. Render (and most PaaS platforms) set PORT at runtime,
// so this resolves it in plain Node instead of relying on shell-specific
// `${PORT:-3000}` syntax, which cmd.exe (Windows) can't parse.
//
// On every startup we also run `prisma migrate deploy` (applies any pending
// migrations), `db:seed:if-empty` (seeds demo data only when the DB is
// empty), and `db:backfill-images` (adds real photos to any vehicle that
// doesn't have one yet — safe on data from an older deploy, see
// prisma/backfill-vehicle-images.ts for why this is needed separately from
// seeding). This replaces Render's `preDeployCommand` which requires a paid plan.
import { execSync } from "node:child_process";
import { spawn } from "node:child_process";

const port = process.env.PORT || "3000";

// Run migrations and seed (safe on every restart — seed is a no-op when data exists)
console.log("==> Running database migrations...");
try {
  execSync("npx prisma migrate deploy", { stdio: "inherit" });
  console.log("==> Migrations complete.");
} catch (err) {
  console.error("==> Migration failed:", err.message);
  process.exit(1);
}

console.log("==> Seeding database (if empty)...");
try {
  execSync("npx tsx prisma/seed-if-empty.ts", { stdio: "inherit" });
  console.log("==> Seed complete.");
} catch (err) {
  // Non-fatal — app can still run without demo data
  console.warn("==> Seed warning:", err.message);
}

console.log("==> Backfilling vehicle images (if any are missing)...");
try {
  execSync("npx tsx prisma/backfill-vehicle-images.ts", { stdio: "inherit" });
  console.log("==> Image backfill complete.");
} catch (err) {
  // Non-fatal — app can still run with some vehicles showing the placeholder
  console.warn("==> Image backfill warning:", err.message);
}

console.log("==> Starting Next.js server on port", port);
const child = spawn("npx", ["next", "start", "-p", port], {
  stdio: "inherit",
  shell: process.platform === "win32",
});

child.on("exit", (code) => process.exit(code ?? 0));
