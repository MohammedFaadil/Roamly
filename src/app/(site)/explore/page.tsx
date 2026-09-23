import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { VehicleFilters } from "@/components/vehicle/VehicleFilters";
import { ExploreResults } from "@/components/vehicle/ExploreResults";
import { CITIES } from "@/lib/constants";
import { distanceKm } from "@/lib/utils";

export const dynamic = "force-dynamic";

type SearchParams = Record<string, string | string[] | undefined>;

function first(v: string | string[] | undefined) {
  return Array.isArray(v) ? v[0] : v;
}

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const user = await getCurrentUser();

  const city = first(sp.city);
  const type = first(sp.type);
  const categories = first(sp.category)?.split(",").filter(Boolean) ?? [];
  const fuels = first(sp.fuel)?.split(",").filter(Boolean) ?? [];
  const transmission = first(sp.transmission);
  const features = first(sp.features)?.split(",").filter(Boolean) ?? [];
  const minPrice = first(sp.minPrice) ? Number(first(sp.minPrice)) : undefined;
  const maxPrice = first(sp.maxPrice) ? Number(first(sp.maxPrice)) : undefined;
  const sort = first(sp.sort) ?? "recommended";
  const q = first(sp.q);

  const where: Prisma.VehicleWhereInput = { status: "ACTIVE" };
  if (city) where.city = city;
  if (type) where.type = type as never;
  if (categories.length) where.category = { in: categories as never[] };
  if (fuels.length) where.fuelType = { in: fuels as never[] };
  if (transmission) where.transmission = transmission as never;
  if (minPrice !== undefined || maxPrice !== undefined) {
    where.pricePerDay = {
      ...(minPrice !== undefined ? { gte: minPrice } : {}),
      ...(maxPrice !== undefined ? { lte: maxPrice } : {}),
    };
  }
  if (q) {
    where.OR = [
      { brand: { contains: q, mode: "insensitive" } },
      { model: { contains: q, mode: "insensitive" } },
      { city: { contains: q, mode: "insensitive" } },
    ];
  }
  if (features.length) {
    where.AND = features.map((f) => ({ features: { contains: f } }));
  }

  const orderBy: Prisma.VehicleOrderByWithRelationInput[] =
    sort === "price_low"
      ? [{ pricePerDay: "asc" }]
      : sort === "price_high"
      ? [{ pricePerDay: "desc" }]
      : sort === "rating"
      ? [{ ratingAvg: "desc" }]
      : sort === "newest"
      ? [{ createdAt: "desc" }]
      : [{ ratingAvg: "desc" }, { totalRentals: "desc" }];

  const [vehicles, total, favoriteRows, priceStatsAll] = await Promise.all([
    prisma.vehicle.findMany({
      where,
      orderBy,
      take: 60,
      include: { images: { orderBy: { sortOrder: "asc" }, take: 1 } },
    }),
    prisma.vehicle.count({ where }),
    user
      ? prisma.favorite.findMany({ where: { userId: user.id }, select: { vehicleId: true } })
      : Promise.resolve([]),
    // Deliberately scoped to city only, NOT type/category/etc — this defines
    // the slider's scale (track range + histogram buckets). If it were also
    // scoped to the current type filter, toggling Cars/Bikes would rescale
    // the whole slider out from under the user (cars and bikes sit in very
    // different price bands), making the track visibly jump around. Keeping
    // it city-only means the track stays put; only which bars are
    // highlighted changes as other filters narrow the results.
    prisma.vehicle.findMany({
      where: { status: "ACTIVE", ...(city ? { city } : {}) },
      select: { pricePerDay: true },
    }),
  ]);

  const prices = priceStatsAll.map((v) => v.pricePerDay);
  const priceBounds = {
    min: prices.length ? Math.floor(Math.min(...prices) / 10) * 10 : 0,
    max: prices.length ? Math.ceil(Math.max(...prices) / 10) * 10 : 5000,
  };
  const BUCKETS = 24;
  const histogram = new Array(BUCKETS).fill(0);
  const range = priceBounds.max - priceBounds.min || 1;
  for (const p of prices) {
    const idx = Math.min(BUCKETS - 1, Math.floor(((p - priceBounds.min) / range) * BUCKETS));
    histogram[idx]++;
  }

  const cityMeta = CITIES.find((c) => c.name === city);

  const vehicleCards = vehicles.map((v) => ({
    id: v.id,
    type: v.type,
    category: v.category,
    brand: v.brand,
    model: v.model,
    year: v.year,
    transmission: v.transmission,
    fuelType: v.fuelType,
    seats: v.seats,
    pricePerDay: v.pricePerDay,
    pricePerHour: v.pricePerHour,
    ratingAvg: v.ratingAvg,
    ratingCount: v.ratingCount,
    verified: v.verified,
    city: v.city,
    area: v.area,
    lat: v.lat,
    lng: v.lng,
    distanceKm: cityMeta ? distanceKm(cityMeta.lat, cityMeta.lng, v.lat, v.lng) : undefined,
    imageUrl: v.images[0]?.url ?? null,
  }));

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">
          {city ? `Vehicles in ${city}` : "Explore all vehicles"}
        </h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          {city ? `Showing available vehicles near ${city}` : "Browse verified cars and bikes across India"}
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
        <VehicleFilters priceHistogram={histogram} priceBounds={priceBounds} />
        <ExploreResults
          vehicles={vehicleCards}
          favoriteIds={favoriteRows.map((f) => f.vehicleId)}
          isAuthenticated={!!user}
          total={total}
        />
      </div>
    </div>
  );
}
