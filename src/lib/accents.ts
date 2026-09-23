// Shared icon-accent palette — used to color icon badges/circles across the
// public site (homepage, how-it-works, about, safety, list-vehicle, vehicle
// detail, policy pages) so the same rotation of colors reads consistently
// everywhere instead of every page inventing its own. Cycle through by index
// (`ACCENTS[i % ACCENTS.length]`) for a row/grid of icons.
export interface Accent {
  bg: string;
  text: string;
  solid: string;
}

export const ACCENTS: Accent[] = [
  { bg: "bg-blue-50", text: "text-blue-600", solid: "bg-blue-600" },
  { bg: "bg-violet-50", text: "text-violet-600", solid: "bg-violet-600" },
  { bg: "bg-amber-50", text: "text-amber-600", solid: "bg-amber-600" },
  { bg: "bg-emerald-50", text: "text-emerald-600", solid: "bg-emerald-600" },
  { bg: "bg-rose-50", text: "text-rose-600", solid: "bg-rose-600" },
  { bg: "bg-cyan-50", text: "text-cyan-600", solid: "bg-cyan-600" },
];

export function accentFor(index: number): Accent {
  return ACCENTS[index % ACCENTS.length];
}
