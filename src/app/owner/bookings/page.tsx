import Link from "next/link";
import { Inbox } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { BookingRow } from "@/components/booking/BookingRow";
import { EmptyState } from "@/components/ui/EmptyState";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const FILTERS = [
  { key: "all", label: "All", statuses: [] as string[] },
  { key: "requests", label: "New requests", statuses: ["REQUESTED"] },
  { key: "upcoming", label: "Upcoming", statuses: ["OWNER_ACCEPTED", "CONFIRMED", "HANDOVER_PENDING"] },
  { key: "active", label: "Active", statuses: ["ACTIVE", "RETURN_PENDING"] },
  { key: "completed", label: "Completed", statuses: ["COMPLETED"] },
  { key: "issues", label: "Disputed", statuses: ["DISPUTED"] },
];

export default async function OwnerBookingsPage({
  searchParams,
}: PageProps<"/owner/bookings">) {
  const sp = await searchParams;
  const user = await getCurrentUser();
  if (!user) return null;

  const filterKey = typeof sp.filter === "string" ? sp.filter : "all";
  const filter = FILTERS.find((f) => f.key === filterKey) ?? FILTERS[0];

  const vehicleIds = (await prisma.vehicle.findMany({ where: { ownerId: user.id }, select: { id: true } })).map(
    (v) => v.id
  );

  const bookings = await prisma.booking.findMany({
    where: {
      vehicleId: { in: vehicleIds },
      ...(filter.statuses.length ? { status: { in: filter.statuses as never[] } } : {}),
    },
    include: {
      vehicle: { include: { images: { orderBy: { sortOrder: "asc" }, take: 1 } } },
      renter: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold tracking-tight">Booking Requests</h1>
      <p className="mt-1 text-sm text-[var(--muted)]">Manage requests and track rentals across all your vehicles.</p>

      <div className="mt-5 flex gap-1.5 overflow-x-auto rounded-[var(--radius-sm)] bg-gray-100 p-1 w-fit">
        {FILTERS.map((f) => (
          <Link
            key={f.key}
            href={f.key === "all" ? "/owner/bookings" : `/owner/bookings?filter=${f.key}`}
            className={cn(
              "rounded-[6px] px-3.5 py-1.5 text-sm font-medium whitespace-nowrap transition-colors",
              filter.key === f.key ? "bg-white shadow-sm" : "text-[var(--muted)] hover:text-[var(--foreground)]"
            )}
          >
            {f.label}
          </Link>
        ))}
      </div>

      <div className="mt-5 space-y-3">
        {bookings.length === 0 ? (
          <EmptyState
            icon={<Inbox className="size-6" />}
            title="No bookings here"
            description="Requests from renters will show up here as soon as they come in."
          />
        ) : (
          bookings.map((b) => (
            <BookingRow
              key={b.id}
              booking={{
                id: b.id,
                status: b.status,
                startAt: b.startAt,
                endAt: b.endAt,
                totalPayable: b.totalPayable,
                vehicle: { ...b.vehicle, imageUrl: b.vehicle.images[0]?.url ?? null },
                counterpartyName: b.renter.name,
                counterpartyRole: "Renter",
              }}
            />
          ))
        )}
      </div>
    </div>
  );
}
