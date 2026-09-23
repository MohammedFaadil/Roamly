import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { VehicleWizard } from "./VehicleWizard";

export const dynamic = "force-dynamic";

export default async function NewVehiclePage() {
  const user = await getCurrentUser();
  if (!user) return null;

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">List your vehicle</h1>
      <p className="mt-1 text-sm text-[var(--muted)] mb-6">
        Add your vehicle&apos;s details, set your own pricing, and start receiving requests.
      </p>

      {user.identityVerified !== "VERIFIED" && (
        <div className="mb-6 flex items-start gap-3 rounded-[var(--radius-lg)] border border-[var(--warning)]/30 bg-[var(--warning-bg)] p-4">
          <ShieldAlert className="size-5 shrink-0 text-[var(--warning)]" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-[var(--foreground)]">Identity verification pending</p>
            <p className="mt-0.5 text-sm text-[var(--muted)]">
              You can publish a listing right away for testing — real production use would require
              identity verification first.{" "}
              <Link href="/dashboard/profile" className="font-medium underline hover:text-[var(--foreground)]">
                Complete verification
              </Link>
            </p>
          </div>
        </div>
      )}

      <VehicleWizard />
    </div>
  );
}
