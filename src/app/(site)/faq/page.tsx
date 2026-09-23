import { HelpCircle } from "lucide-react";
import { FaqAccordion, type FaqGroup } from "@/components/faq/FaqAccordion";
import { PLATFORM_FEE_RATE } from "@/lib/constants";

const groups: FaqGroup[] = [
  {
    title: "Renting a vehicle",
    items: [
      {
        question: "How does renting a car or bike on Roamly work?",
        answer:
          "Search for a vehicle by city and dates, review the listing, and send a booking request. Once the owner accepts, you complete payment, sign the digital rental agreement, and pick up the vehicle at the agreed time and location.",
      },
      {
        question: "Who can rent a vehicle?",
        answer:
          "Any registered user who has completed identity verification (KYC) and holds a valid driving licence for the vehicle category they want to rent — a two-wheeler licence for bikes, a four-wheeler licence for cars.",
      },
      {
        question: "How does identity verification work?",
        answer:
          "You upload a government-issued ID and your driving licence from your profile. Our verification flow checks the documents before your account is marked as verified — you'll need this before your first booking request is accepted.",
      },
      {
        question: "What documents do I need to rent?",
        answer:
          "A valid Aadhaar (or equivalent government ID) and a valid driving licence matching the vehicle type. Owners may also ask to see the physical licence at pickup.",
      },
      {
        question: "Can I rent by the hour, or only by the day?",
        answer:
          "Both. Every listing has hourly, daily, and weekly rates. Our pricing engine automatically applies whichever rate works out cheaper for your selected duration — for example, a short trip is billed hourly rather than a full day.",
      },
      {
        question: "What happens if I return the vehicle late?",
        answer:
          "A short grace period is allowed, but returning significantly later than your booked end time results in additional hourly charges at the vehicle's listed rate, and repeated late returns can affect your renter rating.",
      },
    ],
  },
  {
    title: "Listing your vehicle",
    items: [
      {
        question: "Who sets the rental price?",
        answer:
          "You do. Roamly shows an AI-assisted recommended price range when you list a vehicle, based on your vehicle's category, age, city demand, and similar listings — but it's only a suggestion. You can set any price you're comfortable with, and change it at any time.",
      },
      {
        question: "How is the recommended price calculated?",
        answer:
          "It's a transparent heuristic model that factors in your vehicle's category, transmission, fuel type, age, city-level demand, and rating, and shows you the reasoning behind the number. It is never a mandatory price — you stay in full control.",
      },
      {
        question: "Can I list a personal car or bike I still use myself?",
        answer:
          "Yes. You control your vehicle's availability calendar, so you can block out dates you need it for yourself and only accept bookings for the dates it's actually free.",
      },
      {
        question: "Do I have to accept every booking request?",
        answer:
          "No. Every request needs your explicit approval. You can review the renter's profile and verification status before accepting or declining.",
      },
      {
        question: "How and when do I get paid as an owner?",
        answer:
          "Payouts are released after the rental starts, minus the platform commission. In this demo environment, payouts are simulated instantly to your in-app Demo Wallet rather than a real bank transfer.",
      },
    ],
  },
  {
    title: "Payments & deposits",
    items: [
      {
        question: `What does the platform fee cover?`,
        answer: `Roamly charges a platform fee of ${Math.round(
          PLATFORM_FEE_RATE * 100
        )}% on the base rental fare, shown as a separate line item at checkout along with applicable taxes. It covers payment processing, identity verification, and platform support.`,
      },
      {
        question: "How is the security deposit handled?",
        answer:
          "Each vehicle has a fixed security deposit shown on the listing and included in your checkout total. It's held for the duration of the rental and refunded after a clean return, minus any accepted damage charges or outstanding extra-km fees.",
      },
      {
        question: "What if I need to cancel my booking?",
        answer:
          "Cancellations made before the free-cancellation window (configurable by the platform, typically a few hours before pickup) are fully refunded. Cancellations after that window may incur a partial charge. See our full Cancellation Policy for details.",
      },
      {
        question: "How are refunds processed?",
        answer:
          "In this demo product, refunds are simulated instantly and credited back to your Demo Wallet balance — there is no real payment gateway or bank settlement involved.",
      },
    ],
  },
  {
    title: "Safety & disputes",
    items: [
      {
        question: "What happens if the vehicle is damaged during my rental?",
        answer:
          "The owner can file a damage report with a description, estimated repair cost, and photo evidence within the claim window after the booking ends. You'll be notified and can either accept the claim — in which case the amount is deducted from your security deposit — or dispute it, which sends the claim to platform review.",
      },
      {
        question: "What if I'm involved in an accident?",
        answer:
          "Stop the vehicle safely, ensure everyone is okay, and contact local emergency services if needed. Then report the incident to the owner and to Roamly support as soon as possible with details and photos. See our Safety Center for a full checklist.",
      },
      {
        question: "Does Roamly provide insurance for rentals?",
        answer:
          "Roamly is a demo product and does not bundle or arrange real insurance coverage. Any insurance protecting a listed vehicle is the owner's own policy, as declared on the listing — always confirm coverage directly with the owner before you drive.",
      },
      {
        question: "What if the vehicle breaks down during my rental?",
        answer:
          "Contact the owner immediately through in-app messaging and note the issue in your booking. If it's a pre-existing mechanical fault, you're not responsible for the resulting cost — document it with photos and reach out to support if you can't resolve it with the owner directly.",
      },
    ],
  },
];

export default function FaqPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-blue-50 text-blue-600">
          <HelpCircle className="size-5" />
        </div>
        <h1 className="mt-4 text-3xl font-bold tracking-tight">Frequently asked questions</h1>
        <p className="mt-3 text-base text-[var(--muted)]">
          Everything you need to know about renting, listing, payments, and safety on Roamly.
        </p>
      </div>

      <div className="mt-10">
        <FaqAccordion groups={groups} />
      </div>

      <div className="mt-12 rounded-[var(--radius-lg)] border border-[var(--border)] bg-gray-50 p-6 text-center">
        <p className="text-sm text-[var(--muted)]">
          Can&apos;t find what you&apos;re looking for?{" "}
          <a href="/contact" className="font-semibold text-[var(--foreground)] hover:underline">
            Contact our support team
          </a>
          .
        </p>
      </div>
    </div>
  );
}
