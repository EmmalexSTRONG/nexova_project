# API Reference

Express REST API, mounted at `http://localhost:4000/api/v1` in development.
All responses follow `{ success: true, data }` or
`{ success: false, error: { code, message, details? } }`.

## Route groups

| Mount | Status | Purpose |
|---|---|---|
| `/auth` | Implemented | Registration, login, sessions, email verification, password reset — see [Authentication](#authentication) below |
| `/vendor-applications` | Implemented | Self-service vendor onboarding: send verification email, activate account after subscription payment |
| `/payments` | Implemented | Paystack (incl. MTN Mobile Money direct charge), Flutterwave — initialize, verify, webhooks |
| `/orders` | Implemented | Order-confirmation and status-update notification dispatch |
| `/bookings` | Implemented | Service booking confirmation notifications |
| `/notifications` | Implemented | Unified multi-channel dispatch (email, SMS, WhatsApp, Web Push) |
| `/chat` | Implemented | OpenAI-backed shopping assistant proxy |
| `/uploads` | Implemented | Cloudinary signed-upload URL issuance |
| `/cart`, `/categories`, `/products`, `/reviews`, `/users`, `/vendors`, `/webhooks` | Scaffolded, not wired | Route folders exist for these domains but have no mounted handlers yet — most of the storefront's product/category/cart/review data is served from the frontend's own localStorage-backed stores rather than these endpoints (see [requirements.md](./requirements.md#hybrid-data-architecture)) |

Endpoints under `internalOnly` middleware (payments, notifications,
vendor-applications) are only ever called server-to-server, from the
Next.js server's Server Actions — never directly from a browser.

## Vendor self-registration & subscription

`POST /vendor-applications/send-verification` — sends the applicant a
verification email (internal-only, rate-limited).

`POST /vendor-applications/activate` — called once a subscription payment
has been confirmed successful. Creates the real `User` + `VendorProfile`
(skips the standalone email-verification step since the applicant already
verified through the application flow), sends a payment receipt and
welcome email, and returns a temporary password so the caller can sign
the vendor in immediately. If a payment never succeeds, this endpoint is
never called — there is no account and no way to log in.

`POST /payments/paystack/charge-mobile-money` — direct Paystack Mobile
Money charge (MTN), no hosted-checkout redirect. Pair with the existing
`GET /payments/paystack/verify/:reference`, polled client-side, since
there's no callback URL for this flow to return through.

## Authentication

**Express (`backend`) is the single source of truth for authentication.**
It owns password hashing, JWT issuance, refresh-token/session storage, email
verification, and password reset — for every login path, including OAuth.

**NextAuth v5 (`frontend`) is a thin session/cookie layer on top of it.** It
handles the browser-facing concerns NextAuth is genuinely good at (encrypted
httpOnly session cookie, CSRF protection, the OAuth redirect/callback/state
dance for Google and Facebook) and, on every sign-in, calls Express to get
back real access/refresh tokens. Those tokens are embedded in NextAuth's own
encrypted JWT cookie — never exposed to client-side JS — so Next.js server
code (Server Components, Server Actions, Route Handlers) can attach
`Authorization: Bearer <accessToken>` when calling Express for business data.

This gives one consistent user record (`users` table) and one consistent
auth policy regardless of whether someone signs up with a password or with
Google/Facebook, while still letting the Express API be called directly by
non-browser clients (mobile apps, `curl`, Postman) using the same JWTs.

```
Browser ──(cookie)── Next.js server ──(Bearer JWT)── Express API ──(Prisma)── Postgres
                            │
                            └─ NextAuth: cookie/session/OAuth handshake only
```

### Token model

- **Access token**: JWT (HS256), 15 minutes, stateless — verified by Express
  middleware without a DB round-trip. Payload: `{ sub, email, role }`.
- **Refresh token**: opaque random 256-bit value, **not** a JWT. Only its
  SHA-256 hash is stored, in `refresh_tokens` (see
  [database.md](./database.md)). One row = one active
  session/device. This is what makes "Session Management" possible — you
  cannot revoke a stateless JWT, but you can revoke a DB row.
- **Rotation + reuse detection**: every `/auth/refresh` call revokes the old
  refresh token and issues a new one (`replacedBy` links them for audit).
  If a *revoked* token is ever presented again, every session for that user
  is killed immediately — that pattern only happens if a refresh token was
  stolen and used after the legitimate client already rotated it.
- **Password reset**: resetting a password revokes all of that user's
  refresh tokens, forcing re-authentication everywhere.

Verification and reset tokens (`email_verification_tokens`,
`password_reset_tokens`) follow the same rule: only a hash is ever
persisted; the raw token exists solely in the emailed link.

### Remember me

`rememberMe` is threaded through: form → NextAuth `authorize()` → Express
`/auth/login`. Express uses it to pick the refresh token's DB expiry (7
days vs. 30). On the NextAuth side, the `jwt` callback sets the JWT's `exp`
claim explicitly — 1 day if unchecked, 30 days if checked — which
overrides the cookie's default lifetime. Note the browser cookie's
`Max-Age` is still set to the 30-day ceiling either way; what actually
changes is the token's embedded expiry, which NextAuth checks on every
request. Net effect: unchecking "remember me" gets you signed out after a
day even though the cookie technically lives longer in the browser.

### Email verification

Registration always sends a verification email, but **login is never
blocked on it** — `emailVerified: false` is returned to the client so the
UI can show a banner/reminder. This is a deliberate choice:
mandatory-verification-before-login is friendlier to skip for a
marketplace where browsing/buying shouldn't be gated behind an email
round-trip, while vendor *selling* is already gated by a separate,
stricter mechanism — `VendorProfile.status` starts at `PENDING` and
requires admin approval regardless of email verification. Vendors who
sign up through the self-service onboarding flow (see above) are the one
exception: their account isn't created at all until their email is
verified *and* their subscription payment succeeds.

### Role-based access

- **Express**: `authenticate` middleware verifies the JWT and attaches
  `req.user`; `authorize(...roles)` checks `req.user.role`.
- **Next.js**: `middleware.ts` (repo root) reads the NextAuth session and
  enforces route prefixes: `/admin/*` → `ADMIN`/`SUPER_ADMIN`, `/vendor/*` →
  `VENDOR`, `/account/*` → any authenticated role. `/admin/login` is
  explicitly excluded so admins can reach the login form.
- Admin login uses a **separate** NextAuth provider (`admin-credentials`)
  that calls Express's `/auth/admin/login` — a distinct endpoint with a
  stricter rate limit (5/15min vs 10/15min) that rejects non-admin roles
  at the API layer too, not just in the UI.

### Endpoints (`backend`, mounted at `/api/v1/auth`)

| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/register/customer` | — | Create a CUSTOMER user, auto-login |
| POST | `/register/vendor` | — | Create a VENDOR user + `PENDING` VendorProfile, auto-login |
| POST | `/login` | — | Email/password login (any role) |
| POST | `/admin/login` | — | Email/password login, rejects non-admin roles |
| POST | `/refresh` | — (refresh token in body) | Rotate access + refresh token |
| POST | `/logout` | — (refresh token in body) | Revoke one session |
| POST | `/logout-all` | Bearer | Revoke every session for the caller |
| GET | `/me` | Bearer | Current user profile |
| POST | `/sessions` | Bearer | List active sessions/devices |
| DELETE | `/sessions/:id` | Bearer | Revoke a specific session |
| POST | `/verify-email` | — | Consume an email verification token |
| POST | `/resend-verification` | — | Re-send verification email (silent no-op if already verified) |
| POST | `/forgot-password` | — | Request a reset email (silent no-op if email unknown) |
| POST | `/reset-password` | — | Consume a reset token, revokes all sessions |
| POST | `/oauth/upsert` | Internal secret only | Called by the Next.js server after a Google/Facebook handshake |

### Frontend pages (`frontend`)

`/login`, `/register` (chooser), `/register/customer`, `/register/vendor`,
`/admin/login`, `/forgot-password`, `/reset-password`, `/verify-email`, and
post-auth landing pages `/account`, `/vendor/dashboard`, `/admin/dashboard`
(the last of which also demonstrates session listing/revocation).

### Security notes / what's intentionally out of scope

- Passwords hashed with bcrypt (cost 12); a constant-time dummy-hash
  compare runs even when the email doesn't exist, so login timing doesn't
  leak account existence.
- `forgot-password` and `resend-verification` always return a generic
  success response regardless of whether the account exists, to prevent
  user enumeration.
- Rate limiting is per-IP via `express-rate-limit` (in-memory). For a
  multi-instance deployment, swap in a Redis store.
- No account lockout after N failed attempts yet — rate limiting is the
  only brute-force mitigation currently in place.
- 2FA/MFA is not implemented.
- `next build` prints an Edge Runtime warning about `jose`'s
  `CompressionStream`/`DecompressionStream` usage, reached via
  `@auth/core`'s JWT decode path (which `middleware.ts` needs for every
  request). This is inherent to using NextAuth v5's JWT session strategy
  in Edge middleware at all — it's not specific to our providers, JWE
  compression is off by default so the code path never actually executes,
  and it's a widely-reported upstream warning, not an error. Build output
  and all routes generate correctly regardless.
