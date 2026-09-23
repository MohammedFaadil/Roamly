import Link from "next/link";
import { CalendarCheck, Heart, Star, Wallet, ArrowRight, Compass } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { BookingRow } from "@/components/booking/BookingRow";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { formatINR } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function DashboardOverviewPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const [active, upcoming, recent, favoritesCount, totalSpent] = await Promise.all([
    prisma.booking.findMany({
      where: { renterId: user.id, status: { in: ["ACTIVE", "RETURN_PENDING"] } },
      include: { vehicle: { include: { owner: true, images: { orderBy: { sortOrder: "asc" }, take: 1 } } } },
      orderBy: { startAt: "asc" },
    }),
    prisma.booking.findMany({
      where: { renterId: user.id, status: { in: ["REQUESTED", "OWNER_ACCEPTED", "CONFIRMED", "HANDOVER_PENDING"] } },
      include: { vehicle: { include: { owner: true, images: { orderBy: { sortOrder: "asc" }, take: 1 } } } },
      orderBy: { startAt: "asc" },
      take: 5,
    }),
    prisma.booking.findMany({
      where: { renterId: user.id, status: "COMPLETED" },
      include: { vehicle: { include: { owner: true, images: { orderBy: { sortOrder: "asc" }, take: 1 } } } },
      orderBy: { updatedAt: "desc" },
      take: 3,
    }),
    prisma.favorite.count({ where: { userId: user.id } }),
    prisma.booking.aggregate({
      where: { renterId: user.id, status: "COMPLETED" },
      _sum: { totalPayable: true },
      _count: true,
    }),
  ]);

  const allUpcoming = [...active, ...upcoming];

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold tracking-tight">Welcome back, {user.name.split(" ")[0]}</h1>
      <p className="mt-1 text-sm text-[var(--muted)]">Here&apos;s what&apos;s happening with your rentals.</p>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat icon={<CalendarCheck className="size-4" />} label="Trips completed" value={String(totalSpent._count)} />
        <Stat icon={<Wallet className="size-4" />} label="Total spent" value={formatINR(totalSpent._sum.totalPayable ?? 0)} />
        <Stat icon={<Heart className="size-4" />} label="Favorites" value={String(favoritesCount)} />
        <Stat icon={<Star className="size-4" />} label="Active rentals" value={String(active.length)} />
      </div>

      <div className="mt-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold">Upcoming &amp; active</h2>
          <Link href="/dashboard/bookings" className="text-sm font-medium text-[var(--muted)] hover:text-[var(--foreground)]">
            View all
          </Link>
        </div>
        {allUpcoming.length === 0 ? (
          <EmptyState
            icon={<Compass className="size-6" />}
            title="No upcoming rentals"
            description="Find a vehicle for your next trip."
            actionLabel="Explore vehicles"
            actionHref="/explore"
          />
        ) : (
          <div className="space-y-3">
            {allUpcoming.map((b) => (
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
            ))}
          </div>
        )}
      </div>

      {recent.length > 0 && (
        <div className="mt-8">
          <h2 className="text-base font-bold mb-3">Recent trips</h2>
          <div className="space-y-3">
            {recent.map((b) => (
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
            ))}
          </div>
        </div>
      )}

      <div className="mt-8 rounded-[var(--radius-lg)] border border-[var(--border)] bg-white p-5 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold">Have a vehicle sitting idle?</p>
          <p className="text-sm text-[var(--muted)]">List it on Roamly and start earning.</p>
        </div>
        <Button href="/list-vehicle" icon={<ArrowRight className="size-4" />}>
          List your vehicle
        </Button>
      </div>
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
