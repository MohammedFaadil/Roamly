import Link from "next/link";
import {
  ShieldCheck,
  Wallet,
  Clock,
  Car,
  Bike,
  ArrowRight,
  FileCheck2,
  Handshake,
  KeyRound,
  Star,
  Sparkles,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { HeroSearch } from "@/components/home/HeroSearch";
import { VehicleCard } from "@/components/vehicle/VehicleCard";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";
import { CAR_CATEGORIES, BIKE_CATEGORIES, CITIES, APP_NAME } from "@/lib/constants";
import { ACCENTS, type Accent } from "@/lib/accents";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const user = await getCurrentUser();
  const city = user?.city ?? "Chennai";

  const [featured, favoriteIds, totalVehicles, totalCities, totalRentals] = await Promise.all([
    prisma.vehicle.findMany({
      where: { status: "ACTIVE" },
      orderBy: [{ ratingAvg: "desc" }, { totalRentals: "desc" }],
      take: 8,
      include: { images: { orderBy: { sortOrder: "asc" }, take: 1 } },
    }),
    user
      ? prisma.favorite.findMany({ where: { userId: user.id }, select: { vehicleId: true } })
      : Promise.resolve([]),
    prisma.vehicle.count({ where: { status: "ACTIVE" } }),
    Promise.resolve(CITIES.length),
    prisma.booking.count({ where: { status: "COMPLETED" } }),
  ]);

  const favoriteSet = new Set(favoriteIds.map((f) => f.vehicleId));

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-[var(--border)] bg-gradient-to-b from-gray-50 to-white">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.4]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, rgba(37,99,235,0.06), transparent 40%), radial-gradient(circle at 80% 0%, rgba(20,22,26,0.05), transparent 40%)",
          }}
        />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-16 pb-20 sm:pt-24 sm:pb-28">
          <Reveal className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-white px-3.5 py-1.5 text-xs font-medium text-[var(--muted)] shadow-sm">
              <Sparkles className="size-3.5 text-[var(--accent)]" />
              Verified owners &amp; renters across India
            </span>
            <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Rent a car or bike
              <br />
              from people near you.
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-base text-[var(--muted)] sm:text-lg">
              Find verified vehicles, flexible rental periods, and transparent
              pricing wherever you need to go.
            </p>
          </Reveal>

          <Reveal delay={120} className="mt-10 flex justify-center">
            <HeroSearch />
          </Reveal>

          <Reveal delay={220} className="mt-10 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            <StatPill icon={<Car className="size-3.5" />} accent={ACCENTS[0]}>
              <AnimatedCounter value={totalVehicles} suffix="+" /> vehicles listed
            </StatPill>
            <StatPill icon={<ShieldCheck className="size-3.5" />} accent={ACCENTS[1]}>
              <AnimatedCounter value={totalCities} /> cities
            </StatPill>
            <StatPill icon={<Handshake className="size-3.5" />} accent={ACCENTS[3]}>
              <AnimatedCounter value={totalRentals} suffix="+" /> completed rentals
            </StatPill>
          </Reveal>
        </div>
      </section>

      {/* Value props */}
      <section className="border-b border-[var(--border)] bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            <Reveal delay={0}>
              <ValueProp
                icon={<ShieldCheck className="size-5" />}
                accent={ACCENTS[0]}
                title="Verified &amp; insured"
                description="Identity checks, vehicle documents, and digital agreements for every rental."
              />
            </Reveal>
            <Reveal delay={100}>
              <ValueProp
                icon={<Wallet className="size-5" />}
                accent={ACCENTS[1]}
                title="Transparent pricing"
                description="See the full breakdown upfront — no hidden fees, ever."
              />
            </Reveal>
            <Reveal delay={200}>
              <ValueProp
                icon={<Clock className="size-5" />}
                accent={ACCENTS[2]}
                title="Flexible durations"
                description="Rent by the hour, day, or week — whatever your trip needs."
              />
            </Reveal>
          </div>
        </div>
      </section>

      {/* Category quick links */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
        <Reveal className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold tracking-tight">Browse by category</h2>
            <p className="mt-1 text-sm text-[var(--muted)]">Find exactly the kind of vehicle you need</p>
          </div>
        </Reveal>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {[...CAR_CATEGORIES.slice(0, 3), ...BIKE_CATEGORIES.slice(0, 3)].map((cat, i) => {
            const accent = ACCENTS[i % ACCENTS.length];
            const isCar = CAR_CATEGORIES.some((c) => c.value === cat.value);
            return (
              <Reveal key={cat.value} delay={i * 60}>
                <Link
                  href={`/explore?category=${cat.value}`}
                  className="group flex flex-col items-center gap-2.5 rounded-[var(--radius-lg)] border border-[var(--border)] bg-white p-5 text-center transition-all duration-300 hover:-translate-y-1 hover:border-transparent hover:shadow-lg"
                >
                  <div
                    className={`flex size-11 items-center justify-center rounded-full transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6 ${accent.bg} ${accent.text}`}
                  >
                    {isCar ? <Car className="size-5" /> : <Bike className="size-5" />}
                  </div>
                  <span className="text-sm font-medium">{cat.label}</span>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* Featured vehicles */}
      <section className="border-t border-[var(--border)] bg-gray-50/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
          <Reveal className="flex items-end justify-between mb-6">
            <div>
              <span className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-[var(--accent)]">
                <Star className="size-3 fill-current" /> Highly rated
              </span>
              <h2 className="mt-1 text-xl font-bold tracking-tight">Popular vehicles near {city}</h2>
              <p className="mt-1 text-sm text-[var(--muted)]">Highly rated, frequently booked vehicles</p>
            </div>
            <Link href="/explore" className="hidden sm:flex items-center gap-1 text-sm font-semibold hover:underline">
              View all <ArrowRight className="size-3.5" />
            </Link>
          </Reveal>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((v, i) => (
              <Reveal key={v.id} delay={(i % 4) * 80}>
                <VehicleCard
                  vehicle={{ ...v, imageUrl: v.images[0]?.url ?? null }}
                  favorited={favoriteSet.has(v.id)}
                  isAuthenticated={!!user}
                />
              </Reveal>
            ))}
          </div>
          <div className="mt-8 flex justify-center sm:hidden">
            <Button href="/explore" variant="secondary">
              View all vehicles
            </Button>
          </div>
        </div>
      </section>

      {/* How it works teaser */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <Reveal className="text-center mb-10">
          <h2 className="text-xl font-bold tracking-tight">How renting works</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">From search to return, in four simple steps</p>
        </Reveal>
        <div className="relative grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="pointer-events-none absolute top-9 left-0 right-0 hidden lg:block">
            <div className="mx-[12.5%] h-px border-t border-dashed border-[var(--border-strong)]" />
          </div>
          <Reveal delay={0}>
            <Step number={1} icon={<Car className="size-5" />} accent={ACCENTS[0]} title="Search & select">
              Find a vehicle near you and check availability for your dates.
            </Step>
          </Reveal>
          <Reveal delay={90}>
            <Step number={2} icon={<FileCheck2 className="size-5" />} accent={ACCENTS[1]} title="Verify & request">
              Complete quick identity verification and send a booking request.
            </Step>
          </Reveal>
          <Reveal delay={180}>
            <Step number={3} icon={<KeyRound className="size-5" />} accent={ACCENTS[2]} title="Pick up & drive">
              Sign the digital agreement, complete handover, and drive off.
            </Step>
          </Reveal>
          <Reveal delay={270}>
            <Step number={4} icon={<Handshake className="size-5" />} accent={ACCENTS[3]} title="Return & review">
              Return the vehicle, settle any extras, and rate your experience.
            </Step>
          </Reveal>
        </div>
        <Reveal delay={320} className="mt-10 flex justify-center">
          <Button href="/how-it-works" variant="secondary">
            Learn more about how it works
          </Button>
        </Reveal>
      </section>

      {/* Owner CTA */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-20">
        <Reveal>
          <div className="group relative overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border)] bg-white px-6 py-14 shadow-sm sm:px-16">
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.5]"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 85% 20%, rgba(37,99,235,0.07), transparent 45%), radial-gradient(circle at 10% 90%, rgba(124,58,237,0.06), transparent 45%)",
              }}
            />
            <div className="relative flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
              <div className="max-w-lg">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-[var(--muted)]">
                  <Star className="size-3 fill-current text-amber-500" /> For vehicle owners
                </span>
                <h2 className="mt-4 text-2xl font-bold text-[var(--foreground)] sm:text-3xl">
                  Turn your idle car or bike into income.
                </h2>
                <p className="mt-3 text-sm text-[var(--muted)] sm:text-base">
                  List your vehicle on {APP_NAME}, set your own price and availability,
                  and start earning from renters near you — with owner-controlled
                  approval on every request.
                </p>
              </div>
              <div className="flex shrink-0 gap-3">
                <Button href="/list-vehicle" size="lg" className="relative overflow-hidden">
                  <span className="relative z-10">List your vehicle</span>
                  <span className="animate-shine pointer-events-none absolute inset-y-0 left-0 w-1/3 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                </Button>
                <Button href="/how-it-works#owners" size="lg" variant="secondary">
                  See how it works
                </Button>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}

function StatPill({
  icon,
  accent,
  children,
}: {
  icon: React.ReactNode;
  accent: Accent;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2 rounded-full border border-[var(--border)] bg-white py-1.5 pl-1.5 pr-4 shadow-sm">
      <span className={`flex size-6 items-center justify-center rounded-full ${accent.bg} ${accent.text}`}>
        {icon}
      </span>
      <span className="text-sm font-medium text-[var(--foreground)]">{children}</span>
    </div>
  );
}

function ValueProp({
  icon,
  accent,
  title,
  description,
}: {
  icon: React.ReactNode;
  accent: Accent;
  title: string;
  description: string;
}) {
  return (
    <div className="group flex items-start gap-4">
      <div
        className={`flex size-11 shrink-0 items-center justify-center rounded-full transition-transform duration-300 group-hover:scale-110 ${accent.bg} ${accent.text}`}
      >
        {icon}
      </div>
      <div>
        <h3 className="text-sm font-semibold">{title}</h3>
        <p className="mt-1 text-sm text-[var(--muted)]">{description}</p>
      </div>
    </div>
  );
}

function Step({
  number,
  icon,
  accent,
  title,
  children,
}: {
  number: number;
  icon: React.ReactNode;
  accent: Accent;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="group relative rounded-[var(--radius-lg)] border border-[var(--border)] bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      <span className="absolute right-5 top-5 text-2xl font-bold text-gray-100">
        0{number}
      </span>
      <div
        className={`flex size-10 items-center justify-center rounded-full transition-transform duration-300 group-hover:scale-110 ${accent.bg} ${accent.text}`}
      >
        {icon}
      </div>
      <h3 className="mt-4 text-sm font-semibold">{title}</h3>
      <p className="mt-1.5 text-sm text-[var(--muted)]">{children}</p>
      <span className={`absolute bottom-0 left-6 right-6 h-0.5 scale-x-0 rounded-full transition-transform duration-300 group-hover:scale-x-100 ${accent.solid}`} />
    </div>
  );
}
