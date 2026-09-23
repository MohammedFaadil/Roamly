import {
  Search,
  FileCheck2,
  Send,
  CreditCard,
  PenLine,
  KeyRound,
  Navigation,
  RotateCcw,
  Star,
  UserPlus,
  ShieldCheck,
  Car,
  SlidersHorizontal,
  Inbox,
  CheckCircle2,
  Handshake,
  Wallet,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { PLATFORM_FEE_RATE } from "@/lib/constants";
import { accentFor, type Accent } from "@/lib/accents";

const renterSteps = [
  {
    icon: Search,
    title: "Search",
    body: "Browse verified cars and bikes by city, dates, and vehicle type — filter by price, transmission, or features.",
  },
  {
    icon: FileCheck2,
    title: "Verify",
    body: "Complete a one-time identity check with your government ID and driving licence before your first booking.",
  },
  {
    icon: Send,
    title: "Request",
    body: "Pick your dates and send a booking request. The owner reviews and approves it before anything is charged.",
  },
  {
    icon: CreditCard,
    title: "Pay",
    body: "Once accepted, pay the itemised total — base fare, platform fee, taxes, and security deposit shown upfront.",
  },
  {
    icon: PenLine,
    title: "Sign",
    body: "Review and sign the digital rental agreement covering the terms of your booking.",
  },
  {
    icon: KeyRound,
    title: "Pick up",
    body: "Meet the owner at the agreed location. Vehicle condition is documented with photos before you drive off.",
  },
  {
    icon: Navigation,
    title: "Drive",
    body: "Enjoy your rental — the vehicle, mileage allowance, and any extras are exactly as listed.",
  },
  {
    icon: RotateCcw,
    title: "Return",
    body: "Return the vehicle on time, complete the return inspection, and settle any extra charges if applicable.",
  },
  {
    icon: Star,
    title: "Review",
    body: "Rate your experience and the owner — reviews help keep the whole community trustworthy.",
  },
];

const ownerSteps = [
  {
    icon: UserPlus,
    title: "Create account",
    body: "Sign up with your name, email, phone number, and city in under a minute.",
  },
  {
    icon: ShieldCheck,
    title: "Verify",
    body: "Complete identity verification (KYC) — required before your first vehicle can go live.",
  },
  {
    icon: Car,
    title: "Add vehicle",
    body: "Enter your vehicle's details — brand, model, year, registration, and photos.",
  },
  {
    icon: SlidersHorizontal,
    title: "Set price & availability",
    body: "Use the AI-assisted recommended price as a starting point, then set your own rate and block out dates you need the vehicle yourself.",
  },
  {
    icon: Inbox,
    title: "Receive requests",
    body: "Get notified whenever a renter requests your vehicle, with their profile and verification status visible.",
  },
  {
    icon: CheckCircle2,
    title: "Approve",
    body: "Accept or decline each request — you're always in control of who rents your vehicle.",
  },
  {
    icon: Handshake,
    title: "Handover",
    body: "Meet the renter, document the vehicle's condition together, and hand over the keys.",
  },
  {
    icon: Wallet,
    title: "Get paid",
    body: "Your payout, minus the platform fee, is credited once the rental is confirmed and underway.",
  },
  {
    icon: Star,
    title: "Review renter",
    body: "Rate the renter after the rental ends to help build trust across the community.",
  },
];

export default function HowItWorksPage() {
  return (
    <div>
      <section className="border-b border-[var(--border)] bg-gray-50/60">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">How Roamly works</h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-[var(--muted)]">
            Two simple journeys — one for renting a vehicle, one for listing your own. Verified
            at every step, transparent about every charge.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button href="#renters" variant="secondary">
              I want to rent
            </Button>
            <Button href="#owners" variant="secondary">
              I want to list my vehicle
            </Button>
          </div>
        </div>
      </section>

      {/* Renter journey */}
      <section id="renters" className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16 scroll-mt-20">
        <div className="mb-8">
          <h2 className="text-2xl font-bold tracking-tight">Rent a vehicle</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">
            From search to return, in nine straightforward steps.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {renterSteps.map((step, i) => (
            <StepCard
              key={step.title}
              number={i + 1}
              icon={<step.icon className="size-5" />}
              title={step.title}
              accent={accentFor(i)}
            >
              {step.body}
            </StepCard>
          ))}
        </div>
        <div className="mt-8 flex justify-center">
          <Button href="/explore" size="lg">
            Start exploring vehicles
          </Button>
        </div>
      </section>

      {/* Owner journey */}
      <section
        id="owners"
        className="border-t border-[var(--border)] bg-gray-50/60 scroll-mt-20"
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16">
          <div className="mb-8">
            <h2 className="text-2xl font-bold tracking-tight">List your vehicle</h2>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Turn idle time into income, on your own terms, in nine steps.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {ownerSteps.map((step, i) => (
              <StepCard
                key={step.title}
                number={i + 1}
                icon={<step.icon className="size-5" />}
                title={step.title}
                accent={accentFor(i)}
              >
                {step.body}
              </StepCard>
            ))}
          </div>

          {/* Pricing subsection */}
          <div
            id="pricing"
            className="mt-14 rounded-[var(--radius-xl)] border border-[var(--border)] bg-white p-8 scroll-mt-20"
          >
            <div className="flex items-start gap-4">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                <Sparkles className="size-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold">How pricing works</h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
                  When you list a vehicle, Roamly shows an AI-assisted recommended price range —
                  calculated from your vehicle&apos;s category, age, transmission, fuel type, and
                  demand in your city, alongside similar listings nearby. It&apos;s a starting
                  point, not a rule: you always set the final hourly, daily, and weekly rates
                  yourself, and can change them at any time.
                </p>
                <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">
                  On every completed booking, Roamly charges a platform fee of{" "}
                  <strong className="text-[var(--foreground)]">
                    {Math.round(PLATFORM_FEE_RATE * 100)}%
                  </strong>{" "}
                  of the base rental fare. This is shown separately at checkout — renters see it
                  as part of their total, and owners see it deducted from their payout. There are
                  no other hidden charges.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-center">
            <Button href="/list-vehicle" size="lg" variant="secondary">
              List your vehicle now
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

function StepCard({
  number,
  icon,
  title,
  accent,
  children,
}: {
  number: number;
  icon: React.ReactNode;
  title: string;
  accent: Accent;
  children: React.ReactNode;
}) {
  return (
    <div className="group relative rounded-[var(--radius-lg)] border border-[var(--border)] bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      <span className="absolute right-5 top-5 text-2xl font-bold text-gray-100">
        {number < 10 ? `0${number}` : number}
      </span>
      <div
        className={`flex size-10 items-center justify-center rounded-full transition-transform duration-300 group-hover:scale-110 ${accent.bg} ${accent.text}`}
      >
        {icon}
      </div>
      <h3 className="mt-4 text-sm font-semibold">{title}</h3>
      <p className="mt-1.5 text-sm text-[var(--muted)]">{children}</p>
      <span
        className={`absolute bottom-0 left-6 right-6 h-0.5 scale-x-0 rounded-full transition-transform duration-300 group-hover:scale-x-100 ${accent.solid}`}
      />
    </div>
  );
}
