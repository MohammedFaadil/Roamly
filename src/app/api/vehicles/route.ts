import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { vehicleCreateSchema } from "@/lib/validators";
import { apiOk, handleRoute, HttpError } from "@/lib/api";

export async function POST(req: NextRequest) {
  return handleRoute(async () => {
    const user = await getCurrentUser();
    if (!user) throw new HttpError("Please log in", 401);
    // Identity verification is intentionally NOT enforced here so the listing
    // flow can be tested end-to-end without going through the (demo) KYC
    // review step first. Re-add the check below before any real launch:
    //   if (user.identityVerified !== "VERIFIED") {
    //     throw new HttpError("Please complete identity verification before listing a vehicle", 403);
    //   }

    const body = await req.json();
    const parsed = vehicleCreateSchema.safeParse(body);
    if (!parsed.success) {
      throw new HttpError(parsed.error.issues[0]?.message ?? "Invalid input", 422);
    }
    const data = parsed.data;

    if (data.pricePerDay <= 0 || data.pricePerHour <= 0 || data.pricePerWeek <= 0) {
      throw new HttpError("Pricing must be greater than zero", 422);
    }

    const vehicle = await prisma.vehicle.create({
      data: {
        ownerId: user.id,
        type: data.type,
        category: data.category as never,
        brand: data.brand,
        model: data.model,
        variant: data.variant,
        year: data.year,
        color: data.color,
        fuelType: data.fuelType,
        transmission: data.transmission,
        seats: data.seats,
        engineCapacityCc: data.engineCapacityCc,
        registrationNo: data.registrationNo,
        odometerKm: data.odometerKm,
        description: data.description,
        features: JSON.stringify(data.features),
        pricePerHour: data.pricePerHour,
        pricePerDay: data.pricePerDay,
        pricePerWeek: data.pricePerWeek,
        securityDeposit: data.securityDeposit,
        includedKmPerDay: data.includedKmPerDay,
        extraKmCharge: data.extraKmCharge,
        minRentalHours: data.minRentalHours,
        maxRentalDays: data.maxRentalDays,
        city: data.city,
        area: data.area,
        address: data.address,
        lat: data.lat,
        lng: data.lng,
        status: "ACTIVE",
        verified: false,
        images: {
          create: data.images.map((url, i) => ({ url, sortOrder: i })),
        },
      },
    });

    return apiOk({ id: vehicle.id });
  });
}
