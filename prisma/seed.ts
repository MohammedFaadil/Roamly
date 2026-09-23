import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { VEHICLE_IMAGES } from "./vehicle-images";

const prisma = new PrismaClient();

const DEMO_PASSWORD = "Password123";

const CITIES = [
  { name: "Chennai", state: "Tamil Nadu", lat: 13.0827, lng: 80.2707 },
  { name: "Bengaluru", state: "Karnataka", lat: 12.9716, lng: 77.5946 },
  { name: "Mumbai", state: "Maharashtra", lat: 19.076, lng: 72.8777 },
  { name: "Delhi", state: "Delhi", lat: 28.7041, lng: 77.1025 },
  { name: "Hyderabad", state: "Telangana", lat: 17.385, lng: 78.4867 },
  { name: "Pune", state: "Maharashtra", lat: 18.5204, lng: 73.8567 },
];

function jitter(v: number, amount = 0.06) {
  return v + (Math.random() - 0.5) * amount;
}

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const OWNER_NAMES = [
  "Arjun Mehta",
  "Priya Nair",
  "Rohit Sharma",
  "Ananya Iyer",
  "Vikram Reddy",
  "Sneha Kulkarni",
  "Karthik Rajan",
  "Divya Menon",
];

const RENTER_NAMES = [
  "Aditya Rao",
  "Meera Pillai",
  "Sahil Kapoor",
  "Ishita Bose",
  "Nikhil Verma",
  "Kavya Krishnan",
];

const CAR_CATALOG = [
  { brand: "Maruti Suzuki", model: "Swift", category: "HATCHBACK", seats: 5, engine: 1197 },
  { brand: "Maruti Suzuki", model: "Baleno", category: "HATCHBACK", seats: 5, engine: 1197 },
  { brand: "Hyundai", model: "i20", category: "HATCHBACK", seats: 5, engine: 1197 },
  { brand: "Hyundai", model: "Verna", category: "SEDAN", seats: 5, engine: 1497 },
  { brand: "Honda", model: "City", category: "SEDAN", seats: 5, engine: 1498 },
  { brand: "Skoda", model: "Slavia", category: "SEDAN", seats: 5, engine: 1498 },
  { brand: "Hyundai", model: "Creta", category: "SUV", seats: 5, engine: 1497 },
  { brand: "Tata", model: "Nexon", category: "SUV", seats: 5, engine: 1199 },
  { brand: "Mahindra", model: "Thar", category: "SUV", seats: 4, engine: 2184 },
  { brand: "Kia", model: "Seltos", category: "SUV", seats: 5, engine: 1497 },
  { brand: "Toyota", model: "Innova Crysta", category: "MUV", seats: 7, engine: 2393 },
  { brand: "Mahindra", model: "Marazzo", category: "MUV", seats: 7, engine: 1497 },
  { brand: "MG", model: "Hector", category: "SUV", seats: 5, engine: 1451 },
  { brand: "Toyota", model: "Fortuner", category: "LUXURY", seats: 7, engine: 2755 },
  { brand: "Tata", model: "Nexon EV", category: "ELECTRIC_CAR", seats: 5, engine: 0 },
  { brand: "MG", model: "ZS EV", category: "ELECTRIC_CAR", seats: 5, engine: 0 },
];

const BIKE_CATALOG = [
  { brand: "Honda", model: "Activa 6G", category: "SCOOTER", cc: 110 },
  { brand: "TVS", model: "Jupiter", category: "SCOOTER", cc: 110 },
  { brand: "Bajaj", model: "Pulsar NS200", category: "SPORTS_BIKE", cc: 199 },
  { brand: "Yamaha", model: "R15 V4", category: "SPORTS_BIKE", cc: 155 },
  { brand: "Royal Enfield", model: "Classic 350", category: "CRUISER_BIKE", cc: 349 },
  { brand: "Royal Enfield", model: "Himalayan", category: "ADVENTURE_BIKE", cc: 411 },
  { brand: "Honda", model: "Shine", category: "COMMUTER_BIKE", cc: 125 },
  { brand: "TVS", model: "Ntorq 125", category: "SCOOTER", cc: 125 },
  { brand: "KTM", model: "Duke 200", category: "SPORTS_BIKE", cc: 199 },
  { brand: "Ather", model: "450X", category: "ELECTRIC_BIKE", cc: 0 },
  { brand: "Ola Electric", model: "S1 Pro", category: "ELECTRIC_BIKE", cc: 0 },
  { brand: "Suzuki", model: "Access 125", category: "SCOOTER", cc: 125 },
];


const CAR_FEATURES = [
  "Air Conditioning",
  "Bluetooth",
  "GPS Navigation",
  "USB Charging",
  "Android Auto",
  "Apple CarPlay",
  "Reverse Camera",
  "Sunroof",
  "Music System",
  "Cruise Control",
];
const BIKE_FEATURES = [
  "Helmet Included",
  "USB Charging",
  "Under-seat Storage",
  "Digital Console",
  "Anti-lock Braking",
  "Bluetooth Connectivity",
];

const CATEGORY_BASE_DAILY: Record<string, number> = {
  HATCHBACK: 1400,
  SEDAN: 1800,
  SUV: 2400,
  MUV: 2600,
  LUXURY: 5500,
  ELECTRIC_CAR: 2200,
  SCOOTER: 350,
  COMMUTER_BIKE: 400,
  SPORTS_BIKE: 900,
  CRUISER_BIKE: 1100,
  ADVENTURE_BIKE: 1300,
  ELECTRIC_BIKE: 450,
};

async function main() {
  console.log("Clearing existing data...");
  await prisma.$transaction([
    prisma.message.deleteMany(),
    prisma.conversation.deleteMany(),
    prisma.notification.deleteMany(),
    prisma.review.deleteMany(),
    prisma.damageClaim.deleteMany(),
    prisma.dispute.deleteMany(),
    prisma.payment.deleteMany(),
    prisma.returnInspection.deleteMany(),
    prisma.handoverInspection.deleteMany(),
    prisma.rentalAgreement.deleteMany(),
    prisma.booking.deleteMany(),
    prisma.favorite.deleteMany(),
    prisma.maintenanceLog.deleteMany(),
    prisma.availabilityBlock.deleteMany(),
    prisma.vehicleDocument.deleteMany(),
    prisma.vehicleImage.deleteMany(),
    prisma.vehicle.deleteMany(),
    prisma.document.deleteMany(),
    prisma.supportTicket.deleteMany(),
    prisma.payout.deleteMany(),
    prisma.platformSetting.deleteMany(),
    prisma.user.deleteMany(),
  ]);

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  console.log("Creating users...");
  const admin = await prisma.user.create({
    data: {
      name: "Roamly Admin",
      email: "admin@roamly.in",
      phone: "9000000001",
      passwordHash,
      role: "ADMIN",
      city: "Chennai",
      emailVerified: true,
      phoneVerified: true,
      identityVerified: "VERIFIED",
      licenceVerified: "VERIFIED",
      trustScore: 95,
    },
  });

  const owners: Awaited<ReturnType<typeof prisma.user.create>>[] = [];
  for (let i = 0; i < OWNER_NAMES.length; i++) {
    const city = CITIES[i % CITIES.length];
    const owner = await prisma.user.create({
      data: {
        name: OWNER_NAMES[i],
        email: `owner${i + 1}@roamly.in`,
        phone: `90000000${10 + i}`,
        passwordHash,
        role: "USER",
        city: city.name,
        bio: `Vehicle owner based in ${city.name}. Renting out my vehicles when I'm not using them.`,
        emailVerified: true,
        phoneVerified: true,
        identityVerified: "VERIFIED",
        licenceVerified: "VERIFIED",
        trustScore: randInt(70, 98),
        createdAt: new Date(Date.now() - randInt(60, 400) * 86400000),
      },
    });
    owners.push(owner);
  }

  const renters = [];
  for (let i = 0; i < RENTER_NAMES.length; i++) {
    const city = CITIES[i % CITIES.length];
    const renter = await prisma.user.create({
      data: {
        name: RENTER_NAMES[i],
        email: `renter${i + 1}@roamly.in`,
        phone: `90000001${10 + i}`,
        passwordHash,
        role: "USER",
        city: city.name,
        emailVerified: true,
        phoneVerified: true,
        identityVerified: i % 3 === 0 ? "PENDING" : "VERIFIED",
        licenceVerified: i % 3 === 0 ? "PENDING" : "VERIFIED",
        trustScore: randInt(55, 90),
        createdAt: new Date(Date.now() - randInt(10, 200) * 86400000),
      },
    });
    renters.push(renter);
  }

  // Demo account that can act as both — the primary account for trying the whole product
  const demoUser = await prisma.user.create({
    data: {
      name: "Demo User",
      email: "demo@roamly.in",
      phone: "9999999999",
      passwordHash,
      role: "USER",
      city: "Chennai",
      bio: "Demo account — list vehicles as an owner, and book vehicles as a renter, all from one account.",
      emailVerified: true,
      phoneVerified: true,
      identityVerified: "VERIFIED",
      licenceVerified: "VERIFIED",
      trustScore: 88,
    },
  });

  console.log("Creating vehicles...");
  const vehicles: Awaited<ReturnType<typeof prisma.vehicle.create>>[] = [];

  async function createVehicle(opts: {
    owner: (typeof owners)[number];
    type: "CAR" | "BIKE";
    catalogItem: { brand: string; model: string; category: string; seats?: number; engine?: number; cc?: number };
    city: (typeof CITIES)[number];
  }) {
    const { owner, type, catalogItem, city } = opts;
    const year = randInt(2018, 2024);
    const base = CATEGORY_BASE_DAILY[catalogItem.category] ?? 1500;
    const ageFactor = Math.max(0.75, 1 - (2025 - year) * 0.03);
    const pricePerDay = Math.round((base * ageFactor) / 10) * 10;
    const pricePerHour = Math.round(pricePerDay / 7);
    const pricePerWeek = Math.round((pricePerDay * 5.8) / 10) * 10;
    const fuelType =
      catalogItem.category === "ELECTRIC_CAR" || catalogItem.category === "ELECTRIC_BIKE"
        ? "ELECTRIC"
        : type === "CAR"
        ? pick(["PETROL", "PETROL", "DIESEL", "CNG"] as const)
        : "PETROL";
    const transmission =
      type === "CAR" ? pick(["MANUAL", "AUTOMATIC", "AUTOMATIC"] as const) : "MANUAL";
    const featurePool = type === "CAR" ? CAR_FEATURES : BIKE_FEATURES;
    const features = featurePool.filter(() => Math.random() > 0.45);
    const ratingAvg = Math.round((3.8 + Math.random() * 1.2) * 10) / 10;
    const ratingCount = randInt(8, 320);

    const vehicle = await prisma.vehicle.create({
      data: {
        ownerId: owner.id,
        type,
        category: catalogItem.category as never,
        brand: catalogItem.brand,
        model: catalogItem.model,
        variant: type === "CAR" ? pick(["Base", "Mid", "Top", "Sport"]) : undefined,
        year,
        color: pick(["White", "Silver", "Black", "Red", "Blue", "Grey"]),
        fuelType: fuelType as never,
        transmission: transmission as never,
        seats: type === "CAR" ? catalogItem.seats : undefined,
        engineCapacityCc: type === "CAR" ? catalogItem.engine : catalogItem.cc,
        registrationNo: `${city.state.slice(0, 2).toUpperCase()}${randInt(10, 99)} ${pick(["AB", "BC", "CD", "DE"])} ${randInt(1000, 9999)}`,
        odometerKm: randInt(2000, 45000),
        description: `Well-maintained ${catalogItem.brand} ${catalogItem.model}, regularly serviced and available for flexible hourly, daily, and weekly rentals in ${city.name}. Fuel-efficient and comfortable for city drives and highway trips alike.`,
        features: JSON.stringify(features),
        pricePerHour,
        pricePerDay,
        pricePerWeek,
        securityDeposit: type === "CAR" ? randInt(2, 6) * 1000 : randInt(1, 3) * 1000,
        includedKmPerDay: type === "CAR" ? 150 : 100,
        extraKmCharge: type === "CAR" ? randInt(8, 14) : randInt(3, 6),
        minRentalHours: type === "CAR" ? 4 : 2,
        maxRentalDays: 30,
        lateFeePerHour: type === "CAR" ? randInt(80, 150) : randInt(30, 60),
        city: city.name,
        area: pick(["Anna Nagar", "Koramangala", "Andheri West", "Hitech City", "Kothrud", "Whitefield", "Indiranagar", "Powai"]),
        address: `${randInt(1, 400)}, Main Road`,
        lat: jitter(city.lat),
        lng: jitter(city.lng),
        status: "ACTIVE",
        verified: Math.random() > 0.2,
        ratingAvg,
        ratingCount,
        totalRentals: randInt(3, 90),
      },
    });

    const imageUrl = VEHICLE_IMAGES[`${catalogItem.brand}|${catalogItem.model}`];
    if (imageUrl) {
      await prisma.vehicleImage.create({
        data: { vehicleId: vehicle.id, url: imageUrl, label: "Exterior", sortOrder: 0 },
      });
    }

    await prisma.vehicleDocument.createMany({
      data: [
        { vehicleId: vehicle.id, type: "REGISTRATION_CERTIFICATE", fileUrl: "/demo/rc.pdf", status: "VERIFIED" },
        { vehicleId: vehicle.id, type: "INSURANCE", fileUrl: "/demo/insurance.pdf", status: "VERIFIED" },
        { vehicleId: vehicle.id, type: "POLLUTION_CERTIFICATE", fileUrl: "/demo/puc.pdf", status: "VERIFIED", expiresAt: new Date(Date.now() + 90 * 86400000) },
      ],
    });

    vehicles.push(vehicle);
    return vehicle;
  }

  for (const city of CITIES) {
    for (let i = 0; i < 4; i++) {
      await createVehicle({
        owner: pick(owners),
        type: "CAR",
        catalogItem: pick(CAR_CATALOG),
        city,
      });
    }
    for (let i = 0; i < 3; i++) {
      await createVehicle({
        owner: pick(owners),
        type: "BIKE",
        catalogItem: pick(BIKE_CATALOG),
        city,
      });
    }
  }

  // A handful of vehicles owned by the demo user in Chennai, so the owner dashboard has content
  await createVehicle({ owner: demoUser, type: "CAR", catalogItem: CAR_CATALOG[6], city: CITIES[0] });
  await createVehicle({ owner: demoUser, type: "CAR", catalogItem: CAR_CATALOG[13], city: CITIES[0] });
  await createVehicle({ owner: demoUser, type: "BIKE", catalogItem: BIKE_CATALOG[4], city: CITIES[0] });

  console.log(`Created ${vehicles.length} vehicles.`);

  console.log("Creating sample bookings, reviews, notifications...");

  async function makeBooking(opts: {
    vehicle: (typeof vehicles)[number];
    renter: { id: string };
    status: string;
    daysAgoStart: number;
    durationDays: number;
  }) {
    const { vehicle, renter, status, daysAgoStart, durationDays } = opts;
    const startAt = new Date(Date.now() - daysAgoStart * 86400000);
    const endAt = new Date(startAt.getTime() + durationDays * 86400000);
    const baseFare = Math.round(vehicle.pricePerDay * durationDays);
    const platformFee = Math.round(baseFare * 0.08);
    const taxes = Math.round(platformFee * 0.18);

    const booking = await prisma.booking.create({
      data: {
        vehicleId: vehicle.id,
        renterId: renter.id,
        startAt,
        endAt,
        rentalUnit: "DAY",
        baseFare,
        platformFee,
        taxes,
        securityDeposit: vehicle.securityDeposit,
        totalPayable: baseFare + platformFee + taxes + vehicle.securityDeposit,
        includedKm: vehicle.includedKmPerDay * durationDays,
        extraKmCharge: vehicle.extraKmCharge,
        status: status as never,
        createdAt: new Date(startAt.getTime() - 2 * 86400000),
      },
    });

    if (["CONFIRMED", "HANDOVER_PENDING", "ACTIVE", "RETURN_PENDING", "COMPLETED"].includes(status)) {
      await prisma.payment.create({
        data: {
          bookingId: booking.id,
          type: "RENTAL",
          amount: baseFare + platformFee + taxes,
          status: "SUCCESS",
          method: "Demo UPI",
        },
      });
      await prisma.payment.create({
        data: {
          bookingId: booking.id,
          type: "DEPOSIT",
          amount: vehicle.securityDeposit,
          status: "SUCCESS",
          method: "Demo Wallet",
        },
      });
      await prisma.rentalAgreement.create({
        data: {
          bookingId: booking.id,
          termsSnapshot: JSON.stringify({
            includedKmPerDay: vehicle.includedKmPerDay,
            extraKmCharge: vehicle.extraKmCharge,
            fuelPolicy: vehicle.fuelPolicy,
            lateFeePerHour: vehicle.lateFeePerHour,
            securityDeposit: vehicle.securityDeposit,
          }),
          renterSignedAt: new Date(startAt.getTime() - 1 * 86400000),
          ownerSignedAt: new Date(startAt.getTime() - 1 * 86400000),
        },
      });
    }

    if (["ACTIVE", "RETURN_PENDING", "COMPLETED"].includes(status)) {
      await prisma.handoverInspection.create({
        data: {
          bookingId: booking.id,
          odometerKm: vehicle.odometerKm,
          fuelLevelPct: 90,
          photos: JSON.stringify([]),
          ownerConfirmed: true,
          renterConfirmed: true,
          confirmedAt: startAt,
        },
      });
    }

    if (status === "COMPLETED") {
      const extraKmUsed = Math.random() > 0.7 ? randInt(5, 40) : 0;
      const extraKmFee = extraKmUsed * vehicle.extraKmCharge;
      await prisma.returnInspection.create({
        data: {
          bookingId: booking.id,
          odometerKm: vehicle.odometerKm + randInt(50, 300),
          fuelLevelPct: 85,
          photos: JSON.stringify([]),
          extraKmUsed,
          extraKmFee,
          lateHours: 0,
          lateFee: 0,
          ownerConfirmed: true,
          renterConfirmed: true,
          confirmedAt: endAt,
        },
      });

      await prisma.review.create({
        data: {
          bookingId: booking.id,
          authorId: renter.id,
          targetUserId: vehicle.ownerId,
          vehicleId: vehicle.id,
          type: "RENTER_TO_OWNER",
          rating: randInt(4, 5),
          comment: pick([
            "Great vehicle, exactly as described. Smooth pickup and drop-off.",
            "Clean and well maintained. Owner was very responsive.",
            "Good experience overall, would rent again.",
            "Vehicle was in excellent condition, minor delay at pickup.",
          ]),
          createdAt: new Date(endAt.getTime() + 3600000),
        },
      });
    }

    return booking;
  }

  const activeVehicles = vehicles.slice(0, 10);
  for (const vehicle of activeVehicles) {
    await makeBooking({
      vehicle,
      renter: pick(renters),
      status: "COMPLETED",
      daysAgoStart: randInt(20, 180),
      durationDays: randInt(1, 5),
    });
  }

  // A rich set of bookings for the demo user's own vehicles + as a renter
  const demoOwnedVehicles = vehicles.filter((v) => v.ownerId === demoUser.id);
  if (demoOwnedVehicles.length >= 3) {
    await makeBooking({ vehicle: demoOwnedVehicles[0], renter: renters[0], status: "REQUESTED", daysAgoStart: -2, durationDays: 2 });
    await makeBooking({ vehicle: demoOwnedVehicles[1], renter: renters[1], status: "ACTIVE", daysAgoStart: 0, durationDays: 3 });
    await makeBooking({ vehicle: demoOwnedVehicles[2], renter: renters[2], status: "COMPLETED", daysAgoStart: 15, durationDays: 2 });
  }

  const bookableForDemo = vehicles.find((v) => v.ownerId !== demoUser.id)!;
  await makeBooking({ vehicle: bookableForDemo, renter: demoUser, status: "COMPLETED", daysAgoStart: 30, durationDays: 3 });
  const bookableForDemo2 = vehicles.filter((v) => v.ownerId !== demoUser.id)[3];
  await makeBooking({ vehicle: bookableForDemo2, renter: demoUser, status: "CONFIRMED", daysAgoStart: -5, durationDays: 4 });

  console.log("Creating notifications...");
  await prisma.notification.createMany({
    data: [
      {
        userId: demoUser.id,
        type: "BOOKING_REQUEST",
        title: "New booking request",
        body: "You have a new rental request awaiting your approval.",
        link: "/owner/bookings",
      },
      {
        userId: demoUser.id,
        type: "RENTAL_STARTING",
        title: "Rental starting soon",
        body: "Your upcoming rental starts within 24 hours. Review the pickup details.",
        link: "/dashboard/bookings",
      },
      {
        userId: demoUser.id,
        type: "REVIEW_REQUEST",
        title: "How was your rental?",
        body: "Your recent rental is complete. Share your experience with a quick review.",
        link: "/dashboard/bookings",
      },
    ],
  });

  console.log("Creating platform settings...");
  await prisma.platformSetting.createMany({
    data: [
      { key: "platform_commission_rate", value: "8" },
      { key: "min_rental_hours", value: "2" },
      { key: "max_rental_days", value: "30" },
      { key: "damage_claim_window_hours", value: "24" },
      { key: "cancellation_free_window_hours", value: "6" },
      { key: "kyc_required_documents", value: JSON.stringify(["AADHAAR", "DRIVING_LICENCE"]) },
    ],
  });

  console.log("Seed complete.");
  console.log(`\nDemo login (both owner + renter): demo@roamly.in / ${DEMO_PASSWORD}`);
  console.log(`Admin login: admin@roamly.in / ${DEMO_PASSWORD}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
