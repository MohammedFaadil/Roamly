import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/**
 * Formats a Date as the "YYYY-MM-DDTHH:mm" string an
 * `<input type="datetime-local">` expects for its `value` — using the
 * browser's LOCAL date/time fields (getFullYear/getMonth/.../getMinutes).
 *
 * `date.toISOString()` is the wrong tool for this despite looking similar:
 * it always renders in UTC. A datetime-local input's value is interpreted
 * as local wall-clock time, so feeding it a UTC-based string silently shifts
 * every date/time shown or defaulted in the UI by the user's UTC offset
 * (e.g. off by 5h30m for IST) — pickup/return pickers, "hours between them"
 * calculations, and anything else built from them all inherit that offset.
 */
export function toDatetimeLocalValue(date: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function distanceKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
