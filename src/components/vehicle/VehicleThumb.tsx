import { Car, Bike } from "lucide-react";
import { cn } from "@/lib/utils";
import { gradientForVehicle } from "@/lib/constants";

/**
 * Vehicle thumbnail with a real-photo fast path: pass `imageUrl` when the
 * vehicle has one (seeded demo vehicles now carry real Wikimedia Commons
 * photos matching their exact model — see prisma/seed.ts's VEHICLE_IMAGES
 * map — and owner-uploaded listings carry real uploaded photos). Falls back
 * to a consistent branded gradient placeholder only when no photo exists yet
 * (e.g. a freshly-listed vehicle with no photos uploaded, or the rare model
 * with no rights-cleared photo available — see the Ather 450X note in
 * prisma/seed.ts).
 */
export function VehicleThumb({
  type,
  brand,
  model,
  seed,
  imageUrl,
  className,
  iconClassName,
}: {
  type: "CAR" | "BIKE";
  brand: string;
  model: string;
  seed: string;
  imageUrl?: string | null;
  className?: string;
  iconClassName?: string;
}) {
  if (imageUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={imageUrl}
        alt={`${brand} ${model}`}
        className={cn("object-cover", className)}
      />
    );
  }

  const gradient = gradientForVehicle(seed);
  const Icon = type === "CAR" ? Car : Bike;

  return (
    <div
      className={cn(
        "relative flex items-center justify-center overflow-hidden bg-gradient-to-br",
        gradient,
        className
      )}
    >
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "radial-gradient(circle, #fff 1px, transparent 1px)",
          backgroundSize: "18px 18px",
        }}
      />
      <Icon
        strokeWidth={1.1}
        className={cn("relative text-white/90 drop-shadow-sm", iconClassName ?? "size-16")}
      />
      <div className="absolute bottom-2 right-3 text-[10px] font-medium tracking-wide text-white/60 uppercase">
        {brand} {model}
      </div>
    </div>
  );
}
