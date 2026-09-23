"use client";

import { useState } from "react";
import { VehicleThumb } from "@/components/vehicle/VehicleThumb";
import { cn } from "@/lib/utils";
import { Expand } from "lucide-react";

const ANGLES = ["Front", "Rear", "Left Side", "Right Side", "Interior", "Dashboard"];

export function VehicleGallery({
  type,
  brand,
  model,
  seed,
  images,
}: {
  type: "CAR" | "BIKE";
  brand: string;
  model: string;
  seed: string;
  images: { url: string; label: string | null }[];
}) {
  const [active, setActive] = useState(0);
  const hasReal = images.length > 0;
  const tiles = hasReal ? images : ANGLES.map((label) => ({ url: "", label }));

  return (
    <div>
      <div className="relative h-72 sm:h-[26rem] w-full overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)]">
        {hasReal ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={tiles[active].url} alt={tiles[active].label ?? ""} className="h-full w-full object-cover" />
        ) : (
          <VehicleThumb type={type} brand={brand} model={model} seed={`${seed}-${active}`} className="h-full w-full" iconClassName="size-24" />
        )}
        <span className="absolute bottom-3 left-3 rounded-full bg-black/50 px-3 py-1 text-xs font-medium text-white backdrop-blur">
          {tiles[active].label}
        </span>
        {tiles.length > 1 && (
          <span className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-black/50 px-2.5 py-1 text-xs font-medium text-white backdrop-blur">
            <Expand className="size-3" /> {active + 1}/{tiles.length}
          </span>
        )}
      </div>
      {tiles.length > 1 && (
      <div className="mt-2.5 grid grid-cols-4 gap-2 sm:grid-cols-6">
        {tiles.map((tile, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className={cn(
              "relative h-16 overflow-hidden rounded-[var(--radius-sm)] border-2 transition-colors",
              active === i ? "border-[var(--primary)]" : "border-transparent"
            )}
          >
            {hasReal ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={tile.url} alt={tile.label ?? ""} className="h-full w-full object-cover" />
            ) : (
              <VehicleThumb type={type} brand={brand} model={model} seed={`${seed}-${i}`} className="h-full w-full" iconClassName="size-6" />
            )}
          </button>
        ))}
      </div>
      )}
    </div>
  );
}
