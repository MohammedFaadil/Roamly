import { PrismaClient } from "@prisma/client";
import { VEHICLE_IMAGES } from "./vehicle-images";

const prisma = new PrismaClient();

/**
 * Non-destructive: adds a real photo to any EXISTING vehicle that doesn't
 * already have one, matching on brand+model against VEHICLE_IMAGES. Touches
 * nothing else — no users, bookings, or other vehicle fields are modified —
 * so it's safe to run against a database that already has real data.
 *
 * This exists because `prisma/seed-if-empty.ts` only runs the full seed once
 * (when the database is empty). If a deploy happened before VEHICLE_IMAGES
 * existed, the database is no longer empty on later deploys, so the full
 * seed never re-runs and those vehicles stay imageless forever even after
 * the code is updated — this backfill is what actually fixes that.
 *
 * Runs automatically on every boot (see scripts/start.mjs) — cheap and a
 * no-op once every matching vehicle already has a photo. Can also be run by
 * hand: `npm run db:backfill-images`.
 */
async function main() {
  const vehicles = await prisma.vehicle.findMany({
    where: { images: { none: {} } },
    select: { id: true, brand: true, model: true },
  });

  if (vehicles.length === 0) {
    console.log("No imageless vehicles found — nothing to backfill.");
    return;
  }

  let updated = 0;
  for (const v of vehicles) {
    const url = VEHICLE_IMAGES[`${v.brand}|${v.model}`];
    if (!url) continue;
    await prisma.vehicleImage.create({
      data: { vehicleId: v.id, url, label: "Exterior", sortOrder: 0 },
    });
    updated++;
  }

  console.log(
    `Backfilled photos for ${updated}/${vehicles.length} imageless vehicle(s)` +
      (vehicles.length > updated
        ? ` (${vehicles.length - updated} had no matching entry in VEHICLE_IMAGES — likely custom/owner-listed vehicles or the Ather 450X, which has none by design).`
        : ".")
  );
}

main()
  .catch((err) => {
    console.error("backfill-vehicle-images failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
