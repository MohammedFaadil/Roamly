import Link from "next/link";
import {
  ShieldCheck,
  Target,
  Eye,
  Handshake,
  Wallet,
  FileCheck2,
  KeyRound,
  Users,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/Button";
import { APP_NAME, CITIES } from "@/lib/constants";
import { ACCENTS, accentFor, type Accent } from "@/lib/accents";

export const dynamic = "force-dynamic";

export default async function AboutPage() {
  const [totalVehicles, totalRentals] = await Promise.all([
    prisma.vehicle.count({ where: { status: "ACTIVE" } }),
    prisma.booking.count({ where: { status: "COMPLETED" } }),
  ]);

  return (
    <div>
      <section className="border-b border-[var(--border)] bg-gray-50/60">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-white px-3.5 py-1.5 text-xs font-medium text-[var(--muted)]">
            <Users className="size-3.5 text-[var(--primary)]" />
            About {APP_NAME}
          </span>
          <h1 className="mt-6 text-3xl font-bold tracking-tight sm:text-4xl">
            Making everyday vehicles work harder, for everyone.
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-[var(--muted)]">
            {APP_NAME} connects vehicle owners with verified renters across India, turning idle
            cars and bikes into income and giving renters an affordable, flexible alternative to
            traditional rental agencies.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-x-10 gap-y-3 text-sm text-[var(--muted)]">
            <span>{totalVehicles}+ vehicles listed</span>
            <span className="text-[var(--border-strong)]">•</span>
            <span>{CITIES.length} cities</span>
            <span className="text-[var(--border-strong)]">•</span>
            <span>{totalRentals}+ completed rentals</span>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-white p-6">
            <div className={`flex size-11 items-center justify-center rounded-full ${ACCENTS[0].bg} ${ACCENTS[0].text}`}>
              <Target className="size-5" />
            </div>
            <h2 className="mt-4 text-lg font-bold">Our mission</h2>
            <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
              Make vehicle ownership more useful and mobility more accessible by connecting
              trusted vehicle owners with verified renters — so a parked car earns its keep, and
              anyone who needs a ride can find one nearby, at a fair price.
            </p>
          </div>
          <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-white p-6">
            <div className={`flex size-11 items-center justify-center rounded-full ${ACCENTS[1].bg} ${ACCENTS[1].text}`}>
              <Eye className="size-5" />
            </div>
            <h2 className="mt-4 text-lg font-bold">Our vision</h2>
            <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
              A future where private vehicle ownership and shared mobility aren&apos;t at odds —
              where every car and bike on the road can serve more than one household, reducing
              costs for renters and unlocking income for owners, city by city across India.
            </p>
          </div>
        </div>
      </section>

      <section className="border-t border-[var(--border)] bg-gray-50/60">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-14">
          <h2 className="text-xl font-bold tracking-tight">How it works, in brief</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">
            A simple flow built around trust, transparency, and control for both sides.
          </p>
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-3">
            <MiniStep icon={<FileCheck2 className="size-5" />} accent={accentFor(0)} title="Verify">
              Renters and owners both complete identity verification before their first
              transaction.
            </MiniStep>
            <MiniStep icon={<Wallet className="size-5" />} accent={accentFor(1)} title="Book & pay">
              Renters send a request, owners approve it, and payment is settled with a clear,
              itemised breakdown.
            </MiniStep>
            <MiniStep icon={<KeyRound className="size-5" />} accent={accentFor(2)} title="Drive & return">
              A digital agreement, a documented handover, and a documented return protect both
              sides of every rental.
            </MiniStep>
          </div>
          <div className="mt-8">
            <Button href="/how-it-works" variant="secondary">
              See the full step-by-step guide
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-14">
        <h2 className="text-xl font-bold tracking-tight">Trust &amp; safety commitments</h2>
        <p className="mt-1 text-sm text-[var(--muted)]">
          What we require of every user on the platform, on both sides of a rental.
        </p>
        <ul className="mt-6 space-y-4">
          <Commitment>
            Identity verification (KYC) is required before a renter&apos;s first booking is
            confirmed or an owner&apos;s first vehicle goes live.
          </Commitment>
          <Commitment>
            Every booking is backed by a digital rental agreement, signed by both parties before
            handover.
          </Commitment>
          <Commitment>
            Vehicle condition is documented with photos at handover and at return, so disputes
            can be resolved with evidence, not guesswork.
          </Commitment>
          <Commitment>
            Pricing is fully itemised before checkout — base fare, platform fee, taxes, and
            security deposit are all shown upfront, with no hidden charges.
          </Commitment>
          <Commitment>
            A structured damage claim and dispute process protects owners from unreported damage
            and renters from unfair charges.
          </Commitment>
        </ul>
      </section>

      <section className="border-t border-[var(--border)] bg-gray-50/60">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-14">
          <h2 className="text-xl font-bold tracking-tight">Why choose {APP_NAME}</h2>
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
            <WhyItem icon={<ShieldCheck className="size-5" />} accent={accentFor(0)} title="Verified community">
              Every renter and owner goes through identity verification, so you know who
              you&apos;re dealing with.
            </WhyItem>
            <WhyItem icon={<Wallet className="size-5" />} accent={accentFor(1)} title="Transparent pricing">
              No surprise fees — the full cost breakdown is visible before you ever confirm a
              booking.
            </WhyItem>
            <WhyItem icon={<Handshake className="size-5" />} accent={accentFor(2)} title="Owner-controlled listings">
              Owners set their own price, availability, and approve every request — full control,
              always.
            </WhyItem>
            <WhyItem icon={<FileCheck2 className="size-5" />} accent={accentFor(3)} title="Documented handovers">
              Digital agreements and photo-documented handovers protect both renters and owners.
            </WhyItem>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h2 className="text-2xl font-bold tracking-tight">Ready to get started?</h2>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Find a vehicle near you, or list your own and start earning.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button href="/explore" size="lg">
            Explore vehicles
          </Button>
          <Button href="/list-vehicle" size="lg" variant="secondary">
            List your vehicle
          </Button>
        </div>
        <p className="mt-8 text-xs text-[var(--muted-2)]">
          Have questions?{" "}
          <Link href="/faq" className="font-medium text-[var(--foreground)] hover:underline">
            Read our FAQ
          </Link>{" "}
          or{" "}
          <Link href="/contact" className="font-medium text-[var(--foreground)] hover:underline">
            contact us
          </Link>
          .
        </p>
      </section>
    </div>
  );
}

function MiniStep({
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
    <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-white p-5">
      <div className={`flex size-10 items-center justify-center rounded-full ${accent.bg} ${accent.text}`}>
        {icon}
      </div>
      <h3 className="mt-3 text-sm font-semibold">{title}</h3>
      <p className="mt-1.5 text-sm text-[var(--muted)]">{children}</p>
    </div>
  );
}

function Commitment({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3 rounded-[var(--radius-lg)] border border-[var(--border)] bg-white p-4">
      <ShieldCheck className="mt-0.5 size-4 shrink-0 text-[var(--success)]" />
      <p className="text-sm text-[var(--muted)]">{children}</p>
    </li>
  );
}

function WhyItem({
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
    <div className="flex items-start gap-4">
      <div className={`flex size-11 shrink-0 items-center justify-center rounded-full ${accent.bg} ${accent.text}`}>
        {icon}
      </div>
      <div>
        <h3 className="text-sm font-semibold">{title}</h3>
        <p className="mt-1 text-sm text-[var(--muted)]">{children}</p>
      </div>
    </div>
  );
}
