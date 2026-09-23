import {
  Car,
  Sparkles,
  ShieldCheck,
  Wallet,
  CalendarCheck,
  UserPlus,
  FileCheck2,
  Tag,
  Inbox,
  KeyRound,
  IndianRupee,
  Star,
} from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/Button";
import { formatINR } from "@/lib/format";
import { recommendPrice } from "@/lib/pricing";
import { APP_NAME, OWNER_COMMISSION_RATE } from "@/lib/constants";
import { accentFor, type Accent } from "@/lib/accents";

export const dynamic = "force-dynamic";

export default async function ListVehiclePage() {
  const user = await getCurrentUser();
  const ctaHref = user ? "/owner/vehicles/new" : "/register?next=/owner/vehicles/new";

  const [ownerCount, vehicleCount] = await Promise.all([
    prisma.user.count({ where: { vehicles: { some: {} } } }),
    prisma.vehicle.count({ where: { status: "ACTIVE" } }),
  ]);

  const sampleCreta = recommendPrice({
    category: "SUV",
    fuelType: "PETROL",
    transmission: "AUTOMATIC",
    year: new Date().getFullYear() - 2,
    city: "Bengaluru",
  });

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-[var(--border)] bg-gradient-to-b from-gray-50 to-white">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.4]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 80% 10%, rgba(37,99,235,0.07), transparent 40%), radial-gradient(circle at 10% 90%, rgba(20,22,26,0.05), transparent 40%)",
          }}
        />
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-white px-3.5 py-1.5 text-xs font-medium text-[var(--muted)]">
                <Wallet className="size-3.5 text-[var(--success)]" />
                {ownerCount}+ owners already earning on {APP_NAME}
              </span>
              <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl">
                Turn your idle car or bike into income.
              </h1>
              <p className="mt-5 max-w-lg text-base text-[var(--muted)] sm:text-lg">
                List your personal vehicle in minutes, set your own price and
                availability, and approve every rental yourself. {APP_NAME}
                handles discovery, digital agreements, and payment collection.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button href={ctaHref} size="lg" icon={<Car className="size-4" />}>
                  List your vehicle
                </Button>
                <Button href="/how-it-works#owners" size="lg" variant="secondary">
                  See how it works
                </Button>
              </div>
              <p className="mt-4 text-xs text-[var(--muted-2)]">
                Free to list. {APP_NAME} takes a {Math.round(OWNER_COMMISSION_RATE * 100)}% commission only when your vehicle earns.
              </p>
            </div>

            <div className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-white p-6 shadow-xl shadow-black/5">
              <div className="flex items-center gap-1.5 text-sm font-semibold text-[var(--foreground)]">
                <Sparkles className="size-4 text-[var(--accent)]" /> AI-assisted recommended pricing
              </div>
              <p className="mt-1 text-xs text-[var(--muted)]">Example: a 2-year-old automatic SUV in Bengaluru</p>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-3xl font-bold">{formatINR(sampleCreta.recommendedDaily)}</span>
                <span className="text-sm text-[var(--muted)]">/day</span>
              </div>
              <p className="mt-1 text-xs text-[var(--muted-2)]">
                Suggested range {formatINR(sampleCreta.minDaily)}–{formatINR(sampleCreta.maxDaily)}/day — you always set the final price.
              </p>
              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                <MiniStat label="Owners" value={`${ownerCount}+`} />
                <MiniStat label="Live vehicles" value={`${vehicleCount}+`} />
                <MiniStat label="Your control" value="100%" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Value props */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <ValueProp icon={<ShieldCheck className="size-5" />} accent={accentFor(0)} title="You approve every request">
            No booking is confirmed until you accept it — reject anything that doesn&apos;t feel right.
          </ValueProp>
          <ValueProp icon={<Tag className="size-5" />} accent={accentFor(1)} title="You set the price">
            Hourly, daily, and weekly rates, security deposit, and mileage limits are entirely up to you.
          </ValueProp>
          <ValueProp icon={<IndianRupee className="size-5" />} accent={accentFor(2)} title="Get paid per rental">
            Payment is collected before pickup and settled to you after each completed rental.
          </ValueProp>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-[var(--border)] bg-gray-50/60">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-10">
            <h2 className="text-xl font-bold tracking-tight">List your vehicle in four steps</h2>
            <p className="mt-1 text-sm text-[var(--muted)]">Most owners are ready to receive requests the same day</p>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <Step number={1} icon={<UserPlus className="size-5" />} accent={accentFor(0)} title="Create &amp; verify">
              Sign up and complete a quick identity verification.
            </Step>
            <Step number={2} icon={<FileCheck2 className="size-5" />} accent={accentFor(1)} title="Add your vehicle">
              Enter details, upload photos, and add registration info.
            </Step>
            <Step number={3} icon={<Tag className="size-5" />} accent={accentFor(2)} title="Set price &amp; availability">
              Use the recommended price or set your own — plus deposit and mileage rules.
            </Step>
            <Step number={4} icon={<Inbox className="size-5" />} accent={accentFor(3)} title="Approve &amp; earn">
              Review each request, hand over the keys, and get paid.
            </Step>
          </div>
        </div>
      </section>

      {/* Trust */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="flex gap-4 rounded-[var(--radius-lg)] border border-[var(--border)] bg-white p-6">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
              <KeyRound className="size-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold">Digital handover &amp; return</h3>
              <p className="mt-1 text-sm text-[var(--muted)]">
                Both sides confirm a photo-backed condition checklist at pickup and
                drop-off, so there&apos;s a clear record if anything&apos;s ever disputed.
              </p>
            </div>
          </div>
          <div className="flex gap-4 rounded-[var(--radius-lg)] border border-[var(--border)] bg-white p-6">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-violet-50 text-violet-600">
              <CalendarCheck className="size-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold">Block dates anytime</h3>
              <p className="mt-1 text-sm text-[var(--muted)]">
                Need your car back for a weekend? Block those dates from your
                owner dashboard and it&apos;s instantly removed from search.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pb-20">
        <div className="relative overflow-hidden rounded-[var(--radius-xl)] bg-[var(--primary)] px-6 py-14 text-center sm:px-16">
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
              backgroundSize: "20px 20px",
            }}
          />
          <div className="relative">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/80">
              <Star className="size-3 fill-current" /> Takes about 5 minutes
            </span>
            <h2 className="mx-auto mt-4 max-w-xl text-2xl font-bold text-white sm:text-3xl">
              Ready to list your vehicle?
            </h2>
            <div className="mt-7 flex justify-center">
              <Button href={ctaHref} size="lg" variant="secondary" className="!bg-white">
                {user ? "Continue to listing wizard" : "Create an account to get started"}
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function ValueProp({
  icon,
  accent,
  title,
  children,
}: {
  icon: React.ReactNode;
  accent: Accent;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-white p-6">
      <div className={`flex size-11 items-center justify-center rounded-full ${accent.bg} ${accent.text}`}>{icon}</div>
      <h3 className="mt-4 text-sm font-semibold">{title}</h3>
      <p className="mt-1.5 text-sm text-[var(--muted)]">{children}</p>
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
    <div className="relative rounded-[var(--radius-lg)] border border-[var(--border)] bg-white p-6">
      <span className="absolute right-5 top-5 text-2xl font-bold text-gray-100">0{number}</span>
      <div className={`flex size-10 items-center justify-center rounded-full ${accent.bg} ${accent.text}`}>{icon}</div>
      <h3 className="mt-4 text-sm font-semibold">{title}</h3>
      <p className="mt-1.5 text-sm text-[var(--muted)]">{children}</p>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[var(--radius-sm)] bg-gray-50 py-2.5">
      <p className="text-sm font-bold">{value}</p>
      <p className="text-[10px] text-[var(--muted)]">{label}</p>
    </div>
  );
}
