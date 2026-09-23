"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, Plus, Minus, LocateFixed } from "lucide-react";
import { formatINR } from "@/lib/format";
import { cn } from "@/lib/utils";

export interface MapVehicle {
  id: string;
  brand: string;
  model: string;
  lat: number;
  lng: number;
  pricePerDay: number;
  ratingAvg: number;
  ratingCount: number;
}

/**
 * Lightweight, dependency-free map visualization used until a real mapping SDK
 * (Google Maps / Mapbox) is wired in behind an API key. Positions markers by
 * normalizing lat/lng within the current result set's bounding box.
 */
export function MapPanel({ vehicles }: { vehicles: MapVehicle[] }) {
  const [active, setActive] = useState<string | null>(vehicles[0]?.id ?? null);
  const [zoom, setZoom] = useState(1);

  const bounds = useMemo(() => {
    if (vehicles.length === 0) return { minLat: 0, maxLat: 1, minLng: 0, maxLng: 1 };
    const lats = vehicles.map((v) => v.lat);
    const lngs = vehicles.map((v) => v.lng);
    const pad = 0.01;
    return {
      minLat: Math.min(...lats) - pad,
      maxLat: Math.max(...lats) + pad,
      minLng: Math.min(...lngs) - pad,
      maxLng: Math.max(...lngs) + pad,
    };
  }, [vehicles]);

  function position(lat: number, lng: number) {
    const x = ((lng - bounds.minLng) / (bounds.maxLng - bounds.minLng || 1)) * 100;
    const y = 100 - ((lat - bounds.minLat) / (bounds.maxLat - bounds.minLat || 1)) * 100;
    return { left: `${x}%`, top: `${y}%` };
  }

  const activeVehicle = vehicles.find((v) => v.id === active);

  return (
    <div className="relative h-full w-full overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-[#eef1f0]">
      <div
        className="absolute inset-0 transition-transform duration-300"
        style={{
          transform: `scale(${zoom})`,
          backgroundImage:
            "linear-gradient(#dfe4e2 1px, transparent 1px), linear-gradient(90deg, #dfe4e2 1px, transparent 1px)",
          backgroundSize: "34px 34px",
        }}
      />

      <div className="absolute left-3 right-3 top-3 flex items-center gap-2 rounded-full bg-white px-3.5 py-2 shadow-sm">
        <Search className="size-4 text-[var(--muted-2)]" />
        <span className="text-sm text-[var(--muted-2)]">Search address or vehicles…</span>
      </div>

      <div
        className="absolute inset-0 origin-center transition-transform duration-300"
        style={{ transform: `scale(${zoom})` }}
      >
        {vehicles.map((v) => (
          <button
            key={v.id}
            type="button"
            style={position(v.lat, v.lng)}
            onClick={() => setActive(v.id)}
            className={cn(
              "absolute -translate-x-1/2 -translate-y-1/2 flex items-center justify-center rounded-full border-2 border-white shadow-md transition-transform hover:scale-110",
              active === v.id ? "size-4 bg-[var(--primary)] z-10" : "size-2.5 bg-[var(--foreground)]/70"
            )}
          />
        ))}
      </div>

      {activeVehicle && (
        <Link
          href={`/vehicles/${activeVehicle.id}`}
          className="absolute bottom-4 left-4 right-4 sm:right-auto sm:w-64 rounded-[var(--radius-md)] bg-white p-3 shadow-lg hover:shadow-xl transition-shadow"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[var(--star)]">★ {activeVehicle.ratingAvg.toFixed(1)} ({activeVehicle.ratingCount})</span>
          </div>
          <p className="mt-1 text-sm font-semibold truncate">{activeVehicle.brand} {activeVehicle.model}</p>
          <div className="mt-2 flex items-center justify-between rounded-[var(--radius-sm)] bg-gray-900 px-3 py-1.5 text-white">
            <span className="text-xs font-medium">Book</span>
            <span className="text-xs font-semibold">{formatINR(activeVehicle.pricePerDay)}/day</span>
          </div>
        </Link>
      )}

      <div className="absolute bottom-4 right-4 flex flex-col gap-1.5">
        <button
          type="button"
          onClick={() => setZoom((z) => Math.min(2, z + 0.2))}
          className="flex size-9 items-center justify-center rounded-full bg-white shadow-sm hover:bg-gray-50"
        >
          <Plus className="size-4" />
        </button>
        <button
          type="button"
          onClick={() => setZoom((z) => Math.max(0.6, z - 0.2))}
          className="flex size-9 items-center justify-center rounded-full bg-white shadow-sm hover:bg-gray-50"
        >
          <Minus className="size-4" />
        </button>
        <button
          type="button"
          onClick={() => setZoom(1)}
          className="flex size-9 items-center justify-center rounded-full bg-white shadow-sm hover:bg-gray-50"
        >
          <LocateFixed className="size-4" />
        </button>
      </div>
    </div>
  );
}
