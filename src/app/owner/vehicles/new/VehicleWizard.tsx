"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Car, Bike, Upload, X, Sparkles, CheckCircle2, Circle } from "lucide-react";
import { Stepper } from "@/components/ui/Stepper";
import { Button } from "@/components/ui/Button";
import { Input, Textarea, Select } from "@/components/ui/Field";
import { useToast } from "@/components/ui/Toast";
import { VehicleThumb } from "@/components/vehicle/VehicleThumb";
import { recommendPrice } from "@/lib/pricing";
import { formatINR } from "@/lib/format";
import { cn } from "@/lib/utils";
import {
  CAR_CATEGORIES,
  BIKE_CATEGORIES,
  FUEL_TYPES,
  TRANSMISSIONS,
  CAR_FEATURES,
  BIKE_FEATURES,
  CAR_BRANDS,
  BIKE_BRANDS,
  CITIES,
} from "@/lib/constants";

const STEPS = ["Type & Basics", "Location", "Photos & Description", "Pricing", "Review"];

interface FormState {
  type: "CAR" | "BIKE";
  category: string;
  brand: string;
  model: string;
  variant: string;
  year: number;
  color: string;
  fuelType: string;
  transmission: string;
  seats: number;
  engineCapacityCc: number;
  registrationNo: string;
  odometerKm: number;
  city: string;
  area: string;
  address: string;
  images: string[];
  description: string;
  features: string[];
  pricePerHour: number;
  pricePerDay: number;
  pricePerWeek: number;
  securityDeposit: number;
  includedKmPerDay: number;
  extraKmCharge: number;
  minRentalHours: number;
  maxRentalDays: number;
}

const INITIAL: FormState = {
  type: "CAR",
  category: "SEDAN",
  brand: "",
  model: "",
  variant: "",
  year: new Date().getFullYear(),
  color: "",
  fuelType: "PETROL",
  transmission: "MANUAL",
  seats: 5,
  engineCapacityCc: 1200,
  registrationNo: "",
  odometerKm: 0,
  city: CITIES[0].name,
  area: "",
  address: "",
  images: [],
  description: "",
  features: [],
  pricePerHour: 200,
  pricePerDay: 1500,
  pricePerWeek: 8500,
  securityDeposit: 3000,
  includedKmPerDay: 150,
  extraKmCharge: 10,
  minRentalHours: 4,
  maxRentalDays: 30,
};

export function VehicleWizard() {
  const router = useRouter();
  const { show } = useToast();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(INITIAL);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  const categoryOptions = form.type === "CAR" ? CAR_CATEGORIES : BIKE_CATEGORIES;
  const brandSuggestions = form.type === "CAR" ? CAR_BRANDS : BIKE_BRANDS;
  const featureOptions = form.type === "CAR" ? CAR_FEATURES : BIKE_FEATURES;

  const recommendation = useMemo(
    () =>
      recommendPrice({
        category: form.category,
        fuelType: form.fuelType,
        transmission: form.transmission,
        year: form.year,
        city: form.city,
      }),
    [form.category, form.fuelType, form.transmission, form.year, form.city]
  );

  function applyRecommendation() {
    update("pricePerDay", recommendation.recommendedDaily);
    update("pricePerHour", recommendation.recommendedHourly);
    update("pricePerWeek", recommendation.recommendedWeekly);
    show("Applied recommended pricing", "info");
  }

  async function handleUpload(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      for (const file of Array.from(files).slice(0, 8 - form.images.length)) {
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch("/api/upload", { method: "POST", body: fd });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setForm((f) => ({ ...f, images: [...f.images, data.url] }));
      }
    } catch (e) {
      show(e instanceof Error ? e.message : "Upload failed", "error");
    } finally {
      setUploading(false);
    }
  }

  const stepValidity = [
    !!form.brand && !!form.model && !!form.registrationNo && form.year > 1990,
    !!form.city,
    true, // photos optional
    form.pricePerDay > 0 && form.pricePerHour > 0 && form.pricePerWeek > 0,
    true,
  ];

  const completeness = Math.round(
    ([
      !!form.brand,
      !!form.model,
      !!form.registrationNo,
      form.images.length >= 3,
      !!form.description,
      form.features.length > 0,
      form.pricePerDay > 0,
      !!form.city,
      !!form.area,
    ].filter(Boolean).length /
      9) *
      100
  );

  async function submit() {
    setSubmitting(true);
    setError("");
    const cityMeta = CITIES.find((c) => c.name === form.city) ?? CITIES[0];
    try {
      const res = await fetch("/api/vehicles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          lat: cityMeta.lat + (Math.random() - 0.5) * 0.05,
          lng: cityMeta.lng + (Math.random() - 0.5) * 0.05,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      show("Vehicle listed successfully!");
      router.push(`/owner/vehicles/${data.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-white p-5 mb-6">
        <Stepper steps={STEPS} current={step} />
      </div>

      <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-white p-6">
        {step === 0 && (
          <div className="space-y-5">
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">Vehicle type</label>
              <div className="flex gap-3">
                {(["CAR", "BIKE"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => {
                      update("type", t);
                      update("category", t === "CAR" ? "SEDAN" : "SCOOTER");
                      update("transmission", t === "CAR" ? "MANUAL" : "MANUAL");
                    }}
                    className={cn(
                      "flex flex-1 items-center justify-center gap-2 rounded-[var(--radius-md)] border-2 py-4 text-sm font-medium transition-colors",
                      form.type === t ? "border-[var(--primary)] bg-gray-50" : "border-[var(--border)]"
                    )}
                  >
                    {t === "CAR" ? <Car className="size-4" /> : <Bike className="size-4" />}
                    {t === "CAR" ? "Car" : "Bike"}
                  </button>
                ))}
              </div>
            </div>

            <FieldGrid>
              <Field label="Category">
                <Select value={form.category} onChange={(e) => update("category", e.target.value)}>
                  {categoryOptions.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Brand">
                <Input list="brand-suggestions" value={form.brand} onChange={(e) => update("brand", e.target.value)} placeholder="e.g. Hyundai" />
                <datalist id="brand-suggestions">
                  {brandSuggestions.map((b) => <option key={b} value={b} />)}
                </datalist>
              </Field>
              <Field label="Model">
                <Input value={form.model} onChange={(e) => update("model", e.target.value)} placeholder="e.g. Creta" />
              </Field>
              <Field label="Variant (optional)">
                <Input value={form.variant} onChange={(e) => update("variant", e.target.value)} placeholder="e.g. SX Automatic" />
              </Field>
              <Field label="Manufacturing year">
                <Input type="number" value={form.year} onChange={(e) => update("year", Number(e.target.value))} min={1990} max={new Date().getFullYear() + 1} />
              </Field>
              <Field label="Color">
                <Input value={form.color} onChange={(e) => update("color", e.target.value)} placeholder="e.g. White" />
              </Field>
              <Field label="Fuel type">
                <Select value={form.fuelType} onChange={(e) => update("fuelType", e.target.value)}>
                  {FUEL_TYPES.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
                </Select>
              </Field>
              {form.type === "CAR" && (
                <Field label="Transmission">
                  <Select value={form.transmission} onChange={(e) => update("transmission", e.target.value)}>
                    {TRANSMISSIONS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </Select>
                </Field>
              )}
              {form.type === "CAR" ? (
                <Field label="Seating capacity">
                  <Input type="number" value={form.seats} onChange={(e) => update("seats", Number(e.target.value))} min={1} max={10} />
                </Field>
              ) : (
                <Field label="Engine capacity (cc)">
                  <Input type="number" value={form.engineCapacityCc} onChange={(e) => update("engineCapacityCc", Number(e.target.value))} min={0} />
                </Field>
              )}
              <Field label="Registration number">
                <Input value={form.registrationNo} onChange={(e) => update("registrationNo", e.target.value.toUpperCase())} placeholder="e.g. TN22AB1234" />
              </Field>
              <Field label="Current odometer (km)">
                <Input type="number" value={form.odometerKm} onChange={(e) => update("odometerKm", Number(e.target.value))} min={0} />
              </Field>
            </FieldGrid>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-5 max-w-md">
            <Field label="City">
              <Select value={form.city} onChange={(e) => update("city", e.target.value)}>
                {CITIES.map((c) => <option key={c.name} value={c.name}>{c.name}, {c.state}</option>)}
              </Select>
            </Field>
            <Field label="Area / neighborhood">
              <Input value={form.area} onChange={(e) => update("area", e.target.value)} placeholder="e.g. Anna Nagar" />
            </Field>
            <Field label="Pickup address">
              <Textarea rows={3} value={form.address} onChange={(e) => update("address", e.target.value)} placeholder="Street address for pickup — only shown to renters after a booking is confirmed" />
            </Field>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                Photos ({form.images.length}/8)
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {form.images.map((url, i) => (
                  <div key={url} className="relative h-24 overflow-hidden rounded-[var(--radius-sm)] border border-[var(--border)]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt="" className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => update("images", form.images.filter((_, idx) => idx !== i))}
                      className="absolute top-1 right-1 flex size-5 items-center justify-center rounded-full bg-black/60 text-white"
                    >
                      <X className="size-3" />
                    </button>
                  </div>
                ))}
                {form.images.length < 8 && (
                  <label className="flex h-24 cursor-pointer flex-col items-center justify-center gap-1 rounded-[var(--radius-sm)] border border-dashed border-[var(--border-strong)] text-xs text-[var(--muted)] hover:bg-gray-50">
                    <Upload className="size-4" />
                    {uploading ? "Uploading..." : "Add photo"}
                    <input type="file" accept="image/*" multiple hidden onChange={(e) => handleUpload(e.target.files)} disabled={uploading} />
                  </label>
                )}
              </div>
              {form.images.length === 0 && (
                <p className="mt-2 text-xs text-[var(--muted-2)]">
                  No photos yet — a placeholder graphic will be shown to renters until you add real photos.
                </p>
              )}
            </div>

            <Field label="Description">
              <Textarea rows={4} value={form.description} onChange={(e) => update("description", e.target.value)} placeholder="Describe the vehicle's condition, ideal use cases, and anything renters should know." />
            </Field>

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">Features</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {featureOptions.map((f) => (
                  <label key={f} className="flex items-center gap-2 rounded-[var(--radius-sm)] border border-[var(--border)] px-3 py-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.features.includes(f)}
                      onChange={() =>
                        update("features", form.features.includes(f) ? form.features.filter((x) => x !== f) : [...form.features, f])
                      }
                    />
                    {f}
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div className="rounded-[var(--radius-lg)] border border-blue-200 bg-blue-50 p-5">
              <div className="flex items-center gap-1.5 text-sm font-semibold text-blue-900">
                <Sparkles className="size-4" /> AI-assisted recommended pricing
              </div>
              <p className="mt-1 text-sm text-blue-800/80">{recommendation.explanation}</p>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-blue-900">{formatINR(recommendation.recommendedDaily)}</span>
                <span className="text-sm text-blue-800/70">/day recommended</span>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {recommendation.factors.map((f) => (
                  <span key={f.label} className="rounded-full bg-white px-2.5 py-1 text-xs text-blue-900">
                    {f.label} {f.impact}
                  </span>
                ))}
              </div>
              <Button size="sm" variant="secondary" className="mt-3" onClick={applyRecommendation}>
                Use recommended pricing
              </Button>
            </div>

            <FieldGrid>
              <Field label="Price per hour (₹)">
                <Input type="number" value={form.pricePerHour} onChange={(e) => update("pricePerHour", Number(e.target.value))} min={0} />
              </Field>
              <Field label="Price per day (₹)">
                <Input type="number" value={form.pricePerDay} onChange={(e) => update("pricePerDay", Number(e.target.value))} min={0} />
              </Field>
              <Field label="Price per week (₹)">
                <Input type="number" value={form.pricePerWeek} onChange={(e) => update("pricePerWeek", Number(e.target.value))} min={0} />
              </Field>
              <Field label="Security deposit (₹)">
                <Input type="number" value={form.securityDeposit} onChange={(e) => update("securityDeposit", Number(e.target.value))} min={0} />
              </Field>
              <Field label="Included km / day">
                <Input type="number" value={form.includedKmPerDay} onChange={(e) => update("includedKmPerDay", Number(e.target.value))} min={0} />
              </Field>
              <Field label="Extra km charge (₹/km)">
                <Input type="number" value={form.extraKmCharge} onChange={(e) => update("extraKmCharge", Number(e.target.value))} min={0} />
              </Field>
              <Field label="Minimum rental (hours)">
                <Input type="number" value={form.minRentalHours} onChange={(e) => update("minRentalHours", Number(e.target.value))} min={1} />
              </Field>
              <Field label="Maximum rental (days)">
                <Input type="number" value={form.maxRentalDays} onChange={(e) => update("maxRentalDays", Number(e.target.value))} min={1} />
              </Field>
            </FieldGrid>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold mb-3">Listing completeness: {completeness}%</h3>
              <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                <div className="h-full rounded-full bg-[var(--primary)] transition-all" style={{ width: `${completeness}%` }} />
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                <ChecklistItem done={!!form.brand && !!form.model}>Vehicle details</ChecklistItem>
                <ChecklistItem done={form.images.length >= 3}>5+ photos (have {form.images.length})</ChecklistItem>
                <ChecklistItem done={!!form.description}>Description</ChecklistItem>
                <ChecklistItem done={form.pricePerDay > 0}>Pricing</ChecklistItem>
                <ChecklistItem done={!!form.city && !!form.area}>Pickup location</ChecklistItem>
                <ChecklistItem done={form.features.length > 0}>Features</ChecklistItem>
              </div>
            </div>

            <div className="rounded-[var(--radius-lg)] border border-[var(--border)] p-5">
              <div className="flex gap-4">
                <VehicleThumb type={form.type} brand={form.brand || "Vehicle"} model={form.model} seed="preview" imageUrl={form.images[0]} className="h-24 w-32 rounded-[var(--radius-sm)] shrink-0" iconClassName="size-9" />
                <div>
                  <p className="font-semibold">{form.year} {form.brand} {form.model}</p>
                  <p className="text-sm text-[var(--muted)]">{form.area ? `${form.area}, ` : ""}{form.city}</p>
                  <p className="mt-1 text-sm font-bold">{formatINR(form.pricePerDay)}<span className="font-normal text-[var(--muted)]">/day</span></p>
                </div>
              </div>
            </div>

            {error && <p className="text-sm text-[var(--danger)]">{error}</p>}

            <Button onClick={submit} loading={submitting} size="lg" fullWidth>
              Publish listing
            </Button>
          </div>
        )}
      </div>

      <div className="mt-5 flex justify-between">
        <Button variant="secondary" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>
          Back
        </Button>
        {step < STEPS.length - 1 && (
          <Button onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))} disabled={!stepValidity[step]}>
            Continue
          </Button>
        )}
      </div>
    </div>
  );
}

function FieldGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{children}</div>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">{label}</label>
      {children}
    </div>
  );
}

function ChecklistItem({ done, children }: { done: boolean; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      {done ? <CheckCircle2 className="size-4 text-[var(--success)]" /> : <Circle className="size-4 text-[var(--muted-2)]" />}
      <span className={done ? "" : "text-[var(--muted)]"}>{children}</span>
    </div>
  );
}
