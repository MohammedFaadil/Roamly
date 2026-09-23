import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  MapPin,
  FileText,
  KeyRound,
  Undo2,
  AlertTriangle,
  Star,
  Receipt,
  ChevronRight,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { VehicleThumb } from "@/components/vehicle/VehicleThumb";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Stepper } from "@/components/ui/Stepper";
import { AcceptRejectActions, PayAction, CancelAction } from "@/components/booking/BookingActions";
import { ReviewForm } from "@/components/booking/ReviewForm";
import { formatINR, formatDateTime, formatDuration } from "@/lib/format";
import { BOOKING_STATUS_LABEL, BOOKING_STATUS_TONE } from "@/lib/constants";

export const dynamic = "force-dynamic";

const FLOW_STEPS = ["Requested", "Accepted", "Paid & Signed", "Handover", "Active", "Returned"];

function stepIndexForStatus(status: string) {
  switch (status) {
    case "REQUESTED":
      return 0;
    case "OWNER_ACCEPTED":
      return 1;
    case "CONFIRMED":
      return 2;
    case "HANDOVER_PENDING":
      return 3;
    case "ACTIVE":
      return 4;
    case "RETURN_PENDING":
    case "COMPLETED":
    case "DISPUTED":
      return 5;
    default:
      return 0;
  }
}

export default async function BookingDetailPage({ params }: PageProps<"/booking/[id]">) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=/booking/${id}`);

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      vehicle: { include: { owner: true, images: true } },
      renter: true,
      agreement: true,
      payments: { orderBy: { createdAt: "asc" } },
      handover: true,
      returnInspection: true,
      damageClaims: { orderBy: { createdAt: "desc" } },
      dispute: true,
      reviews: true,
    },
  });

  if (!booking) notFound();

  const isRenter = booking.renterId === user.id;
  const isOwner = booking.vehicle.ownerId === user.id;
  if (!isRenter && !isOwner && user.role !== "ADMIN") notFound();

  const otherParty = isRenter ? booking.vehicle.owner : booking.renter;
  const isCancelled = booking.status.startsWith("CANCELLED") || booking.status === "OWNER_REJECTED";
  const hasReviewed = booking.reviews.some((r) => r.authorId === user.id);
  const canReview = ["COMPLETED", "DISPUTED"].includes(booking.status) && !hasReviewed;

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs text-[var(--muted)]">Booking #{booking.id.slice(-8).toUpperCase()}</p>
          <h1 className="text-xl font-bold tracking-tight">
            {booking.vehicle.year} {booking.vehicle.brand} {booking.vehicle.model}
          </h1>
        </div>
        <Badge tone={BOOKING_STATUS_TONE[booking.status] ?? "neutral"} className="text-sm px-3 py-1.5">
          {BOOKING_STATUS_LABEL[booking.status] ?? booking.status}
        </Badge>
      </div>

      {!isCancelled && booking.status !== "DISPUTED" && (
        <div className="mb-8 rounded-[var(--radius-lg)] border border-[var(--border)] bg-white p-5">
          <Stepper steps={FLOW_STEPS} current={stepIndexForStatus(booking.status)} />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        <div className="space-y-6">
          {/* Vehicle + trip summary */}
          <div className="flex gap-4 rounded-[var(--radius-lg)] border border-[var(--border)] bg-white p-5">
            <VehicleThumb
              type={booking.vehicle.type as "CAR" | "BIKE"}
              brand={booking.vehicle.brand}
              model={booking.vehicle.model}
              seed={booking.vehicle.id}
              imageUrl={booking.vehicle.images[0]?.url}
              className="h-24 w-32 shrink-0 rounded-[var(--radius-md)]"
              iconClassName="size-10"
            />
            <div className="min-w-0 flex-1">
              <Link href={`/vehicles/${booking.vehicle.id}`} className="text-sm font-semibold hover:underline">
                {booking.vehicle.year} {booking.vehicle.brand} {booking.vehicle.model}
              </Link>
              <p className="mt-1 flex items-center gap-1 text-xs text-[var(--muted)]">
                <MapPin className="size-3.5" /> {booking.vehicle.area ? `${booking.vehicle.area}, ` : ""}{booking.vehicle.city}
              </p>
              <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-[var(--muted)]">
                <span>Pickup: <b className="text-[var(--foreground)]">{formatDateTime(booking.startAt)}</b></span>
                <span>Return: <b className="text-[var(--foreground)]">{formatDateTime(booking.endAt)}</b></span>
                <span>Duration: <b className="text-[var(--foreground)]">{formatDuration(booking.startAt, booking.endAt)}</b></span>
                <span>{isRenter ? "Owner" : "Renter"}: <b className="text-[var(--foreground)]">{otherParty.name}</b></span>
              </div>
            </div>
          </div>

          {/* Status-specific actions */}
          {booking.status === "REQUESTED" && isOwner && (
            <ActionCard title="Booking request pending" description="Review and respond to this rental request.">
              <AcceptRejectActions bookingId={booking.id} />
            </ActionCard>
          )}
          {booking.status === "REQUESTED" && isRenter && (
            <ActionCard title="Waiting for owner approval" description="You'll be notified as soon as the owner responds.">
              <CancelAction bookingId={booking.id} />
            </ActionCard>
          )}
          {booking.status === "OWNER_REJECTED" && (
            <ActionCard title="Request declined" description={booking.cancelReason ?? "The owner declined this request."} tone="danger" />
          )}
          {booking.status === "OWNER_ACCEPTED" && isRenter && (
            <ActionCard title="Complete payment to confirm" description="Your request was accepted. Pay now to lock in your booking.">
              <PayAction bookingId={booking.id} amount={formatINR(booking.baseFare + booking.platformFee + booking.taxes + booking.securityDeposit)} />
            </ActionCard>
          )}
          {booking.status === "OWNER_ACCEPTED" && isOwner && (
            <ActionCard title="Waiting for renter payment" description="The renter has been notified to complete payment." />
          )}
          {booking.status === "CONFIRMED" && (
            <ActionCard
              title="Sign the rental agreement"
              description="Both parties need to sign before pickup."
              action={<Button href={`/booking/${booking.id}/agreement`} icon={<FileText className="size-4" />}>Review agreement</Button>}
            />
          )}
          {booking.status === "HANDOVER_PENDING" && (
            <ActionCard
              title="Ready for vehicle handover"
              description="Complete the digital handover checklist at pickup."
              action={<Button href={`/booking/${booking.id}/handover`} icon={<KeyRound className="size-4" />}>Start handover</Button>}
            />
          )}
          {booking.status === "ACTIVE" && (
            <ActionCard
              title="Rental is active"
              description="Enjoy your rental. Start the return checklist once you're back."
              action={
                <div className="flex flex-wrap gap-3">
                  <Button href={`/booking/${booking.id}/return`} icon={<Undo2 className="size-4" />}>Return vehicle</Button>
                  {isOwner && (
                    <Button href={`/booking/${booking.id}/damage`} variant="secondary" icon={<AlertTriangle className="size-4" />}>
                      Report an issue
                    </Button>
                  )}
                </div>
              }
            />
          )}
          {booking.status === "RETURN_PENDING" && (
            <ActionCard
              title="Return in progress"
              description="Complete the return checklist to finish this rental."
              action={<Button href={`/booking/${booking.id}/return`} icon={<Undo2 className="size-4" />}>Continue return</Button>}
            />
          )}
          {booking.status === "DISPUTED" && (
            <ActionCard
              title="Damage claim under review"
              description="A damage claim was filed for this rental."
              tone="danger"
              action={<Button href={`/booking/${booking.id}/damage`} variant="secondary" icon={<AlertTriangle className="size-4" />}>View claim</Button>}
            />
          )}
          {booking.status === "COMPLETED" && (
            <ActionCard title="Rental completed" description="Thanks for using Roamly. Hope it went smoothly!" tone="success">
              {isOwner && (
                <Button href={`/booking/${booking.id}/damage`} variant="ghost" size="sm" icon={<AlertTriangle className="size-3.5" />}>
                  Report damage found after return
                </Button>
              )}
            </ActionCard>
          )}
          {isCancelled && booking.status !== "OWNER_REJECTED" && (
            <ActionCard title="Booking cancelled" description={booking.cancelReason ?? "This booking was cancelled."} tone="danger" />
          )}

          {canReview && <ReviewForm bookingId={booking.id} targetName={otherParty.name} />}

          {hasReviewed && (
            <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-white p-5 flex items-center gap-2 text-sm text-[var(--muted)]">
              <Star className="size-4 fill-[var(--star)] text-[var(--star)]" /> You&apos;ve already reviewed this rental. Thanks!
            </div>
          )}

          {/* Documents & links */}
          <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-white divide-y divide-[var(--border)]">
            <RowLink href={`/booking/${booking.id}/agreement`} icon={<FileText className="size-4" />} label="Rental agreement" disabled={!booking.agreement} />
            <RowLink href={`/booking/${booking.id}/handover`} icon={<KeyRound className="size-4" />} label="Handover checklist" disabled={!booking.handover && booking.status === "REQUESTED"} />
            <RowLink href={`/booking/${booking.id}/return`} icon={<Undo2 className="size-4" />} label="Return checklist" disabled={!["ACTIVE", "RETURN_PENDING", "COMPLETED", "DISPUTED"].includes(booking.status)} />
            {booking.damageClaims.length > 0 && (
              <RowLink href={`/booking/${booking.id}/damage`} icon={<AlertTriangle className="size-4" />} label="Damage claim" />
            )}
          </div>
        </div>

        {/* Sidebar: price + payments */}
        <div className="space-y-5">
          <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-white p-5">
            <h3 className="flex items-center gap-1.5 text-sm font-semibold mb-3">
              <Receipt className="size-4" /> Price breakdown
            </h3>
            <div className="space-y-2 text-sm">
              <Row label="Base fare" value={formatINR(booking.baseFare)} />
              <Row label="Platform fee" value={formatINR(booking.platformFee)} />
              <Row label="Taxes (GST)" value={formatINR(booking.taxes)} />
              <Row label="Security deposit" value={formatINR(booking.securityDeposit)} muted />
              <div className="flex items-center justify-between border-t border-[var(--border)] pt-2 font-semibold">
                <span>Total</span>
                <span>{formatINR(booking.totalPayable)}</span>
              </div>
            </div>
          </div>

          {booking.payments.length > 0 && (
            <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-white p-5">
              <h3 className="text-sm font-semibold mb-3">Payments</h3>
              <div className="space-y-2.5">
                {booking.payments.map((p) => (
                  <div key={p.id} className="flex items-center justify-between text-sm">
                    <div>
                      <p className="font-medium">{p.type.replace("_", " ")}</p>
                      <p className="text-xs text-[var(--muted-2)]">{p.method}</p>
                    </div>
                    <span className={p.type === "REFUND" ? "text-[var(--success)]" : ""}>
                      {p.type === "REFUND" ? "+" : ""}{formatINR(p.amount)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ActionCard({
  title,
  description,
  action,
  tone = "default",
  children,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  tone?: "default" | "success" | "danger";
  children?: React.ReactNode;
}) {
  const toneClasses =
    tone === "success"
      ? "border-[var(--success)]/30 bg-[var(--success-bg)]/40"
      : tone === "danger"
      ? "border-[var(--danger)]/30 bg-[var(--danger-bg)]/40"
      : "border-[var(--border)] bg-white";
  return (
    <div className={`rounded-[var(--radius-lg)] border p-5 ${toneClasses}`}>
      <h3 className="text-sm font-semibold">{title}</h3>
      {description && <p className="mt-1 text-sm text-[var(--muted)]">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
      {children && <div className="mt-4">{children}</div>}
    </div>
  );
}

function Row({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className={`flex items-center justify-between ${muted ? "text-[var(--muted)]" : ""}`}>
      <span>{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

function RowLink({
  href,
  icon,
  label,
  disabled,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  disabled?: boolean;
}) {
  if (disabled) {
    return (
      <div className="flex items-center gap-3 px-5 py-3.5 text-sm text-[var(--muted-2)]">
        {icon} {label}
      </div>
    );
  }
  return (
    <Link href={href} className="flex items-center justify-between gap-3 px-5 py-3.5 text-sm hover:bg-gray-50">
      <span className="flex items-center gap-3">{icon} {label}</span>
      <ChevronRight className="size-4 text-[var(--muted-2)]" />
    </Link>
  );
}
