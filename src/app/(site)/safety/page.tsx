import {
  ShieldCheck,
  Search,
  KeyRound,
  Navigation,
  RotateCcw,
  AlertTriangle,
  Fingerprint,
  Phone,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { accentFor } from "@/lib/accents";

const sections = [
  {
    icon: Search,
    title: "Before booking",
    items: [
      "Check that the vehicle and owner both show a verified badge before requesting a booking.",
      "Read recent reviews from other renters for the specific vehicle, not just the owner's overall rating.",
      "Message the owner through the platform if you have questions — keep communication in-app so there's a record.",
      "Review the full price breakdown, security deposit amount, and cancellation window before confirming.",
    ],
  },
  {
    icon: KeyRound,
    title: "Before pickup",
    items: [
      "Confirm the pickup location and time with the owner in advance.",
      "Bring your original driving licence and government ID — owners may ask to see them in person.",
      "Meet in a public, well-lit location whenever possible.",
      "Review and sign the digital rental agreement before you take the keys.",
    ],
  },
  {
    icon: Navigation,
    title: "During the rental",
    items: [
      "Photograph the vehicle's condition — exterior, interior, and odometer — at handover, even though this is also recorded in the app.",
      "Follow all traffic laws; you are responsible for any fines incurred during your rental period.",
      "Don't let anyone who isn't listed on the booking drive the vehicle.",
      "Keep the owner informed if your plans or return time change.",
    ],
  },
  {
    icon: RotateCcw,
    title: "Returning the vehicle",
    items: [
      "Return the vehicle to the agreed location, on time, with a full tank/charge if that was the condition at pickup.",
      "Complete the in-app return inspection together with the owner where possible.",
      "Report any new damage yourself rather than waiting for the owner to notice it — this protects you if a dispute follows.",
      "Keep your photo evidence until the rental is marked complete and your deposit is refunded.",
    ],
  },
  {
    icon: AlertTriangle,
    title: "Accidents",
    items: [
      "Prioritise safety first — check for injuries and call local emergency services (112) if needed.",
      "Move to a safe location if the vehicle is drivable and it's safe to do so.",
      "Document the scene with photos, and exchange information with any other parties involved.",
      "Notify the vehicle owner and Roamly support as soon as possible, and file a police report where required by law.",
    ],
  },
  {
    icon: ShieldCheck,
    title: "Fraud prevention",
    items: [
      "Never pay or communicate outside the Roamly platform — this removes your protection under our booking and dispute process.",
      "Be cautious of listings priced far below similar vehicles in the same city — verify the vehicle and owner before proceeding.",
      "Roamly will never ask for your password or full payment details over chat, email, or phone.",
      "Report suspicious listings, messages, or requests to support immediately.",
    ],
  },
  {
    icon: Phone,
    title: "Emergency assistance",
    items: [
      "In a genuine emergency, always contact local emergency services (112 for police/ambulance/fire in India) first.",
      "Use the in-app support contact for booking-related issues, breakdowns, or disputes that need Roamly's involvement.",
      "Keep the vehicle owner's contact details, visible from your booking, on hand throughout your rental.",
    ],
  },
  {
    icon: Fingerprint,
    title: "Identity & privacy",
    items: [
      "Identity documents you upload for verification are used only to confirm you are who you say you are, and to meet basic trust requirements for the marketplace.",
      "Other users see your name, profile photo, rating, and verification badge — never your uploaded ID documents.",
      "You can request access to or deletion of your personal data at any time — see our Privacy Policy for details.",
    ],
  },
];

export default function SafetyPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center max-w-2xl mx-auto">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-[var(--success-bg)] text-[var(--success)]">
          <ShieldCheck className="size-5" />
        </div>
        <h1 className="mt-4 text-3xl font-bold tracking-tight">Safety Center</h1>
        <p className="mt-3 text-base text-[var(--muted)]">
          Practical guidance for staying safe before, during, and after every rental — whether
          you&apos;re renting or listing a vehicle.
        </p>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2">
        {sections.map((section, i) => {
          const accent = accentFor(i);
          return (
          <div
            key={section.title}
            className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-white p-6"
          >
            <div className="flex items-center gap-3">
              <div className={`flex size-10 shrink-0 items-center justify-center rounded-full ${accent.bg} ${accent.text}`}>
                <section.icon className="size-5" />
              </div>
              <h2 className="text-base font-bold">{section.title}</h2>
            </div>
            <ul className="mt-4 space-y-2.5">
              {section.items.map((item, j) => (
                <li key={j} className="flex items-start gap-2.5 text-sm text-[var(--muted)]">
                  <span className="mt-1.5 size-1 shrink-0 rounded-full bg-[var(--border-strong)]" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          );
        })}
      </div>

      <div className="mt-12 rounded-[var(--radius-xl)] bg-[var(--primary)] px-6 py-10 sm:px-12 text-center">
        <div className="mx-auto flex size-11 items-center justify-center rounded-full bg-white/10 text-white">
          <Lock className="size-5" />
        </div>
        <h2 className="mt-4 text-xl font-bold text-white">Something feel wrong?</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-white/70">
          Trust your instincts. If a listing, message, or interaction feels off, don&apos;t proceed —
          report it to our support team right away.
        </p>
        <div className="mt-6 flex justify-center">
          <Button href="/contact?category=Technical issue" variant="secondary" className="!bg-white">
            Report a concern
          </Button>
        </div>
      </div>
    </div>
  );
}
