# Nexora — Multi-Vendor Marketplace

A full multi-vendor marketplace for Ghana: storefront, vendor dashboard,
admin dashboard, checkout, bookings, reviews, advertising, and a
self-service vendor onboarding + MTN Mobile Money subscription flow.

## Tech stack

| Layer          | Choice                                                     |
| -------------- | ------------------------------------------------------------ |
| Frontend       | Next.js 15, React 19, TypeScript, Tailwind CSS, shadcn/ui   |
| Backend        | Node.js, Express.js, Prisma ORM                              |
| Database       | PostgreSQL                                                   |
| Authentication | NextAuth (credentials + Google/Facebook OAuth)               |
| Storage        | Cloudinary                                                    |
| Maps           | Google Maps API                                               |
| Payments       | Paystack (incl. MTN Mobile Money), Flutterwave                |
| Comms          | Nodemailer, Twilio (SMS/WhatsApp), Web Push                   |
| Deployment     | Vercel (frontend), Railway (backend), Docker Compose (local)  |

## Structure

```
nexora/
├── app/             Next.js 15 app — storefront, vendor & admin dashboards
├── components/
├── hooks/
├── lib/
├── styles/
├── types/
├── public/
│
├── backend/         Express.js REST API
│   ├── controllers/
│   ├── routes/
│   ├── middleware/
│   ├── services/
│   ├── prisma/
│   ├── utils/
│   └── uploads/
│
├── docs/
│   ├── requirements.md
│   ├── api.md
│   ├── database.md
│   └── deployment.md
│
└── README.md
```

The Next.js app lives directly at the repo root (its own `package.json`,
`app/`, `components/`, etc.) so Vercel can build it with zero project
configuration — no "Root Directory" setting required. `backend` is a
sibling pnpm workspace package with its own `package.json`, deployed
separately to Railway. There's no shared internal package between them:
types and Zod validation schemas that both sides need (auth payloads,
request validation) are intentionally duplicated once in each app
(`types`, `lib/validators` at the root, and `backend/types.ts`,
`backend/utils/validators.ts`) rather than pulled from a shared package,
so each app can be deployed independently.

See [docs/requirements.md](./docs/requirements.md) for feature scope,
[docs/api.md](./docs/api.md) for the Express API reference,
[docs/database.md](./docs/database.md) for the schema and ER diagram, and
[docs/deployment.md](./docs/deployment.md) for how to ship it.

## Getting started

```bash
pnpm install

# copy env files and fill in real values
cp .env.example .env.local
cp backend/.env.example backend/.env

# generate the Prisma client
pnpm db:generate

# apply migrations against your local Postgres
pnpm db:migrate

# run the frontend
pnpm dev

# in a second terminal, run the backend
pnpm --filter backend dev
```

Frontend runs on `http://localhost:3000`, the API on `http://localhost:4000`.

## Status

The marketplace is fully built: storefront, checkout, order tracking,
service bookings, reviews, advertising, vendor + admin dashboards, blog
and category management, flash sales, real-time homepage sections, and a
self-service vendor sign-up flow (email verification → subscription plan
→ MTN Mobile Money payment → account activation → login). Authentication,
the database schema, and payments are wired to real services — see
[docs/deployment.md](./docs/deployment.md) for what's needed to run them
against production credentials.
