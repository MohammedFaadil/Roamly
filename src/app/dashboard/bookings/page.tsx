import Link from "next/link";
import { CalendarX } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { BookingRow } from "@/components/booking/BookingRow";
import { EmptyState } from "@/components/ui/EmptyState";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const FILTERS = [
  { key: "all", label: "All", statuses: [] as string[] },
  { key: "upcoming", label: "Upcoming", statuses: ["REQUESTED", "OWNER_ACCEPTED", "CONFIRMED", "HANDOVER_PENDING"] },
  { key: "active", label: "Active", statuses: ["ACTIVE", "RETURN_PENDING"] },
  { key: "completed", label: "Completed", statuses: ["COMPLETED"] },
  { key: "cancelled", label: "Cancelled", statuses: ["CANCELLED_BY_RENTER", "CANCELLED_BY_OWNER", "OWNER_REJECTED"] },
];

export default async function MyBookingsPage({
  searchParams,
}: PageProps<"/dashboard/bookings">) {
  const sp = await searchParams;
  const user = await getCurrentUser();
  if (!user) return null;

  const filterKey = typeof sp.filter === "string" ? sp.filter : "all";
  const filter = FILTERS.find((f) => f.key === filterKey) ?? FILTERS[0];

  const bookings = await prisma.booking.findMany({
    where: { renterId: user.id, ...(filter.statuses.length ? { status: { in: filter.statuses as never[] } } : {}) },
    include: {
      vehicle: { include: { owner: true, images: { orderBy: { sortOrder: "asc" }, take: 1 } } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold tracking-tight">My Bookings</h1>
      <p className="mt-1 text-sm text-[var(--muted)]">All your rental requests and trips in one place.</p>

      <div className="mt-5 flex gap-1.5 overflow-x-auto rounded-[var(--radius-sm)] bg-gray-100 p-1 w-fit">
        {FILTERS.map((f) => (
          <Link
            key={f.key}
            href={f.key === "all" ? "/dashboard/bookings" : `/dashboard/bookings?filter=${f.key}`}
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
            icon={<CalendarX className="size-6" />}
            title="No bookings here"
            description="Try a different filter, or explore vehicles to book your next trip."
            actionLabel="Explore vehicles"
            actionHref="/explore"
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
                counterpartyName: b.vehicle.owner.name,
                counterpartyRole: "Owner",
              }}
            />
          ))
        )}
      </div>
    </div>
  );
}
