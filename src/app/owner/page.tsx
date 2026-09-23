import Link from "next/link";
import { Wallet, CalendarClock, CheckCircle2, Star, Inbox, Plus, Car } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { BookingRow } from "@/components/booking/BookingRow";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { formatINR } from "@/lib/format";
import { OWNER_COMMISSION_RATE } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function OwnerOverviewPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const vehicles = await prisma.vehicle.findMany({ where: { ownerId: user.id } });
  const vehicleIds = vehicles.map((v) => v.id);

  const [pendingRequests, activeBookings, completedCount, earnings, avgRating] = await Promise.all([
    prisma.booking.findMany({
      where: { vehicleId: { in: vehicleIds }, status: "REQUESTED" },
      include: {
        vehicle: { include: { images: { orderBy: { sortOrder: "asc" }, take: 1 } } },
        renter: true,
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.booking.findMany({
      where: { vehicleId: { in: vehicleIds }, status: { in: ["ACTIVE", "HANDOVER_PENDING", "RETURN_PENDING"] } },
      include: {
        vehicle: { include: { images: { orderBy: { sortOrder: "asc" }, take: 1 } } },
        renter: true,
      },
      orderBy: { startAt: "asc" },
      take: 5,
    }),
    prisma.booking.count({ where: { vehicleId: { in: vehicleIds }, status: "COMPLETED" } }),
    prisma.payment.aggregate({
      where: {
        booking: { vehicleId: { in: vehicleIds } },
        type: { in: ["RENTAL", "EXTRA_CHARGE"] },
        status: "SUCCESS",
      },
      _sum: { amount: true },
    }),
    vehicles.length
      ? prisma.vehicle.aggregate({ where: { ownerId: user.id }, _avg: { ratingAvg: true } })
      : Promise.resolve({ _avg: { ratingAvg: 0 } }),
  ]);

  const grossEarnings = earnings._sum.amount ?? 0;
  const netEarnings = Math.round(grossEarnings * (1 - OWNER_COMMISSION_RATE));

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-2xl font-bold tracking-tight">Welcome back, {user.name.split(" ")[0]}</h1>
        <Button href="/owner/vehicles/new" icon={<Plus className="size-4" />} size="sm">
          List a vehicle
        </Button>
      </div>
      <p className="mt-1 text-sm text-[var(--muted)]">Here&apos;s how your vehicles are performing.</p>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat icon={<Wallet className="size-4" />} label="Net earnings" value={formatINR(netEarnings)} />
        <Stat icon={<CalendarClock className="size-4" />} label="Active rentals" value={String(activeBookings.length)} />
        <Stat icon={<CheckCircle2 className="size-4" />} label="Completed rentals" value={String(completedCount)} />
        <Stat icon={<Star className="size-4" />} label="Avg. rating" value={(avgRating._avg.ratingAvg ?? 0).toFixed(1)} />
      </div>

      {vehicles.length === 0 && (
        <div className="mt-8">
          <EmptyState
            icon={<Car className="size-6" />}
            title="You haven't listed a vehicle yet"
            description="List your car or bike and start earning when it's not in use."
            actionLabel="List your first vehicle"
            actionHref="/owner/vehicles/new"
          />
        </div>
      )}

      {pendingRequests.length > 0 && (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="flex items-center gap-1.5 text-base font-bold">
              <Inbox className="size-4" /> Pending requests
            </h2>
            <Link href="/owner/bookings" className="text-sm font-medium text-[var(--muted)] hover:text-[var(--foreground)]">
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {pendingRequests.map((b) => (
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
            ))}
          </div>
        </div>
      )}

      {activeBookings.length > 0 && (
        <div className="mt-8">
          <h2 className="text-base font-bold mb-3">Active &amp; upcoming</h2>
          <div className="space-y-3">
            {activeBookings.map((b) => (
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
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-white p-4">
      <div className="flex size-8 items-center justify-center rounded-full bg-gray-100 text-[var(--muted)]">{icon}</div>
      <p className="mt-2.5 text-lg font-bold">{value}</p>
      <p className="text-xs text-[var(--muted)]">{label}</p>
    </div>
  );
}
