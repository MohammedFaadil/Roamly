// Real photos of each exact catalog model, sourced from Wikimedia Commons only
// (every file there carries an explicit CC/public-domain license permitting
// reuse) via the Special:FilePath redirect, so no MD5 hash path needs to be
// hardcoded. Keyed by "brand|model" to match a CAR_CATALOG/BIKE_CATALOG entry
// exactly. Vehicles with no verified match (currently just the Ather 450X,
// which genuinely has no product photo on Commons) fall back to the branded
// gradient placeholder (see VehicleThumb) rather than a guessed/broken URL.
//
// Shared by prisma/seed.ts (full seed, used when the DB is empty) and
// prisma/backfill-vehicle-images.ts (non-destructive — adds a photo to any
// existing vehicle that doesn't have one yet, safe to run against a database
// that already has real data, e.g. after a deploy that seeded before this
// map existed).
export const VEHICLE_IMAGES: Record<string, string> = {
  "Maruti Suzuki|Swift": "https://commons.wikimedia.org/wiki/Special:FilePath/Maruti_Suzuki_Swift_LXi.jpg?width=1200",
  "Maruti Suzuki|Baleno": "https://commons.wikimedia.org/wiki/Special:FilePath/2022_Maruti_Suzuki_Baleno_Alpha_(India)_front_view.jpg?width=1200",
  "Hyundai|i20": "https://commons.wikimedia.org/wiki/Special:FilePath/2020_Hyundai_i20_1.2_MPI_(BC3).jpg?width=1200",
  "Hyundai|Verna": "https://commons.wikimedia.org/wiki/Special:FilePath/2021_Hyundai_Verna_1.4_Value.jpg?width=1200",
  "Honda|City": "https://commons.wikimedia.org/wiki/Special:FilePath/2022_Honda_City_1.5_GN2_(20220317)_01.jpg?width=1200",
  "Skoda|Slavia": "https://commons.wikimedia.org/wiki/Special:FilePath/2021_%C5%A0koda_Slavia_1.5_TSI_Style_(India)_front_view.png?width=1200",
  "Hyundai|Creta": "https://commons.wikimedia.org/wiki/Special:FilePath/2024_Hyundai_Creta_1.5_MPi_SX(O)_(India)_front_view.png?width=1200",
  "Tata|Nexon": "https://commons.wikimedia.org/wiki/Special:FilePath/2018_Tata_Nexon_XM.jpg?width=1200",
  "Mahindra|Thar": "https://commons.wikimedia.org/wiki/Special:FilePath/Mahindra_Thar_in_maroon,_rear_right.jpg?width=1200",
  "Kia|Seltos": "https://commons.wikimedia.org/wiki/Special:FilePath/2021_Kia_Seltos_EX_AWD_in_Gravity_Grey,_Front_Left,_06-16-2022.jpg?width=1200",
  "Toyota|Innova Crysta": "https://commons.wikimedia.org/wiki/Special:FilePath/Toyota_Innova_Crysta_2.4_Z_front_right.jpg?width=1200",
  "Mahindra|Marazzo": "https://commons.wikimedia.org/wiki/Special:FilePath/Mahindra_Marazzo_MPV_SEP_18_(1).jpg?width=1200",
  "MG|Hector": "https://commons.wikimedia.org/wiki/Special:FilePath/MG_Hector_Diesel_(India)_front_view.png?width=1200",
  "Toyota|Fortuner": "https://commons.wikimedia.org/wiki/Special:FilePath/Toyota_Fortuner_(AN160)_Front.jpg?width=1200",
  "Tata|Nexon EV": "https://commons.wikimedia.org/wiki/Special:FilePath/2020_Tata_Nexon_EV_(India)_front_view.png?width=1200",
  "MG|ZS EV": "https://commons.wikimedia.org/wiki/Special:FilePath/MG_ZS_EV_in_France_(front_left_quarter).jpg?width=1200",
  "Honda|Activa 6G": "https://commons.wikimedia.org/wiki/Special:FilePath/Honda_Activa_6G.jpg?width=1200",
  "TVS|Jupiter": "https://commons.wikimedia.org/wiki/Special:FilePath/TVS_Jupiter_Scooter.jpg?width=1200",
  "Bajaj|Pulsar NS200": "https://commons.wikimedia.org/wiki/Special:FilePath/Bj_Pulsar_NS_200.jpg?width=1200",
  "Yamaha|R15 V4": "https://commons.wikimedia.org/wiki/Special:FilePath/Yamaha_R15_v4_bike.jpg?width=1200",
  "Royal Enfield|Classic 350": "https://commons.wikimedia.org/wiki/Special:FilePath/Royal_Enfield_Classic_350_%282017_Model_Year%29.jpg?width=1200",
  "Royal Enfield|Himalayan": "https://commons.wikimedia.org/wiki/Special:FilePath/Royal_Enfield_Himalayan_%281%29.jpg?width=1200",
  "Honda|Shine": "https://commons.wikimedia.org/wiki/Special:FilePath/Honda_Shine.JPG?width=1200",
  "TVS|Ntorq 125": "https://commons.wikimedia.org/wiki/Special:FilePath/TVS_Ntorq_125_blue.jpg?width=1200",
  "KTM|Duke 200": "https://commons.wikimedia.org/wiki/Special:FilePath/KTM_DUKE_DUKE_200.jpg?width=1200",
  "Ola Electric|S1 Pro": "https://commons.wikimedia.org/wiki/Special:FilePath/OLA_S1_Pro_Gen_1_Electric_Scooter.jpg?width=1200",
  "Suzuki|Access 125": "https://commons.wikimedia.org/wiki/Special:FilePath/Suzuki_access_125.jpg?width=1200",
  // "Ather|450X" intentionally omitted — no genuine product photo exists on
  // Wikimedia Commons (verified: only logo files in Category:Ather Energy).
};
