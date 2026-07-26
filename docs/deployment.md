# Deploying Nexora

This is a pnpm workspace with two independently deployable apps:

| Package | What | Deploys to |
|---|---|---|
| root (`.`) | Next.js 15 storefront + dashboards | Vercel |
| `backend` | Express API + Prisma schema (`backend/prisma`) | Railway |
| — | Postgres database | Supabase |

The Next.js app lives directly at the repo root — its own `package.json`,
`app/`, `components/`, etc. — specifically so Vercel can build it with
zero project configuration (no "Root Directory" setting to get right).
`backend` is a sibling pnpm workspace package. There's no shared internal
package between them — types and Zod validation schemas that both sides
need are duplicated once in each app (see the root
[README](../README.md#structure)) rather than pulled from a workspace
package, so either app can be built and deployed on its own.

The frontend never talks to Postgres, Paystack, Flutterwave, Cloudinary, OpenAI, or Twilio directly — every third-party call goes through `backend`, reached over `expressFetch`/`expressInternalFetch` (see `lib/api/express.ts`). Keep that boundary when adding new integrations: secrets belong in `backend`'s environment, never the frontend's.

I can't create the actual Vercel/Railway/Supabase/Cloudinary/Paystack/Flutterwave accounts or provision real credentials for you — that requires your own logins and, in most cases, a card on file. Everything below is the configuration this repo needs; the steps under each service are what you run yourself.

---

## 1. Environment variables

Reference `.env.example` in each app for the full annotated list. Summary:

### `backend/.env`

| Variable | Where it comes from | Notes |
|---|---|---|
| `PORT` | — | `4000` locally; Railway injects its own `PORT` and this is ignored in production |
| `NODE_ENV` | — | `production` on Railway |
| `CLIENT_URL` | — | Your Vercel production URL (sets the CORS allow-origin) |
| `DATABASE_URL` | Supabase → Project Settings → Database → Connection string → **Transaction** pooler | Runtime connection |
| `DIRECT_URL` | Supabase → same page → **Direct connection** | Migrations only |
| `JWT_ACCESS_SECRET` | generate: `openssl rand -base64 48` | ≥32 chars |
| `INTERNAL_API_SECRET` | generate: `openssl rand -base64 48` | Must exactly match the frontend's `INTERNAL_API_SECRET` |
| `SMTP_HOST`/`PORT`/`USER`/`PASSWORD`/`EMAIL_FROM` | your transactional email provider | Any SMTP provider (Resend, Postmark, SES, etc.) |
| `CLOUDINARY_CLOUD_NAME`/`API_KEY`/`API_SECRET` | Cloudinary → Dashboard | §6 |
| `PAYSTACK_SECRET_KEY`/`PUBLIC_KEY` | Paystack → Settings → API Keys | §8 |
| `FLUTTERWAVE_SECRET_KEY`/`ENCRYPTION_KEY`/`WEBHOOK_HASH` | Flutterwave → Settings → API | §9 |
| `OPENAI_API_KEY` | platform.openai.com | Powers Chat Mr President AI |
| `TWILIO_ACCOUNT_SID`/`AUTH_TOKEN`/`SMS_FROM`/`WHATSAPP_FROM` | Twilio console | SMS/WhatsApp order notifications |
| `VAPID_PUBLIC_KEY`/`PRIVATE_KEY`/`SUBJECT` | generate: `npx web-push generate-vapid-keys` | Web Push |

### Vercel project env vars (root app)

| Variable | Notes |
|---|---|
| `NEXT_PUBLIC_APP_URL` | Your production `https://` domain |
| `NEXT_PUBLIC_API_URL` | Your Railway API's public URL — used by the **browser** |
| `API_URL` | Same Railway URL — used by **Server Actions**; keep both in sync unless you're routing server-side traffic over a private network |
| `DATABASE_URL` | Only needed if you ever call Prisma directly from the frontend; leave unset otherwise |
| `AUTH_URL` | Same as `NEXT_PUBLIC_APP_URL` |
| `AUTH_SECRET` | generate: `openssl rand -base64 48` |
| `AUTH_GOOGLE_ID`/`SECRET`, `AUTH_FACEBOOK_ID`/`SECRET` | optional — only if you enable social login |
| `INTERNAL_API_SECRET` | must exactly match `backend`'s value |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | §7 |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | must exactly match `backend`'s `VAPID_PUBLIC_KEY` |

`NEXT_PUBLIC_*` variables are inlined into the client bundle **at build time** — set them in Vercel before the first deploy, and redeploy after changing one (a runtime env var change alone won't reach the browser).

---

## 2. Docker (local full-stack dev)

```bash
docker compose up --build
```

Brings up Postgres, the API (`:4000`), and the web app (`:3000`) wired together. This is for local development parity, not production — production uses Vercel + Railway + Supabase directly, described below.

Each app also has a standalone `Dockerfile` (`Dockerfile` at the repo root for the frontend, `backend/Dockerfile` for the API) for self-hosting outside Vercel/Railway if you ever need to. Both must be built **from the repo root** (`docker build -f backend/Dockerfile .`) since this is a pnpm workspace and the images need the full monorepo context.

---

## 3. CI/CD (GitHub Actions)

- **`.github/workflows/ci.yml`** — runs on every PR and push to `main`: install, `prisma generate`, lint, typecheck, `pnpm build` (the root Next.js app), and a Docker build validation pass (both Dockerfiles, no push). This is the main quality gate.
- **`.github/workflows/deploy-web.yml`** / **`deploy-api.yml`** — path-filtered pre-deploy checks (typecheck + build scoped to just that app) that run before Vercel/Railway's own git-triggered deploy. Vercel and Railway deploy themselves via their native GitHub integration — these workflows don't push anything, they just fail fast and can be wired into branch protection so a broken app can't merge.

To make CI a required check: GitHub repo → Settings → Branches → branch protection rule on `main` → require the `build-and-check` (and optionally `docker-build`) status checks.

---

## 4. Vercel deployment (frontend)

1. [vercel.com/new](https://vercel.com/new) → import this repo.
2. **Root Directory**: leave it unset (default = repo root). The Next.js app's own `package.json` lives at the repo root specifically so Vercel auto-detects it with zero project configuration — nothing to pick in the monorepo picker. The committed root `vercel.json` only adds an `ignoreCommand` so Vercel skips rebuilding when a push only touches `backend/` or `docs/`.
3. Framework preset: Next.js (auto-detected).
4. Add every env var from §1's "Vercel project env vars" table under Project Settings → Environment Variables (Production + Preview).
5. Deploy. Vercel auto-deploys on every push to `main` (production) and every PR (preview).
6. Once you have the Vercel URL, come back and set `CLIENT_URL` in Railway (§5) to it — CORS on the API only allows that one origin.
7. Add a custom domain under Project Settings → Domains, then update `NEXT_PUBLIC_APP_URL`/`AUTH_URL` to match and redeploy.

---

## 5. Railway deployment (`backend`)

1. [railway.app/new](https://railway.app/new) → Deploy from GitHub repo → select this repo.
2. Railway will detect `railway.json` at the repo root, which points it at `backend/Dockerfile` with a Dockerfile build. Leave the service's **Root Directory** as `/` (repo root) — the Dockerfile needs the full monorepo as build context.
3. Settings → Networking → Generate Domain (gives you the public `https://…railway.app` URL — this is your `NEXT_PUBLIC_API_URL`/`API_URL` for Vercel).
4. Add every `backend` env var from §1 under Variables. Do **not** set `PORT` — Railway injects its own and the server already reads `process.env.PORT`.
5. Deploy. Railway auto-deploys on every push to `main`.
6. Health check: Railway pings `/health` (configured in `railway.json`) — a container that fails this repeatedly gets marked unhealthy and rolled back automatically.

---

## 6. Supabase (PostgreSQL)

1. [supabase.com/dashboard](https://supabase.com/dashboard) → New project. Pick a region close to Railway's (reduces latency between API and DB).
2. Project Settings → Database → Connection string:
   - Copy the **Transaction pooler** string (port `6543`) → `DATABASE_URL`.
   - Copy the **Direct connection** string (port `5432`) → `DIRECT_URL`.
   - Both use the same password — the one you set when creating the project (or reset it here).
3. Run the schema against it once Railway has the env vars (or from your machine with the same `DATABASE_URL`/`DIRECT_URL` exported locally):
   ```bash
   pnpm --filter backend db:deploy
   ```
   This runs `prisma migrate deploy` — applies committed migrations without generating new ones, the correct command for production.
4. Optional: Supabase's dashboard SQL editor works fine for one-off inspection, but treat migrations as the source of truth — don't hand-edit the schema there.

---

## 7. Google Maps

1. [console.cloud.google.com](https://console.cloud.google.com) → create/select a project → APIs & Services → Library → enable **Maps JavaScript API**, **Directions API**, **Distance Matrix API** (all three — used for vendor location, directions, and delivery ETA).
2. APIs & Services → Credentials → Create API key.
3. **Restrict it** (Credentials → the key → Application restrictions → HTTP referrers): add your production domain and `localhost:3000` for local dev. Skipping this lets anyone who reads your page source use your key on their own site.
4. Set `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` in Vercel to this key. It's intentionally public (`NEXT_PUBLIC_`) — that's how the Maps JS SDK works; the HTTP-referrer restriction is what actually protects it.

---

## 8. Paystack

1. [dashboard.paystack.com](https://dashboard.paystack.com) → Settings → API Keys & Webhooks.
2. Copy the **Secret Key** → `PAYSTACK_SECRET_KEY` in Railway. Copy the **Public Key** → `PAYSTACK_PUBLIC_KEY` (kept server-side too — nothing in `frontend` reads it directly; the API returns Paystack's own hosted checkout URL).
3. Same page → **Webhooks** → add `https://<your-railway-domain>/api/v1/payments/paystack/webhook`. Paystack signs every webhook with your secret key (HMAC SHA-512 over the raw body) — the controller verifies this signature before trusting a payload, so no separate webhook secret is needed.
4. Use **Test mode** keys until you're ready to go live; switching to live keys later is a Railway env var change, nothing in code.

---

## 9. Flutterwave

1. [app.flutterwave.com](https://app.flutterwave.com) → Settings → API.
2. Copy the **Secret Key** → `FLUTTERWAVE_SECRET_KEY`, the **Encryption Key** → `FLUTTERWAVE_ENCRYPTION_KEY`.
3. Same page → **Webhooks**: set the URL to `https://<your-railway-domain>/api/v1/payments/flutterwave/webhook`, and set a **Secret Hash** (any strong random string you choose) → also put that value in `FLUTTERWAVE_WEBHOOK_HASH`. Flutterwave echoes this hash back in the `verif-hash` header on every webhook call, and the controller rejects anything that doesn't match.
4. Test mode first, same as Paystack — swap to live keys via env vars when ready.

---

## 10. Cloudinary

Used for signed image uploads — the API generates a short-lived signature (`POST /api/v1/uploads/signature`, requires a logged-in user) so the browser can upload directly to Cloudinary without the API secret ever reaching the client.

1. [cloudinary.com/console](https://cloudinary.com/console) → the dashboard shows **Cloud name**, **API Key**, **API Secret** right at the top.
2. Set `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` in Railway.
3. Nothing to configure on the `frontend` side — the signature endpoint returns the cloud name and API key alongside the signature, so the client never needs its own Cloudinary env vars.
4. Uploads are signed into one of four allow-listed folders (`nexora/review-photos`, `nexora/product-images`, `nexora/shop-logos`, `nexora/vendor-documents`) — see `backend/controllers/uploads.controller.ts` if you need to add another.

---

## Go-live checklist

- [ ] `backend` and `frontend`'s `INTERNAL_API_SECRET` values match exactly
- [ ] `backend`'s `VAPID_PUBLIC_KEY` matches `frontend`'s `NEXT_PUBLIC_VAPID_PUBLIC_KEY` exactly
- [ ] `CLIENT_URL` on Railway is the real Vercel production domain (CORS will silently block requests otherwise)
- [ ] `NEXT_PUBLIC_API_URL`/`API_URL` on Vercel point at the real Railway domain
- [ ] Paystack and Flutterwave webhook URLs are registered and pointed at the Railway domain
- [ ] Paystack/Flutterwave/Google Maps keys switched from test → live/production and restricted (Google Maps HTTP referrer restriction, in particular)
- [ ] `pnpm --filter backend db:deploy` has been run against the real Supabase database
- [ ] GitHub branch protection on `main` requires the CI status check
- [ ] A fresh signup → login → browse → checkout → order-tracking pass on the live domain, not just localhost
