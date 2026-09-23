import { HeartOff } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { VehicleCard } from "@/components/vehicle/VehicleCard";
import { EmptyState } from "@/components/ui/EmptyState";

export const dynamic = "force-dynamic";

export default async function FavoritesPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const favorites = await prisma.favorite.findMany({
    where: { userId: user.id },
    include: { vehicle: { include: { images: { orderBy: { sortOrder: "asc" }, take: 1 } } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Favorites</h1>
      <p className="mt-1 text-sm text-[var(--muted)]">Vehicles you&apos;ve saved for later.</p>

      {favorites.length === 0 ? (
        <EmptyState
          icon={<HeartOff className="size-6" />}
          title="No favorites yet"
          description="Tap the heart icon on any vehicle to save it here."
          actionLabel="Explore vehicles"
          actionHref="/explore"
        />
      ) : (
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {favorites.map((f) => (
            <VehicleCard
              key={f.id}
              vehicle={{ ...f.vehicle, imageUrl: f.vehicle.images[0]?.url ?? null }}
              favorited
              isAuthenticated
            />
          ))}
        </div>
      )}
    </div>
  );
}
