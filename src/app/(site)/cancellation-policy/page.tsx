import { Info, Clock, UserX, Wallet, Ban } from "lucide-react";
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

export default async function CancellationPolicyPage() {
  const setting = await prisma.platformSetting.findUnique({
    where: { key: "cancellation_free_window_hours" },
  });
  const freeWindowHours = setting ? Number(setting.value) : 6;

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold tracking-tight">Cancellation &amp; Refund Policy</h1>
      <p className="mt-2 text-sm text-[var(--muted-2)]">Last updated: 11 August 2026</p>

      <div className="mt-6 flex items-start gap-3 rounded-[var(--radius-lg)] border border-[var(--border)] bg-gray-50 p-4">
        <Info className="mt-0.5 size-4 shrink-0 text-[var(--muted)]" />
        <p className="text-sm text-[var(--muted)]">
          The free-cancellation window below is a platform-configurable setting (currently{" "}
          <strong className="text-[var(--foreground)]">{freeWindowHours} hours</strong>) and may
          be adjusted by {APP_NAME}. The current value is read live from platform settings.
        </p>
      </div>

      <div className="mt-4">
        <Section icon={Clock} accent={accentFor(0)} title="Free cancellation window">
          <p>
            You can cancel a booking free of charge if you do so at least{" "}
            <strong className="text-[var(--foreground)]">{freeWindowHours} hours</strong> before
            the scheduled pickup time. In this case, the full amount you paid — base fare,
            platform fee, taxes, and security deposit — is refunded.
          </p>
        </Section>

        <Section icon={Ban} accent={accentFor(1)} title="Cancelling after the free window">
          <p>
            Cancellations made within {freeWindowHours} hours of the scheduled pickup time are
            treated as late cancellations. A partial charge applies to compensate the owner for
            the reserved time — typically a portion of the base fare — with the remainder,
            including the full security deposit, refunded to you.
          </p>
        </Section>

        <Section icon={UserX} accent={accentFor(2)} title="No-show policy">
          <p>
            If you do not arrive for pickup and do not cancel the booking, it is treated as a
            no-show. No-shows are charged the same as a late cancellation and may affect your
            renter rating if they happen repeatedly.
          </p>
        </Section>

        <Section icon={Ban} accent={accentFor(3)} title="Owner-initiated cancellation">
          <p>
            Owners are expected to honour every booking they accept. If an owner cancels a
            confirmed booking, the renter receives a full refund of all amounts paid, with no
            charge. Repeated owner-initiated cancellations may affect a vehicle&apos;s visibility
            on the Platform.
          </p>
        </Section>

        <Section icon={Wallet} accent={accentFor(4)} title="Refund timing">
          <p>
            This is a demo product: refunds are not processed through a real payment gateway or
            bank. Whenever a refund is due, the amount is credited{" "}
            <strong className="text-[var(--foreground)]">instantly</strong> to your in-app Demo
            Wallet balance, so you can see the full cancellation flow work end-to-end without any
            real money movement.
          </p>
        </Section>
      </div>
    </div>
  );
}
