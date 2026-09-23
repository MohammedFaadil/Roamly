import { notFound } from "next/navigation";
import Link from "next/link";
import {
  BadgeCheck,
  MapPin,
  Gauge,
  Fuel,
  Users,
  Calendar,
  Wrench,
  Route as RouteIcon,
  Droplets,
  Clock3,
  Ban,
  CheckCircle2,
  Snowflake,
  Bluetooth,
  Navigation,
  Usb,
  Smartphone,
  Camera,
  Sun,
  Baby,
  Luggage,
  Music,
  Gauge as CruiseIcon,
  HardHat,
  PocketKnife,
  MonitorSmartphone,
  ShieldAlert,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { VehicleGallery } from "@/components/vehicle/VehicleGallery";
import { BookingWidget } from "@/components/vehicle/BookingWidget";
import { OwnerCard } from "@/components/vehicle/OwnerCard";
import { VehicleCard } from "@/components/vehicle/VehicleCard";
import { FavoriteButton } from "@/components/vehicle/FavoriteButton";
import { RatingStars } from "@/components/ui/RatingStars";
import { Badge } from "@/components/ui/Badge";
import { Tabs } from "@/components/ui/Tabs";
import { Avatar } from "@/components/ui/Avatar";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatINR, formatDate, timeAgo } from "@/lib/format";
import { categoryLabel } from "@/lib/constants";
import { fuelPriceEstimate } from "@/lib/pricing";
import { accentFor, type Accent } from "@/lib/accents";

export const dynamic = "force-dynamic";

const FEATURE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  "Air Conditioning": Snowflake,
  "Bluetooth": Bluetooth,
  "GPS Navigation": Navigation,
  "USB Charging": Usb,
  "Android Auto": Smartphone,
  "Apple CarPlay": Smartphone,
  "Reverse Camera": Camera,
  "Sunroof": Sun,
  "Child Seat": Baby,
  "Luggage Space": Luggage,
  "Music System": Music,
  "Cruise Control": CruiseIcon,
  "Helmet Included": HardHat,
  "Under-seat Storage": PocketKnife,
  "Digital Console": MonitorSmartphone,
  "Anti-lock Braking": ShieldAlert,
  "Bluetooth Connectivity": Bluetooth,
  "Mobile Holder": Smartphone,
  "Saree Guard": ShieldAlert,
};

export default async function VehicleDetailPage({
  params,
}: PageProps<"/vehicles/[id]">) {
  const { id } = await params;
  const user = await getCurrentUser();

  const vehicle = await prisma.vehicle.findUnique({
    where: { id },
    include: {
      owner: true,
      images: { orderBy: { sortOrder: "asc" } },
      reviews: {
        where: { type: "RENTER_TO_OWNER" },
        include: { author: true },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  });

  if (!vehicle || vehicle.status !== "ACTIVE") notFound();

  const [favorite, similar] = await Promise.all([
    user
      ? prisma.favorite.findUnique({ where: { userId_vehicleId: { userId: user.id, vehicleId: vehicle.id } } })
      : Promise.resolve(null),
    prisma.vehicle.findMany({
      where: { city: vehicle.city, type: vehicle.type, status: "ACTIVE", id: { not: vehicle.id } },
      orderBy: { ratingAvg: "desc" },
      take: 4,
      include: { images: { orderBy: { sortOrder: "asc" }, take: 1 } },
    }),
  ]);

  const features: string[] = JSON.parse(vehicle.features || "[]");
  const isOwner = user?.id === vehicle.ownerId;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-1 flex items-center gap-2 text-sm text-[var(--muted)]">
        <Link href="/explore" className="hover:text-[var(--foreground)]">Explore</Link>
        <span>/</span>
        <Link href={`/explore?city=${vehicle.city}`} className="hover:text-[var(--foreground)]">{vehicle.city}</Link>
      </div>

      <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">
              {vehicle.year} {vehicle.brand} {vehicle.model}
            </h1>
            {vehicle.verified && (
              <Badge tone="success" icon={<BadgeCheck className="size-3" />}>Verified</Badge>
            )}
          </div>
          <div className="mt-1.5 flex flex-wrap items-center gap-3 text-sm text-[var(--muted)]">
            <RatingStars value={vehicle.ratingAvg} count={vehicle.ratingCount} />
            <span className="flex items-center gap-1">
              <MapPin className="size-3.5" /> {vehicle.area ? `${vehicle.area}, ` : ""}{vehicle.city}
            </span>
            <span>{categoryLabel(vehicle.category)}</span>
          </div>
        </div>
        <FavoriteButton
          vehicleId={vehicle.id}
          initialFavorited={!!favorite}
          isAuthenticated={!!user}
          size="lg"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8">
        <div className="min-w-0">
          <VehicleGallery
            type={vehicle.type as "CAR" | "BIKE"}
            brand={vehicle.brand}
            model={vehicle.model}
            seed={vehicle.id}
            images={vehicle.images.map((i) => ({ url: i.url, label: i.label }))}
          />

          <div className="mt-8">
            <Tabs
              tabs={[
                {
                  label: "Overview",
                  content: (
                    <div className="space-y-8">
                      <div>
                        <h3 className="text-sm font-semibold mb-3">About this vehicle</h3>
                        <p className="text-sm leading-relaxed text-[var(--muted)]">{vehicle.description}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold mb-3">Basic information</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                          <Spec icon={<Gauge className="size-4" />} accent={accentFor(0)} label="Transmission" value={vehicle.transmission === "AUTOMATIC" ? "Automatic" : "Manual"} />
                          <Spec icon={<Fuel className="size-4" />} accent={accentFor(1)} label="Fuel type" value={vehicle.fuelType.charAt(0) + vehicle.fuelType.slice(1).toLowerCase()} />
                          {vehicle.seats && <Spec icon={<Users className="size-4" />} accent={accentFor(2)} label="Seats" value={String(vehicle.seats)} />}
                          <Spec icon={<Calendar className="size-4" />} accent={accentFor(3)} label="Year" value={String(vehicle.year)} />
                          <Spec icon={<RouteIcon className="size-4" />} accent={accentFor(4)} label="Odometer" value={`${vehicle.odometerKm.toLocaleString("en-IN")} km`} />
                          {vehicle.engineCapacityCc ? (
                            <Spec icon={<Wrench className="size-4" />} accent={accentFor(5)} label="Engine" value={`${vehicle.engineCapacityCc} cc`} />
                          ) : null}
                        </div>
                      </div>
                      {features.length > 0 && (
                        <div>
                          <h3 className="text-sm font-semibold mb-3">Features</h3>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {features.map((f) => {
                              const Icon = FEATURE_ICONS[f] ?? CheckCircle2;
                              return (
                                <div key={f} className="flex items-center gap-2 rounded-[var(--radius-sm)] border border-[var(--border)] px-3 py-2.5 text-sm">
                                  <Icon className="size-4 text-[var(--muted)]" />
                                  {f}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                      <div className="rounded-[var(--radius-md)] bg-blue-50 p-4 text-sm text-blue-900">
                        <p className="font-medium">Fuel price estimate for {vehicle.city}</p>
                        <p className="mt-1 text-blue-800/80">
                          {vehicle.fuelType === "ELECTRIC" ? "Approx. charging cost" : `${vehicle.fuelType.charAt(0) + vehicle.fuelType.slice(1).toLowerCase()} price`}: ₹{fuelPriceEstimate(vehicle.fuelType).toFixed(2)}
                          {vehicle.fuelType === "ELECTRIC" ? "/unit" : "/litre"} — a demo estimate used only for pricing guidance, not billed separately.
                        </p>
                      </div>
                    </div>
                  ),
                },
                {
                  label: "Rental rules",
                  content: (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Rule icon={<RouteIcon className="size-4" />} accent={accentFor(0)} title="Included distance" desc={`${vehicle.includedKmPerDay} km/day included. Extra usage billed at ${formatINR(vehicle.extraKmCharge)}/km.`} />
                      <Rule icon={<Droplets className="size-4" />} accent={accentFor(1)} title="Fuel policy" desc={vehicle.fuelPolicy} />
                      <Rule icon={<Clock3 className="size-4" />} accent={accentFor(2)} title="Rental duration" desc={`Minimum ${vehicle.minRentalHours} hours, maximum ${vehicle.maxRentalDays} days.`} />
                      <Rule icon={<Clock3 className="size-4" />} accent={accentFor(3)} title="Late return" desc={`${formatINR(vehicle.lateFeePerHour)}/hour after a 30-minute grace period.`} />
                      <Rule icon={<Ban className="size-4" />} accent={accentFor(4)} title="Smoking" desc="Not allowed inside the vehicle." />
                      <Rule icon={<Ban className="size-4" />} accent={accentFor(5)} title="Sub-renting" desc="Strictly prohibited under platform terms." />
                    </div>
                  ),
                },
                {
                  label: `Reviews (${vehicle.ratingCount})`,
                  content: (
                    <div className="space-y-5">
                      {vehicle.reviews.length === 0 ? (
                        <EmptyState title="No reviews yet" description="Be the first to rent and review this vehicle." />
                      ) : (
                        vehicle.reviews.map((r) => (
                          <div key={r.id} className="flex gap-3 border-b border-[var(--border)] pb-5 last:border-0">
                            <Avatar name={r.author.name} src={r.author.avatarUrl} size={38} />
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between gap-2">
                                <p className="text-sm font-semibold">{r.author.name}</p>
                                <span className="text-xs text-[var(--muted-2)]">{timeAgo(r.createdAt)}</span>
                              </div>
                              <RatingStars value={r.rating} showValue={false} size={13} />
                              {r.comment && <p className="mt-1.5 text-sm text-[var(--muted)]">{r.comment}</p>}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  ),
                },
              ]}
            />
          </div>
        </div>

        <div className="space-y-5">
          <div className="lg:sticky lg:top-20 space-y-5">
            <BookingWidget
              vehicleId={vehicle.id}
              vehicle={{
                pricePerHour: vehicle.pricePerHour,
                pricePerDay: vehicle.pricePerDay,
                pricePerWeek: vehicle.pricePerWeek,
                securityDeposit: vehicle.securityDeposit,
                includedKmPerDay: vehicle.includedKmPerDay,
                extraKmCharge: vehicle.extraKmCharge,
              }}
              isAuthenticated={!!user}
              isOwner={isOwner}
              minRentalHours={vehicle.minRentalHours}
              maxRentalDays={vehicle.maxRentalDays}
            />
            <OwnerCard
              owner={{
                id: vehicle.owner.id,
                name: vehicle.owner.name,
                avatarUrl: vehicle.owner.avatarUrl,
                createdAt: vehicle.owner.createdAt,
                identityVerified: vehicle.owner.identityVerified,
                trustScore: vehicle.owner.trustScore,
              }}
              totalRentals={vehicle.totalRentals}
            />
          </div>
        </div>
      </div>

      {similar.length > 0 && (
        <div className="mt-14">
          <h2 className="text-lg font-bold mb-4">Similar vehicles in {vehicle.city}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {similar.map((v) => (
              <VehicleCard key={v.id} vehicle={{ ...v, imageUrl: v.images[0]?.url ?? null }} isAuthenticated={!!user} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Spec({
  icon,
  accent,
  label,
  value,
}: {
  icon: React.ReactNode;
  accent: Accent;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <div className={`flex size-8 items-center justify-center rounded-full shrink-0 ${accent.bg} ${accent.text}`}>
        {icon}
      </div>
      <div>
        <p className="text-xs text-[var(--muted)]">{label}</p>
        <p className="text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}

function Rule({
  icon,
  accent,
  title,
  desc,
}: {
  icon: React.ReactNode;
  accent: Accent;
  title: string;
  desc: string;
}) {
  return (
    <div className="flex gap-3 rounded-[var(--radius-md)] border border-[var(--border)] p-4">
      <div className={`flex size-9 shrink-0 items-center justify-center rounded-full ${accent.bg} ${accent.text}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm font-semibold">{title}</p>
        <p className="mt-0.5 text-sm text-[var(--muted)]">{desc}</p>
      </div>
    </div>
  );
}
