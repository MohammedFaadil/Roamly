"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarClock, Info, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { computeBookingPrice, type VehicleForPricing } from "@/lib/pricing";
import { formatINR } from "@/lib/format";
import { useToast } from "@/components/ui/Toast";
import { toDatetimeLocalValue } from "@/lib/utils";

function nowLocal(offsetHours: number) {
  const d = new Date(Date.now() + offsetHours * 3600000);
  d.setMinutes(Math.round(d.getMinutes() / 30) * 30, 0, 0);
  return toDatetimeLocalValue(d);
}

export function BookingWidget({
  vehicleId,
  vehicle,
  isAuthenticated,
  isOwner,
  minRentalHours,
  maxRentalDays,
}: {
  vehicleId: string;
  vehicle: VehicleForPricing;
  isAuthenticated: boolean;
  isOwner: boolean;
  minRentalHours: number;
  maxRentalDays: number;
}) {
  const router = useRouter();
  const { show } = useToast();
  const [pickup, setPickup] = useState(nowLocal(2));
  const [ret, setRet] = useState(nowLocal(2 + minRentalHours));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const startAt = new Date(pickup);
  const endAt = new Date(ret);
  const validRange = endAt > startAt;
  const hours = validRange ? Math.max(1, Math.ceil((endAt.getTime() - startAt.getTime()) / 3600000)) : 0;
  const withinMin = hours >= minRentalHours;
  const withinMax = hours <= maxRentalDays * 24;

  const breakdown = useMemo(() => {
    if (!validRange) return null;
    return computeBookingPrice(vehicle, startAt, endAt);
  }, [pickup, ret, validRange]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleRequest() {
    if (!isAuthenticated) {
      router.push(`/login?next=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    if (!validRange || !withinMin || !withinMax) return;

    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vehicleId,
          startAt: startAt.toISOString(),
          endAt: endAt.toISOString(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Couldn't create booking request");
        return;
      }
      show("Booking request sent to the owner!");
      router.push(`/booking/${data.id}`);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-white p-5 shadow-sm">
      <div className="flex items-baseline gap-1.5">
        <span className="text-2xl font-bold">{formatINR(vehicle.pricePerDay)}</span>
        <span className="text-sm text-[var(--muted)]">/ day</span>
      </div>
      <p className="text-xs text-[var(--muted-2)]">{formatINR(vehicle.pricePerHour)}/hour · {formatINR(vehicle.pricePerWeek)}/week</p>

      <div className="mt-4 grid grid-cols-2 gap-2 rounded-[var(--radius-md)] border border-[var(--border)] p-1">
        <label className="rounded-[var(--radius-sm)] p-2.5 hover:bg-gray-50">
          <span className="flex items-center gap-1 text-[10px] font-semibold uppercase text-[var(--muted)]">
            <CalendarClock className="size-3" /> Pickup
          </span>
          <input
            type="datetime-local"
            value={pickup}
            onChange={(e) => setPickup(e.target.value)}
            className="mt-1 w-full bg-transparent text-xs font-medium outline-none"
          />
        </label>
        <label className="rounded-[var(--radius-sm)] p-2.5 hover:bg-gray-50">
          <span className="flex items-center gap-1 text-[10px] font-semibold uppercase text-[var(--muted)]">
            <CalendarClock className="size-3" /> Return
          </span>
          <input
            type="datetime-local"
            value={ret}
            onChange={(e) => setRet(e.target.value)}
            className="mt-1 w-full bg-transparent text-xs font-medium outline-none"
          />
        </label>
      </div>

      {!validRange && (
        <p className="mt-2 text-xs text-[var(--danger)]">Return time must be after pickup time.</p>
      )}
      {validRange && !withinMin && (
        <p className="mt-2 text-xs text-[var(--danger)]">Minimum rental duration is {minRentalHours} hours.</p>
      )}
      {validRange && !withinMax && (
        <p className="mt-2 text-xs text-[var(--danger)]">Maximum rental duration is {maxRentalDays} days.</p>
      )}

      {breakdown && withinMin && withinMax && (
        <div className="mt-4 space-y-2 border-t border-[var(--border)] pt-4 text-sm">
          <Row label={`Base fare (${breakdown.days > 0 && hours > 24 ? `${breakdown.days} day${breakdown.days > 1 ? "s" : ""}` : `${hours} hr`})`} value={formatINR(breakdown.baseFare)} />
          <Row label="Platform fee" value={formatINR(breakdown.platformFee)} />
          <Row label="Taxes (GST)" value={formatINR(breakdown.taxes)} />
          <Row label="Security deposit" value={formatINR(breakdown.securityDeposit)} muted />
          <div className="flex items-center justify-between border-t border-[var(--border)] pt-2 font-semibold">
            <span>Total payable</span>
            <span>{formatINR(breakdown.totalPayable)}</span>
          </div>
          <p className="flex items-start gap-1.5 rounded-[var(--radius-sm)] bg-gray-50 p-2.5 text-[11px] text-[var(--muted)]">
            <Info className="size-3.5 shrink-0 mt-0.5" />
            Includes {breakdown.includedKm} km. Extra usage billed at {formatINR(breakdown.extraKmCharge)}/km. Deposit is refunded after return, minus any approved deductions.
          </p>
        </div>
      )}

      {error && <p className="mt-3 text-sm text-[var(--danger)]">{error}</p>}

      {isOwner ? (
        <div className="mt-4 rounded-[var(--radius-sm)] bg-gray-50 p-3 text-center text-xs text-[var(--muted)]">
          This is your own listing — owners can&apos;t book their own vehicle.
        </div>
      ) : (
        <Button
          fullWidth
          size="lg"
          className="mt-4"
          loading={submitting}
          disabled={!validRange || !withinMin || !withinMax}
          onClick={handleRequest}
        >
          Request to Book
        </Button>
      )}

      <p className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-[var(--muted-2)]">
        <ShieldCheck className="size-3.5" /> You won&apos;t be charged until the owner accepts
      </p>
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
