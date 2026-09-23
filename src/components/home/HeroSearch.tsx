"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Car, Bike, LocateFixed, Search, Loader2 } from "lucide-react";
import { cn, distanceKm as haversine, toDatetimeLocalValue } from "@/lib/utils";
import { CITIES } from "@/lib/constants";
import { Button } from "@/components/ui/Button";

type VType = "ALL" | "CAR" | "BIKE";

function nowLocal(offsetHours = 2) {
  const d = new Date(Date.now() + offsetHours * 3600000);
  d.setMinutes(Math.round(d.getMinutes() / 30) * 30, 0, 0);
  return toDatetimeLocalValue(d);
}

export function HeroSearch() {
  const router = useRouter();
  const [city, setCity] = useState<string>(CITIES[0].name);
  const [type, setType] = useState<VType>("ALL");
  const [pickup, setPickup] = useState(nowLocal(2));
  const [ret, setRet] = useState(nowLocal(26));
  const [locating, setLocating] = useState(false);

  function detectLocation() {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        let nearest: (typeof CITIES)[number] = CITIES[0];
        let best = Infinity;
        for (const c of CITIES) {
          const d = haversine(latitude, longitude, c.lat, c.lng);
          if (d < best) {
            best = d;
            nearest = c;
          }
        }
        setCity(nearest.name);
        setLocating(false);
      },
      () => setLocating(false),
      { timeout: 8000 }
    );
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    params.set("city", city);
    if (type !== "ALL") params.set("type", type);
    params.set("pickup", pickup);
    params.set("return", ret);
    router.push(`/explore?${params.toString()}`);
  }

  return (
    <form
      onSubmit={handleSearch}
      className="w-full max-w-4xl rounded-[var(--radius-xl)] border border-[var(--border)] bg-white p-2 shadow-xl shadow-black/5"
    >
      <div className="flex flex-wrap gap-1 border-b border-[var(--border)] p-1.5 sm:flex-nowrap">
        {(["ALL", "CAR", "BIKE"] as VType[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setType(t)}
            className={cn(
              "flex items-center gap-1.5 rounded-[var(--radius-sm)] px-3.5 py-2 text-sm font-medium transition-colors",
              type === t ? "bg-[var(--primary)] text-white" : "text-[var(--muted)] hover:bg-gray-100"
            )}
          >
            {t === "CAR" && <Car className="size-3.5" />}
            {t === "BIKE" && <Bike className="size-3.5" />}
            {t === "ALL" ? "All vehicles" : t === "CAR" ? "Cars" : "Bikes"}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-1.5 p-1.5 sm:grid-cols-[1.3fr_1fr_1fr_auto]">
        <div className="rounded-[var(--radius-md)] border border-transparent px-3.5 py-2.5 hover:border-[var(--border)] hover:bg-gray-50">
          <label className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-[var(--muted)]">
            <MapPin className="size-3" /> Pickup location
          </label>
          <div className="mt-1 flex items-center gap-2">
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full bg-transparent text-sm font-medium outline-none"
            >
              {CITIES.map((c) => (
                <option key={c.name} value={c.name}>
                  {c.name}, {c.state}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={detectLocation}
              title="Use current location"
              className="shrink-0 text-[var(--muted)] hover:text-[var(--foreground)]"
            >
              {locating ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <LocateFixed className="size-4" />
              )}
            </button>
          </div>
        </div>

        <div className="rounded-[var(--radius-md)] border border-transparent px-3.5 py-2.5 hover:border-[var(--border)] hover:bg-gray-50">
          <label className="text-[11px] font-semibold uppercase tracking-wide text-[var(--muted)]">
            Pickup
          </label>
          <input
            type="datetime-local"
            value={pickup}
            onChange={(e) => setPickup(e.target.value)}
            className="mt-1 w-full bg-transparent text-sm font-medium outline-none"
          />
        </div>

        <div className="rounded-[var(--radius-md)] border border-transparent px-3.5 py-2.5 hover:border-[var(--border)] hover:bg-gray-50">
          <label className="text-[11px] font-semibold uppercase tracking-wide text-[var(--muted)]">
            Return
          </label>
          <input
            type="datetime-local"
            value={ret}
            onChange={(e) => setRet(e.target.value)}
            className="mt-1 w-full bg-transparent text-sm font-medium outline-none"
          />
        </div>

        <div className="flex items-center p-1">
          <Button type="submit" size="lg" icon={<Search className="size-4" />} className="w-full sm:w-auto">
            Find Vehicles
          </Button>
        </div>
      </div>
    </form>
  );
}
