import Link from "next/link";
import { MapPin, ChevronRight } from "lucide-react";
import { VehicleThumb } from "@/components/vehicle/VehicleThumb";
import { Badge } from "@/components/ui/Badge";
import { formatDateTime, formatINR } from "@/lib/format";
import { BOOKING_STATUS_LABEL, BOOKING_STATUS_TONE } from "@/lib/constants";

export interface BookingRowData {
  id: string;
  status: string;
  startAt: Date | string;
  endAt: Date | string;
  totalPayable: number;
  vehicle: {
    id: string;
    type: string;
    brand: string;
    model: string;
    year: number;
    city: string;
    imageUrl?: string | null;
  };
  counterpartyName: string;
  counterpartyRole: "Owner" | "Renter";
}

export function BookingRow({ booking }: { booking: BookingRowData }) {
  return (
    <Link
      href={`/booking/${booking.id}`}
      className="flex items-center gap-4 rounded-[var(--radius-lg)] border border-[var(--border)] bg-white p-4 hover:shadow-sm transition-shadow"
    >
      <VehicleThumb
        type={booking.vehicle.type as "CAR" | "BIKE"}
        brand={booking.vehicle.brand}
        model={booking.vehicle.model}
        seed={booking.vehicle.id}
        imageUrl={booking.vehicle.imageUrl}
        className="h-16 w-20 shrink-0 rounded-[var(--radius-sm)]"
        iconClassName="size-7"
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-sm font-semibold">
            {booking.vehicle.year} {booking.vehicle.brand} {booking.vehicle.model}
          </p>
          <Badge tone={BOOKING_STATUS_TONE[booking.status] ?? "neutral"} className="shrink-0">
            {BOOKING_STATUS_LABEL[booking.status] ?? booking.status}
          </Badge>
        </div>
        <p className="mt-0.5 flex items-center gap-1 text-xs text-[var(--muted)]">
          <MapPin className="size-3" /> {booking.vehicle.city} · {booking.counterpartyRole}: {booking.counterpartyName}
        </p>
        <p className="mt-1 text-xs text-[var(--muted-2)]">
          {formatDateTime(booking.startAt)} → {formatDateTime(booking.endAt)}
        </p>
      </div>
      <div className="hidden sm:block text-right shrink-0">
        <p className="text-sm font-semibold">{formatINR(booking.totalPayable)}</p>
      </div>
      <ChevronRight className="size-4 shrink-0 text-[var(--muted-2)]" />
    </Link>
  );
}
