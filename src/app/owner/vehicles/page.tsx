import Link from "next/link";
import { Plus, Car, Star, MapPin } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { VehicleThumb } from "@/components/vehicle/VehicleThumb";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatINR } from "@/lib/format";
import { categoryLabel } from "@/lib/constants";

export const dynamic = "force-dynamic";

const STATUS_TONE: Record<string, "success" | "warning" | "danger" | "neutral"> = {
  ACTIVE: "success",
  DRAFT: "neutral",
  PENDING_VERIFICATION: "warning",
  SUSPENDED: "danger",
  REJECTED: "danger",
};

export default async function MyVehiclesPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const vehicles = await prisma.vehicle.findMany({
    where: { ownerId: user.id },
    orderBy: { createdAt: "desc" },
    include: { images: { orderBy: { sortOrder: "asc" }, take: 1 } },
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">My Vehicles</h1>
        <Button href="/owner/vehicles/new" icon={<Plus className="size-4" />} size="sm">
          List a vehicle
        </Button>
      </div>
      <p className="mt-1 text-sm text-[var(--muted)]">Manage pricing, availability, and status for your listings.</p>

      {vehicles.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            icon={<Car className="size-6" />}
            title="No vehicles listed yet"
            description="Add your first car or bike to start receiving booking requests."
            actionLabel="List a vehicle"
            actionHref="/owner/vehicles/new"
          />
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {vehicles.map((v) => (
            <Link
              key={v.id}
              href={`/owner/vehicles/${v.id}`}
              className="block overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-white hover:shadow-md transition-shadow"
            >
              <div className="relative h-36">
                <VehicleThumb type={v.type as "CAR" | "BIKE"} brand={v.brand} model={v.model} seed={v.id} imageUrl={v.images[0]?.url} className="h-full w-full" />
                <div className="absolute left-2.5 top-2.5">
                  <Badge tone={STATUS_TONE[v.status] ?? "neutral"}>{v.status.replace("_", " ")}</Badge>
                </div>
              </div>
              <div className="p-4">
                <p className="text-sm font-semibold">{v.year} {v.brand} {v.model}</p>
                <p className="mt-0.5 flex items-center gap-1 text-xs text-[var(--muted)]">
                  <MapPin className="size-3" /> {categoryLabel(v.category)} · {v.city}
                </p>
                <div className="mt-3 flex items-center justify-between border-t border-[var(--border)] pt-3">
                  <span className="text-sm font-bold">{formatINR(v.pricePerDay)}<span className="text-xs font-normal text-[var(--muted)]">/day</span></span>
                  <span className="flex items-center gap-1 text-xs text-[var(--muted)]">
                    <Star className="size-3 fill-[var(--star)] text-[var(--star)]" /> {v.ratingAvg.toFixed(1)} ({v.totalRentals} rentals)
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
