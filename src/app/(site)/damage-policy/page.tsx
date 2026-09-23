import { Info, Camera, Bell, CheckCircle2, Gavel, Wallet } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { APP_NAME } from "@/lib/constants";
import { accentFor, type Accent } from "@/lib/accents";

export const dynamic = "force-dynamic";

function Section({
  icon: Icon,
  accent,
  title,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  accent: Accent;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="py-6 border-b border-[var(--border)] last:border-b-0">
      <div className="flex items-center gap-3">
        <div className={`flex size-9 shrink-0 items-center justify-center rounded-full ${accent.bg} ${accent.text}`}>
          <Icon className="size-4" />
        </div>
        <h2 className="text-lg font-bold tracking-tight">{title}</h2>
      </div>
      <div className="mt-3 space-y-3 pl-12 text-sm leading-relaxed text-[var(--muted)]">
        {children}
      </div>
    </section>
  );
}

export default async function DamagePolicyPage() {
  const setting = await prisma.platformSetting.findUnique({
    where: { key: "damage_claim_window_hours" },
  });
  const claimWindowHours = setting ? Number(setting.value) : 24;

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold tracking-tight">Damage Policy</h1>
      <p className="mt-2 text-sm text-[var(--muted-2)]">Last updated: 11 August 2026</p>

      <div className="mt-6 flex items-start gap-3 rounded-[var(--radius-lg)] border border-[var(--border)] bg-gray-50 p-4">
        <Info className="mt-0.5 size-4 shrink-0 text-[var(--muted)]" />
        <p className="text-sm text-[var(--muted)]">
          This page describes the exact damage-claim flow implemented on {APP_NAME} today, not an
          aspirational process. The claim window below is a platform-configurable setting
          (currently{" "}
          <strong className="text-[var(--foreground)]">{claimWindowHours} hours</strong>) read
          live from platform settings.
        </p>
      </div>

      <div className="mt-4">
        <Section icon={Camera} accent={accentFor(0)} title="1. Owner reports damage">
          <p>
            After a rental reaches Active, Return Pending, or Completed status, the owner can file
            a damage claim within{" "}
            <strong className="text-[var(--foreground)]">{claimWindowHours} hours</strong> of the
            booking. The claim includes a written description of the damage, an estimated repair
            cost, and photo evidence. Submitting a claim is only available to the vehicle&apos;s
            owner, and only for that booking.
          </p>
        </Section>

        <Section icon={Bell} accent={accentFor(1)} title="2. Renter is notified">
          <p>
            The moment a claim is filed, the booking status changes to Disputed, a dispute record
            is opened, and the renter receives an in-app notification linking directly to the
            claim so they can review the description, cost estimate, and evidence.
          </p>
        </Section>

        <Section icon={CheckCircle2} accent={accentFor(2)} title="3. Renter accepts or disputes">
          <p>
            The renter chooses one of two responses:
          </p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>
              <strong className="text-[var(--foreground)]">Accept the claim</strong> — the
              estimated cost is charged as an extra charge against the booking, deducted from the
              security deposit, and the booking is marked Completed.
            </li>
            <li>
              <strong className="text-[var(--foreground)]">Dispute the claim</strong> — the
              dispute status moves to Under Review, and no charge is applied automatically. The
              owner is notified that their claim has been disputed.
            </li>
          </ul>
        </Section>

        <Section icon={Wallet} accent={accentFor(3)} title="4. Charges & deposit refund">
          <p>
            When a claim is accepted, the estimated cost is deducted from the security deposit
            held for that booking, and any remaining deposit balance is refunded to the renter.
            If the estimated cost exceeds the deposit, the excess is billed separately.
          </p>
        </Section>

        <Section icon={Gavel} accent={accentFor(4)} title="5. Disputed claims go to platform review">
          <p>
            Claims the renter disputes are escalated for manual review using the evidence
            submitted by the owner and any response provided by the renter. Platform review aims
            to reach a fair resolution based on the documented evidence from both handover and
            return inspections.
          </p>
        </Section>
      </div>
    </div>
  );
}
