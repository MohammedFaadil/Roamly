import Link from "next/link";
import { CalendarDays, CalendarOff } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { VehicleThumb } from "@/components/vehicle/VehicleThumb";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatDate } from "@/lib/format";
import { BOOKING_STATUS_LABEL, BOOKING_STATUS_TONE } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function OwnerCalendarPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const vehicles = await prisma.vehicle.findMany({
    where: { ownerId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      bookings: {
        where: { status: { in: ["REQUESTED", "OWNER_ACCEPTED", "CONFIRMED", "HANDOVER_PENDING", "ACTIVE", "RETURN_PENDING"] } },
        include: { renter: true },
        orderBy: { startAt: "asc" },
      },
      availabilityBlocks: {
        where: { endAt: { gte: new Date() } },
        orderBy: { startAt: "asc" },
      },
      images: { orderBy: { sortOrder: "asc" }, take: 1 },
    },
  });

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold tracking-tight">Availability</h1>
      <p className="mt-1 text-sm text-[var(--muted)]">Upcoming bookings and blocked dates across all your vehicles.</p>

      {vehicles.length === 0 ? (
        <div className="mt-8">
          <EmptyState icon={<CalendarDays className="size-6" />} title="No vehicles listed" description="List a vehicle to start managing its availability." actionLabel="List a vehicle" actionHref="/owner/vehicles/new" />
        </div>
      ) : (
        <div className="mt-6 space-y-5">
          {vehicles.map((v) => (
            <div key={v.id} className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-white p-5">
              <div className="flex items-center gap-3 mb-4">
                <VehicleThumb type={v.type as "CAR" | "BIKE"} brand={v.brand} model={v.model} seed={v.id} imageUrl={v.images[0]?.url} className="h-12 w-16 rounded-[var(--radius-sm)] shrink-0" iconClassName="size-5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold">{v.year} {v.brand} {v.model}</p>
                  <p className="text-xs text-[var(--muted)]">{v.city}</p>
                </div>
                <Link href={`/owner/vehicles/${v.id}`} className="text-xs font-medium text-[var(--accent)] hover:underline">
                  Manage
                </Link>
              </div>

              {v.bookings.length === 0 && v.availabilityBlocks.length === 0 ? (
                <p className="text-sm text-[var(--muted-2)]">Fully available — no upcoming bookings or blocked dates.</p>
              ) : (
                <div className="space-y-2">
                  {v.bookings.map((b) => (
                    <Link
                      key={b.id}
                      href={`/booking/${b.id}`}
                      className="flex items-center justify-between rounded-[var(--radius-sm)] border border-[var(--border)] px-3.5 py-2.5 text-sm hover:bg-gray-50"
                    >
                      <span>{formatDate(b.startAt)} → {formatDate(b.endAt)} · {b.renter.name}</span>
                      <Badge tone={BOOKING_STATUS_TONE[b.status] ?? "neutral"}>{BOOKING_STATUS_LABEL[b.status] ?? b.status}</Badge>
                    </Link>
                  ))}
                  {v.availabilityBlocks.map((blk) => (
                    <div key={blk.id} className="flex items-center gap-2 rounded-[var(--radius-sm)] bg-gray-50 px-3.5 py-2.5 text-sm text-[var(--muted)]">
                      <CalendarOff className="size-3.5" /> {formatDate(blk.startAt)} → {formatDate(blk.endAt)} · {blk.reason}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
