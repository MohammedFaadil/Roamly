# Roamly Vehicle renting platform

A peer-to-peer car & bike rental marketplace for India — think "Airbnb for
vehicles." Owners list their personal cars and bikes with their own pricing
and availability; renters search, book, and complete a full digital rental
lifecycle from request to return.

This is a **full-stack functional prototype**: real database, real auth, real
business logic and validation, running end-to-end. A few pieces that would
normally require paid third-party providers (payments, government ID
verification, e-signatures) are implemented as clearly-labeled **demo/simulated
flows** with the same request/response shape a real integration would have —
see [What's real vs. simulated](#whats-real-vs-simulated).

```
Search → Book → Verify → Pay → Sign → Hand over → Drive → Return → Review
```

---

## Table of contents

- [Tech stack](#tech-stack)
- [How it works — architecture](#how-it-works--architecture)
  - [Request flow](#request-flow)
  - [Authentication](#authentication)
  - [Data model](#data-model)
  - [The booking lifecycle](#the-booking-lifecycle)
  - [Pricing engine](#pricing-engine)
  - [File uploads](#file-uploads)
  - [Folder structure](#folder-structure)
- [What's real vs. simulated](#whats-real-vs-simulated)
- [Running locally](#running-locally)
- [Environment variables](#environment-variables)
- [Available scripts](#available-scripts)
- [Demo accounts](#demo-accounts)
- [Deploying to Render](#deploying-to-render)
- [Mobile & responsive design](#mobile--responsive-design)
- [Security notes](#security-notes)
- [Known limitations](#known-limitations)

---

## Tech stack

| Layer | Choice | Why |
|---|---|---|
| Framework | [Next.js 16](https://nextjs.org) (App Router, React Server Components) | One codebase for frontend + backend (API routes), server-rendered by default |
| Language | TypeScript (strict mode) | Type safety across the whole stack, including the database layer |
| Styling | Tailwind CSS v4 | Utility-first, CSS-variable design tokens, no separate component library |
| Database | PostgreSQL | Relational data with real foreign keys and transactions (bookings, payments, disputes) |
| ORM | [Prisma](https://www.prisma.io) | Type-safe queries generated from `prisma/schema.prisma`, migrations |
| Auth | Custom JWT session cookie (via [`jose`](https://github.com/panva/jose)) + `bcryptjs` | No external auth provider dependency; httpOnly, signed, `SameSite=Lax` cookie |
| Icons | [lucide-react](https://lucide.dev) | Consistent icon set, no image assets |
| Hosting | [Render](https://render.com) (web service + managed Postgres) | Single platform for app + database, see `render.yaml` |

No other backend services, message queues, or external APIs are required to
run the app. Everything — search, booking, pricing, notifications, admin
tooling — runs inside this one Next.js app and its Postgres database.

---

## How it works — architecture

### Request flow

Next.js App Router serves two kinds of routes from the same codebase:

- **Pages** (`src/app/**/page.tsx`) — React Server Components. Most pages read
  directly from the database with `prisma` (imported from `src/lib/prisma.ts`)
  and render server-side; there is no separate "frontend calls a REST API to
  render a page" round trip for the initial load. Pages that need
  interactivity (forms, buttons, toggles) delegate that piece to a small
  `"use client"` component, which then calls...
- **API routes** (`src/app/api/**/route.ts`) — plain REST-ish JSON endpoints
  used for *mutations* (creating a booking, accepting a request, uploading a
  photo) and for anything a client component needs to fetch after the initial
  page load. Every route handler follows the same shape:

  ```ts
  export async function POST(req: NextRequest) {
    return handleRoute(async () => {
      const user = await getCurrentUser();
      if (!user) throw new HttpError("Please log in", 401);
      // ...validate with zod, run the mutation, maybe inside prisma.$transaction...
      return apiOk({ ... });
    });
  }
  ```

  `handleRoute`/`apiOk`/`HttpError` (`src/lib/api.ts`) give every endpoint the
  same error shape (`{ error: string }` with the right HTTP status) and make
  sure unexpected exceptions never leak a stack trace to the client — they log
  server-side and return a generic "Something went wrong" instead.

A thin proxy (`src/proxy.ts`, Next 16's evolution of "middleware") gates the
`/dashboard`, `/owner`, `/admin`, and `/booking` URL prefixes: it checks that a
session cookie is *present* and redirects to `/login` if not. It deliberately
does **not** check the user's role (an edge proxy can't cheaply hit the
database) — role checks (e.g. "is this actually an admin?") happen
server-side in the relevant `layout.tsx` and are re-checked independently in
every sensitive API route, so the proxy is a UX convenience, not the security
boundary.

### Authentication

`src/lib/auth.ts` implements a small, dependency-light session system:

1. `POST /api/auth/register` or `/api/auth/login` verifies credentials
   (`bcryptjs.compare`), then signs a JWT containing the user's ID
   (`SignJWT` from `jose`, `HS256`, 30-day expiry) and sets it as an
   `httpOnly`, `SameSite=Lax` cookie (`secure` in production).
2. `getCurrentUser()` — called at the top of nearly every server component and
   API route — reads that cookie, verifies the signature, and loads the fresh
   `User` row from Postgres (so a suspended account is rejected immediately,
   not just at login time).
3. Logout simply deletes the cookie.

One account can be **both a renter and an owner** — there's no separate
"owner account" type. `/dashboard` is the renter view, `/owner` is the owner
view; the same logged-in user sees both in the nav.

### Data model

The full schema lives in `prisma/schema.prisma` (22 models). The core entities:

```
User ──< Vehicle ──< Booking >── User (renter)
                        │
                        ├── RentalAgreement (e-sign record)
                        ├── HandoverInspection / ReturnInspection
                        ├── Payment[] (RENTAL, DEPOSIT, EXTRA_CHARGE, REFUND)
                        ├── DamageClaim[] ──── Dispute
                        └── Review[]
```

Other supporting models: `VehicleImage`/`VehicleDocument` (KYC-style
verification per vehicle), `AvailabilityBlock` (owner-blocked dates),
`MaintenanceLog`, `Favorite`, `Notification`, `SupportTicket`,
`PlatformSetting` (admin-editable config like commission rate and
cancellation window — read live from the database, not hardcoded).

### The booking lifecycle

A `Booking.status` moves through a strict state machine, enforced in the API
layer (not just the UI):

```
REQUESTED ──accept──▶ OWNER_ACCEPTED ──pay──▶ CONFIRMED ──sign×2──▶ HANDOVER_PENDING
    │reject                                                              │handover×2
    ▼                                                                    ▼
OWNER_REJECTED                                                        ACTIVE
                                                                           │return×2
    (any party can CANCEL from REQUESTED / OWNER_ACCEPTED /               ▼
     CONFIRMED / HANDOVER_PENDING)                                RETURN_PENDING
                                                                           │
                                                                           ▼
                                                                      COMPLETED
                                                                           │owner reports damage
                                                                           ▼
                                                                       DISPUTED
```

Every transition lives in its own route under `src/app/api/bookings/[id]/`
(`accept`, `reject`, `cancel`, `pay`, `sign`, `handover`, `return`, `damage`,
`damage/respond`, `review`) and re-validates the current status and the
caller's relationship to the booking before doing anything — a renter can't
accept their own request, an owner can't sign twice, etc.

Two invariants worth calling out because they're easy to get wrong in a
rental marketplace:

- **No double-booking.** `POST /api/bookings` checks for overlapping
  `Booking`s *and* owner-created `AvailabilityBlock`s for the same vehicle
  inside a `prisma.$transaction`, so two concurrent requests for the same
  window can't both succeed.
- **Extra-km and late fees are computed from real data**, not estimated: the
  return flow reads the odometer reading recorded at handover, compares it to
  the odometer entered at return, and bills anything past the vehicle's
  included-km allowance; it does the same for minutes past the rental's
  `endAt` versus a configurable grace period. The security deposit is then
  auto-settled — the fee is deducted and the remainder is "refunded"
  (see [demo payments](#whats-real-vs-simulated)).

### Pricing engine

`src/lib/pricing.ts` is pure, framework-agnostic TypeScript (no server-only
imports), so the exact same function runs both server-side (when a booking is
actually created — never trust a client-submitted price) and client-side (for
instant live price-breakdown updates as a renter changes dates, with zero
network round-trip).

- `computeBookingPrice(vehicle, startAt, endAt)` — picks the cheapest
  applicable rate (hourly vs. daily vs. weekly) for the requested duration and
  returns the full breakdown: base fare, platform fee, GST, security deposit,
  included km.
- `recommendPrice({ category, fuelType, transmission, year, city })` — the
  "AI-assisted recommended pricing" shown to owners in the listing wizard. It's
  a deterministic, explainable heuristic (category base rate × city demand
  multiplier × age depreciation × transmission/fuel/rating adjustments) — not
  a call to an LLM. It's built this way so it's fast, free, fully offline, and
  every number it shows can be explained to the owner (see the "factors" list
  it returns). Swapping in a real market-data model later means replacing the
  inside of this one function; nothing else needs to change.

Commission and tax rates (`PLATFORM_FEE_RATE`, `GST_RATE`,
`OWNER_COMMISSION_RATE` in `src/lib/constants.ts`) are currently constants;
`PlatformSetting.platform_commission_rate` exists in the schema and is
editable from the admin panel for display/reference — wiring it back into the
live pricing calculation is a natural next step (see
[Known limitations](#known-limitations)).

### File uploads

Vehicle photos and KYC documents are written to disk (`src/lib/storage.ts`)
and served back through a dedicated route, `GET /api/files/[...path]`, rather
than Next's static `public/` folder. This keeps *where files are stored*
completely decoupled from *how they're served*:

- Locally, and on Render's free plan, they land in `./uploads` (or
  `UPLOAD_DIR` if set) — a plain folder that resets on redeploy/restart.
- On a paid Render plan with a persistent Disk attached, point `UPLOAD_DIR` at
  the disk's mount path and uploads survive deploys (see
  [Deploying to Render](#deploying-to-render)).
- Moving to S3-compatible object storage later only means changing
  `src/lib/storage.ts` and the two routes that call it
  (`api/upload`, `api/files/[...path]`) — no other code references the
  filesystem.

Demo vehicles seeded into the database have **no real photos** (to avoid
using stock images of actual car models without rights) — they render a
consistent branded gradient placeholder (`VehicleThumb` component) instead.
Real photos uploaded through the owner listing wizard work normally and take
over automatically.

### Folder structure

```
prisma/
  schema.prisma          Single source of truth for the data model
  migrations/             SQL migration history (Postgres)
  seed.ts                 Destructive full reseed — local dev only
  seed-if-empty.ts        Safe reseed — only runs if the DB is empty (Render)
  vehicle-images.ts       Shared brand+model → real photo URL map (Wikimedia Commons)
  backfill-vehicle-images.ts  Non-destructive — adds photos to existing imageless vehicles (Render)
src/
  app/
    (site)/               Public pages — homepage, explore, vehicle detail,
                           about/FAQ/safety/legal — share Navbar+Footer layout
    (auth)/                Login, register
    dashboard/             Renter dashboard (bookings, favorites, KYC, profile)
    owner/                 Owner dashboard, listing wizard, earnings, calendar
    admin/                 Admin console (users, vehicles, disputes, settings)
    booking/[id]/          Booking hub + agreement/handover/return/damage flows
    api/                   All mutation endpoints, one folder per resource
  components/
    ui/                    Design-system primitives (Button, Badge, Modal, ...)
    vehicle/, booking/, owner/, dashboard/, layout/   Feature-specific components
  lib/
    prisma.ts, auth.ts, api.ts, pricing.ts, storage.ts, format.ts,
    constants.ts, validators.ts, utils.ts             Shared server/client logic
```

---

## What's real vs. simulated

Being upfront about this matters more than it looks — a production rental
marketplace touches money, government ID, and legal contracts, and none of
those should be faked convincingly. Each simulated flow below is labeled in
its own code (comment + often in the UI copy) as a demo, and returns data in
the same shape a real integration would, so swapping one in later is a
contained change:

| Feature | Status | Where |
|---|---|---|
| Search, filters, availability, double-booking prevention | **Real** | `src/app/(site)/explore`, `api/bookings` |
| Pricing calculation & breakdown | **Real** math, deterministic recommendation heuristic | `src/lib/pricing.ts` |
| Auth, sessions, password hashing | **Real** | `src/lib/auth.ts` |
| Booking state machine, handover/return odometer math | **Real** | `api/bookings/[id]/*` |
| Reviews, ratings, notifications | **Real** | `api/bookings/[id]/review`, `api/notifications` |
| Admin moderation (approve/suspend/verify) | **Real** | `src/app/admin`, `api/admin/*` |
| **Payments** | Simulated — "Pay now" instantly creates a `SUCCESS` `Payment` row against a "Demo Wallet/UPI"; no card data is ever collected or stored | `api/bookings/[id]/pay` |
| **KYC / identity verification** | Simulated — uploading a document sets status `PENDING`; an admin manually flips it to `VERIFIED` in the admin panel. No government ID API is called | `api/kyc`, `src/app/admin/users` |
| **E-signature** | Simulated — signing an agreement is a timestamped "I agree" click, not a legally-binding e-sign provider | `api/bookings/[id]/sign` |
| **Vehicle photo/document uploads** | Real file upload + storage, demo-scale (local disk, see [File uploads](#file-uploads)) | `src/lib/storage.ts` |
| **Map** | A lightweight custom visualization (markers positioned by normalizing lat/lng within the result set's bounding box) — not a Google Maps/Mapbox SDK | `src/components/vehicle/MapPanel.tsx` |
| **Fuel price estimates** | Static constants used only as a pricing-guidance input, not a live feed | `FUEL_PRICE_ESTIMATE` in `src/lib/constants.ts` |

---

## Running locally

**Prerequisites:** Node 22.x, and a Postgres database (three easy options
below — pick one).

```bash
git clone <this repo>
cd Ride-Share
npm install
cp .env.example .env      # then fill in DATABASE_URL/DIRECT_URL (see below) and JWT_SECRET
```

**Get a Postgres database** (pick one):

- **Docker (recommended, one command):**
  ```bash
  docker compose up -d
  # DATABASE_URL and DIRECT_URL in .env.example already match this:
  # postgresql://roamly:roamly@localhost:5432/roamly
  ```
- **Free hosted Postgres** — [Neon](https://neon.tech), [Supabase](https://supabase.com),
  or a free [Render Postgres](https://render.com/docs/databases) instance all
  work — create one and paste its connection string into both `DATABASE_URL`
  and `DIRECT_URL` (a single non-pooled connection string works fine for
  both locally; they only need to differ in production against Supabase's
  pooler — see [Deploying to Render](#deploying-to-render)).
- **Existing local Postgres install** — create a database and point
  `DATABASE_URL`/`DIRECT_URL` at it.

Then apply the schema and load demo data:

```bash
npx prisma migrate deploy   # creates all tables
npm run db:seed             # loads demo users, vehicles, and sample bookings
npm run dev                 # http://localhost:3000
```

Log in with any [demo account](#demo-accounts) — `demo@roamly.in` /
`Password123` is the most useful one (it owns vehicles *and* has bookings as a
renter, so you can explore both dashboards immediately).

To reset your local database back to a clean seeded state at any point:
`npm run db:reset`.

---

## Environment variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | Postgres connection string used at runtime. In production this is Supabase's **transaction pooler** URL (port 6543, `?pgbouncer=true`) — set manually in the Render dashboard, see "Deploying to Render" below. |
| `DIRECT_URL` | Yes | Postgres connection string used only for `prisma migrate deploy`. In production this is Supabase's **session pooler** URL (port 5432) — transaction-mode pooling doesn't support the schema-level locks migrations need. Same value as `DATABASE_URL` for local dev (no pooler involved). |
| `JWT_SECRET` | Yes in production (throws on boot if missing) | Signs session cookies. Render's blueprint generates a secure random value automatically (`generateValue: true`). For local dev, any string works — see `.env.example`. |
| `UPLOAD_DIR` | No | Absolute or relative path where uploaded files are written/read. Defaults to `./uploads`. Set this to a mounted disk's path in production if you want uploads to survive deploys (see below). |
| `NODE_ENV` | Set by the platform | `production` enables secure cookies and disables the JWT_SECRET fallback. Next.js/Render set this automatically — you shouldn't need to touch it. |

---

## Available scripts

| Script | What it does |
|---|---|
| `npm run dev` | Start the dev server (Turbopack, hot reload) |
| `npm run build` | `prisma generate` then `next build` — production build |
| `npm start` | Start the production server (reads `PORT` from the environment, defaults to 3000) |
| `npm run lint` | ESLint |
| `npm run db:seed` | **Destructive.** Wipes and reseeds the database with fresh demo data — local dev only |
| `npm run db:seed:if-empty` | Safe to run anytime — seeds demo data only if the `User` table is empty. Used automatically on every deploy |
| `npm run db:backfill-images` | **Non-destructive**, safe to run anytime — adds a real photo (from `prisma/vehicle-images.ts`) to any existing vehicle that doesn't have one yet, without touching anything else. Used automatically on every deploy (see below) |
| `npm run db:reset` | `prisma migrate reset --force` — drops, recreates, migrates, and reseeds |
| `npm run db:migrate:deploy` | Applies pending migrations without prompting — used in production deploys |
| `npm run db:studio` | Opens [Prisma Studio](https://www.prisma.io/studio) — a GUI for browsing/editing the database |

---

## Demo accounts

All demo accounts share the password **`Password123`**.

| Email | Role | Notes |
|---|---|---|
| `demo@roamly.in` | Renter + Owner | The best account to explore with — owns 3 vehicles and has bookings in multiple states (requested, active, completed) as both renter and owner |
| `admin@roamly.in` | Admin | Full access to `/admin` |
| `owner1@roamly.in` … `owner8@roamly.in` | Owner | Each owns several vehicles across different Indian cities |
| `renter1@roamly.in` … `renter6@roamly.in` | Renter | Plain renter accounts, some with pending KYC to test that flow |

Any account can list a vehicle (becoming an owner) or book one (as a renter) —
these are just how the seed data happens to be distributed.

---

## Deploying to Render

The Next.js app runs on Render; the Postgres database is external, on
**Supabase**. (Render's own free Postgres plan auto-deletes the database ~30
days after creation, which is a bad fit for anything you want to keep around
— Supabase's free tier doesn't have that limit, it just auto-*pauses* a
project after a week of no traffic, which a "resume" click in its dashboard
fixes.) `render.yaml` in the repo root is a [Render Blueprint](https://render.com/docs/blueprint-spec)
for the web service only; the database is wired up as a one-time manual step.

### Database: Supabase

1. Create a project at [supabase.com](https://supabase.com) (any region;
   pick one close to your Render service's region for lower latency).
2. In the project, open **Connect → ORMs → Prisma**. Copy the two connection
   strings it shows:
   - `DATABASE_URL` — the **transaction pooler** (port 6543, `?pgbouncer=true`)
   - `DIRECT_URL` — the **session pooler** (port 5432)
   Both contain `[YOUR-PASSWORD]` as a placeholder — swap in the database
   password you set when creating the project.
3. Keep these two values handy for the Render setup below.

### Web service: Render

1. Push this repository to GitHub or GitLab.
2. In the Render dashboard: **New → Blueprint**, select the repo. Render
   provisions a **free web service** (`roamly`) and generates a secure random
   `JWT_SECRET` for you.
3. Once the service exists, open its **Environment** tab and add the two
   values from the Supabase step above:
   - `DATABASE_URL` — the transaction pooler string
   - `DIRECT_URL` — the session pooler string
   (`render.yaml` marks both `sync: false`, so Render leaves them alone on
   every future blueprint sync — you only enter them once.)
4. Every time the app boots (`npm start` → `scripts/start.mjs`), it runs three
   idempotent steps before starting the server: `prisma migrate deploy`
   (applies any pending migrations, using `DIRECT_URL`), `db:seed:if-empty`
   (loads demo data only if the database is still empty), and
   `db:backfill-images` (adds a real photo to any vehicle that doesn't have
   one yet — see below). None of these ever touch existing real data — **a
   redeploy or restart never wipes anything.**
5. Once the deploy finishes, open the service URL and log in with a
   [demo account](#demo-accounts).

> `render.yaml` also sets a `preDeployCommand` running the same migrate/seed/
> backfill steps, for accounts on a plan where that feature is available (it
> runs once, before traffic switches to the new instance, which is slightly
> cleaner than doing it at boot). **Free-tier Render doesn't support
> `preDeployCommand`** — Render just ignores that line — so `scripts/start.mjs`
> running the same steps at boot is what actually makes this work on the free
> plan. You don't need to configure anything either way; one of the two paths
> always runs.

### Why images might be missing after a deploy (and how it self-heals)

If you deployed *before* `prisma/vehicle-images.ts` existed (or before a
vehicle model was added to it) and the database was already seeded, later
deploys skip re-seeding — `db:seed:if-empty` only runs once, on purpose, so it
never wipes real bookings/users. That would normally leave those vehicles
permanently imageless even after pulling the updated code.

`db:backfill-images` (`prisma/backfill-vehicle-images.ts`) exists specifically
for that: it's a **non-destructive** pass that finds any vehicle with zero
photos and adds one if its brand+model matches an entry in
`prisma/vehicle-images.ts`, without touching users, bookings, or anything
else. It runs automatically on every boot (see above), so simply redeploying
(or restarting the service) after pulling updated code is enough to fix it —
no manual database work needed. You can also run it by hand any time:
`npm run db:backfill-images` (locally) or from the Render **Shell** tab
(deployed).

### Manual setup (without the Blueprint)

If you'd rather click through the UI instead of using `render.yaml`:

1. Follow the "Database: Supabase" steps above to get `DATABASE_URL` and
   `DIRECT_URL`.
2. **New → Web Service** — connect the repo.
   - Build command: `npm install && npm run build`
   - Start command: `npm start`
   - Pre-deploy command (if available): `npm run db:migrate:deploy && npm run db:seed:if-empty && npm run db:backfill-images`
     — optional either way, since `npm start` runs the same three steps at boot
   - Environment variables:
     - `DATABASE_URL` / `DIRECT_URL` — from step 1
     - `JWT_SECRET` — generate one with
       `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`
       and paste it in (or use Render's "Generate" button next to the field)
     - `NODE_ENV` = `production`
3. Deploy, then run the pre-deploy commands manually via Shell if step 2's
   pre-deploy command wasn't available.

### Persisting uploaded photos across deploys

By default (free plan), uploaded vehicle photos and KYC documents are written
to the web service's local disk, which **resets on every deploy or restart** —
fine for a demo, since the app still works correctly, uploads just don't
outlive the current running instance. To persist them:

1. Upgrade the web service to a plan that supports [persistent disks](https://render.com/docs/disks)
   (Starter or above).
2. In `render.yaml`, uncomment the `disk:` block under the `roamly` service
   and change `UPLOAD_DIR` to `/var/data/uploads` (matching the disk's
   `mountPath`).
3. Redeploy.

### Database plan notes

Render's free Postgres tier is meant for development/demos — check Render's
current docs for its exact retention policy before relying on it long-term.
For anything beyond a demo, upgrade `roamly-db` to a paid plan directly in the
Render dashboard (no code changes needed — the connection string stays wired
automatically).

### Cold starts

Free-tier Render web services spin down after a period of inactivity and take
a few seconds to wake back up on the next request — expected behavior, not a
bug, if the first load after some idle time feels slow.

---

## Mobile & responsive design

The UI is built mobile-first throughout — every layout starts as a single
column and adds columns at `sm`/`lg`/`xl` breakpoints, not the other way
around. Specific patterns worth knowing about:

- **Navigation** collapses to a hamburger + slide-out drawer below the `lg`
  breakpoint, on both the public site (`Navbar`) and every dashboard
  (`DashboardShell`, shared by the renter, owner, and admin sections).
- **Filters** on the explore page become a bottom-sheet drawer on mobile
  instead of a sidebar.
- **The map panel** is desktop-only (`hidden xl:block`) — on mobile you get
  the list view, which is the more usable experience on a small screen for
  browsing many results.
- **Admin data tables** (users, vehicles, bookings, payments) scroll
  horizontally within their own container on narrow screens
  (`overflow-x-auto`) rather than breaking the page layout — a standard,
  intentional pattern for dense back-office tables, which are used
  predominantly on desktop anyway.
- **Multi-step flows** (the vehicle listing wizard, booking status stepper)
  use a horizontally-scrollable step indicator so they never overflow a
  narrow viewport.

This was verified through a full code-level audit (every grid/flex layout
checked for a mobile-safe default, all touch targets sized appropriately,
zero hardcoded pixel widths anywhere in the codebase) plus rendered-HTML
checks confirming the responsive viewport meta tag and breakpoint classes are
present and correct. It was **not** verified with a real visual browser at
multiple device widths, since no browser/screenshot tool was available in the
environment this was built in — if you spot an actual visual issue on a real
device, it's a good candidate for a quick manual pass.

---

## Security notes

- Passwords are hashed with `bcryptjs` (cost factor 10) — never stored or
  logged in plaintext.
- Sessions are signed JWTs in an `httpOnly`, `SameSite=Lax` cookie (`secure`
  in production) — inaccessible to client-side JavaScript, mitigating XSS
  token theft.
- Every API route re-validates the caller's identity and permissions
  server-side — the UI hiding a button is never the only thing standing
  between a user and an action they shouldn't be able to take (see the
  [request flow](#request-flow) note on the proxy vs. real auth checks).
- All user input is validated with `zod` schemas (`src/lib/validators.ts`)
  before touching the database.
- File uploads are type- and size-restricted, written under a generated UUID
  filename (never the original filename), and served through a route that
  path-traversal-guards against escaping the upload directory.
- No secrets are committed — `.env` is gitignored, `.env.example` documents
  the shape without real values, and Render generates `JWT_SECRET` for you.

---

## Known limitations

This is a prototype meant to demonstrate a complete, working product — not a
finished commercial platform. Worth knowing about before extending it:

- Payments, KYC, and e-signature are demo flows (see the table above) — a
  real launch needs a licensed payment gateway (e.g. Razorpay), a compliant
  identity-verification provider, and a proper e-sign integration.
- `PlatformSetting.platform_commission_rate` is editable in the admin panel
  but not yet read back into the live pricing calculation (which uses the
  `PLATFORM_FEE_RATE` constant) — wiring that up is a small, contained change.
- No automated test suite yet (the booking lifecycle, pricing math, and
  double-booking guard were manually exercised end-to-end during
  development, including via direct API calls against a real local Postgres
  instance — migrations, seeding, case-insensitive search, and the
  transactional overlap check were all verified against Postgres
  specifically, not just assumed to carry over from earlier SQLite testing —
  but there's no CI-run test suite to catch regressions automatically).
- Single-instance file storage (see [File uploads](#file-uploads)) — fine at
  small scale, needs S3-compatible storage before running multiple instances.
- No rate limiting on auth or booking endpoints yet.
- Owner-to-renter and renter-to-owner messaging is modeled in the schema
  (`Conversation`, `Message`) but there's no dedicated chat UI built on top of
  it yet — the "Message owner" link currently routes to the contact form.
