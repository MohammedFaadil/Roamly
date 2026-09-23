import { notFound } from "next/navigation";
import Link from "next/link";
import { ExternalLink, FileCheck2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { VehicleThumb } from "@/components/vehicle/VehicleThumb";
import { VehicleEditForm } from "@/components/owner/VehicleEditForm";
import { AvailabilityManager } from "@/components/owner/AvailabilityManager";
import { Badge } from "@/components/ui/Badge";
import { categoryLabel } from "@/lib/constants";
import { formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

const DOC_TONE: Record<string, "success" | "warning" | "danger" | "neutral"> = {
  VERIFIED: "success",
  PENDING: "warning",
  REJECTED: "danger",
  NOT_SUBMITTED: "neutral",
};

export default async function ManageVehiclePage({ params }: PageProps<"/owner/vehicles/[id]">) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) return null;

  const vehicle = await prisma.vehicle.findUnique({
    where: { id },
    include: { documents: true, images: true },
  });
  if (!vehicle || vehicle.ownerId !== user.id) notFound();

  const blocks = await prisma.availabilityBlock.findMany({
    where: { vehicleId: id, endAt: { gte: new Date() } },
    orderBy: { startAt: "asc" },
  });

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div className="flex gap-4">
          <VehicleThumb type={vehicle.type as "CAR" | "BIKE"} brand={vehicle.brand} model={vehicle.model} seed={vehicle.id} imageUrl={vehicle.images[0]?.url} className="h-20 w-28 rounded-[var(--radius-md)] shrink-0" iconClassName="size-8" />
          <div>
            <h1 className="text-xl font-bold tracking-tight">{vehicle.year} {vehicle.brand} {vehicle.model}</h1>
            <p className="text-sm text-[var(--muted)]">{categoryLabel(vehicle.category)} · {vehicle.city} · {vehicle.registrationNo}</p>
            <Link href={`/vehicles/${vehicle.id}`} target="_blank" className="mt-1 flex items-center gap-1 text-xs font-medium text-[var(--accent)] hover:underline">
              View public listing <ExternalLink className="size-3" />
            </Link>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-white p-5">
          <h2 className="text-sm font-semibold mb-4">Pricing &amp; details</h2>
          <VehicleEditForm
            vehicleId={vehicle.id}
            initial={{
              pricePerHour: vehicle.pricePerHour,
              pricePerDay: vehicle.pricePerDay,
              pricePerWeek: vehicle.pricePerWeek,
              securityDeposit: vehicle.securityDeposit,
              includedKmPerDay: vehicle.includedKmPerDay,
              extraKmCharge: vehicle.extraKmCharge,
              odometerKm: vehicle.odometerKm,
              description: vehicle.description,
              status: vehicle.status,
            }}
          />
        </div>

        <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-white p-5">
          <h2 className="text-sm font-semibold mb-4">Blocked dates</h2>
          <AvailabilityManager
            vehicleId={vehicle.id}
            blocks={blocks.map((b) => ({ id: b.id, startAt: b.startAt.toISOString(), endAt: b.endAt.toISOString(), reason: b.reason }))}
          />
        </div>

        <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-white p-5">
          <h2 className="flex items-center gap-1.5 text-sm font-semibold mb-4">
            <FileCheck2 className="size-4" /> Vehicle documents
          </h2>
          {vehicle.documents.length === 0 ? (
            <p className="text-sm text-[var(--muted)]">No documents on file for this vehicle yet.</p>
          ) : (
            <div className="space-y-2">
              {vehicle.documents.map((d) => (
                <div key={d.id} className="flex items-center justify-between rounded-[var(--radius-sm)] border border-[var(--border)] px-4 py-2.5 text-sm">
                  <span>{d.type.replace(/_/g, " ")}</span>
                  <div className="flex items-center gap-3">
                    {d.expiresAt && <span className="text-xs text-[var(--muted-2)]">Expires {formatDate(d.expiresAt)}</span>}
                    <Badge tone={DOC_TONE[d.status]}>{d.status.replace("_", " ")}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
