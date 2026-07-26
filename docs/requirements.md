# Requirements & Architecture

## What this is

A multi-vendor marketplace for Ghana, covering four audiences:

- **Shoppers** — browse categories, products, and services; search; add
  reviews; wishlist; cart and multi-vendor checkout; track orders on a map;
  book services; chat with an AI shopping assistant; sign in with
  email/password or Google/Facebook.
- **Vendors** — self-service sign-up (business details → email
  verification → subscription plan → MTN Mobile Money payment → account
  activation), then a dashboard for products, inventory, orders, coupons,
  advertising, analytics, and shop settings.
- **Admins** — platform-wide oversight: users & permissions, shops,
  products, orders, payments, advertisements, coupons, inventory, reviews
  moderation, blog & category content management, flash sales, reports,
  and analytics.
- **Everyone** — real-time homepage sections (trending products, flash
  sales, best-seller shops, shops near you via geolocation), push/SMS/
  WhatsApp/email notifications, and a blog.

## Architecture overview

Two independently deployable apps, no shared internal package between
them:

```
.  (root)  Next.js 15 (React 19) — storefront, vendor dashboard, admin
           dashboard, and account area. Deploys to Vercel.
backend    Express.js REST API — auth, payments, notifications, vendor
           onboarding, and the Prisma schema (backend/prisma). Deploys
           to Railway.
```

### Why a separate API instead of Next.js API routes for everything

- The frontend and `backend` deploy to different platforms (Vercel vs.
  Railway), so they need independent build/deploy pipelines.
- Next.js Route Handlers under `app/api` are still used, but only for
  things that must live at the edge/close to the frontend: NextAuth
  callbacks. All core marketplace business logic (auth, payments,
  notifications, vendor onboarding) lives in `backend`.
- Secrets (DB credentials, payment provider keys, SMTP, Twilio, OpenAI)
  live only in `backend`'s environment. The frontend never talks to
  Postgres or any third-party API directly — everything goes through
  `expressFetch`/`expressInternalFetch` (`lib/api/express.ts`).

### Why the Next.js app lives at the repo root

The frontend's own `package.json`, `app/`, `components/`, etc. live
directly at the repo root rather than in a `frontend/` subfolder — this
lets Vercel auto-detect and build it with zero project configuration (no
"Root Directory" setting to get right in the dashboard). `backend` is a
sibling pnpm workspace package with its own `package.json`, deployed
separately to Railway.

### Why no shared `packages/` workspace

Earlier iterations of this project used a pnpm monorepo with
`packages/database`, `packages/types`, and `packages/validators` shared
between the two apps. The current structure intentionally drops that:
the frontend and `backend` are meant to be deployable and buildable in
isolation, so the handful of things both sides genuinely need — the auth
Zod schemas and a few TypeScript types — are duplicated once in each app
(root `types/`, `lib/validators/` and `backend/types.ts`,
`backend/utils/validators.ts`) instead of imported from a shared package.
The tradeoff: a change to a validation rule needs updating in both
places. See [database.md](./database.md) for the Prisma schema, which now
lives entirely inside `backend/prisma` rather than a shared package.

### Domain boundaries (`app/`)

Route groups separate the four audiences without affecting the URL
structure:

- `(auth)` — sign in / sign up / password reset / vendor self-registration
- `(marketplace)` — public storefront: browsing, product/vendor pages,
  cart, checkout, blog, categories
- `(account)` — authenticated buyer area: profile, orders, bookings,
  wishlist
- `(vendor)` — authenticated seller dashboard: products, orders,
  analytics, advertising, settings
- `(admin)` — platform admin dashboard: users, shops, products, orders,
  payments, content, reports

### Domain boundaries (`backend`)

Layered by responsibility:

- `routes/` — route definitions, grouped by domain
- `controllers/` — request/response handling, request-level Zod validation
- `services/` — business logic (currently `auth.service.ts`)
- `middleware/` — auth guards, error handling, rate limiting
- `utils/` — third-party clients (Paystack, Flutterwave, Cloudinary,
  Twilio, OpenAI, mailer), Prisma client, env config, shared validators
- `prisma/` — schema, migrations, seed script

See [api.md](./api.md) for which route groups are actually implemented.

## Hybrid data architecture

Auth, payments, and vendor onboarding are wired to a real Postgres
database through Prisma (see [database.md](./database.md)) — those are
the parts of the system where correctness (a real login, a real charge,
a real account) matters most.

Most storefront and dashboard *content* (products, categories, orders,
reviews, blog posts, flash sales, ad campaigns, and so on) is instead
served from static seed data overlaid with browser `localStorage` —
every admin/vendor edit writes to a scoped `localStorage` key, and every
consumer re-reads the merged (seed + edits) result, with `storage` events
and polling keeping multiple tabs in sync in real time. This lets every
CRUD flow in the admin and vendor dashboards work end-to-end (create,
edit, publish, moderate) without a live database backing every table —
useful for demoing and iterating on UI quickly, at the cost of that data
not being real multi-user, cross-device, or durable in the way a
database-backed table would be. Promoting a given domain (e.g. products)
to real Postgres-backed CRUD means adding routes/controllers under
`backend` and swapping the corresponding `lib/**/*-store.ts` module to
call them instead of `localStorage`.

## Payments and webhooks

Paystack and Flutterwave both need publicly reachable webhook endpoints.
`backend/routes/webhooks` and `backend/routes/payments` own webhook
receipt and signature verification. The vendor subscription flow uses a
direct Paystack Mobile Money charge (no hosted-checkout redirect) rather
than the webhook path — see [api.md](./api.md#vendor-self-registration--subscription).

## Environments

- Database: PostgreSQL, connected to via `DATABASE_URL`/`DIRECT_URL` in
  `backend`, and via `backend/prisma` for migrations.
- `.env.example` files live per app; never commit real `.env` files.
