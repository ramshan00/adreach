# Adreach TikTok Seminar 2026

Event registration page and personalized 1080×1080 image generator built with Next.js, Neon PostgreSQL, Drizzle ORM, and browser-only photo cropping.

## Dual deployment

| Target | Mode | URL | Registration API |
| --- | --- | --- | --- |
| **Local** | `next dev` (server) | `http://localhost:3000/` | same-origin `/api/register/` |
| **Vercel** | Full Next.js server | `https://adreach-psi.vercel.app/` | same-origin `/api/register/` |
| **Hostinger** | Static export (`NEXT_STATIC=true`, `basePath=/seminar`) | `https://adreach.agency/seminar/` | `NEXT_PUBLIC_API_URL` + `/api/register/` |

`/seminar` is used **only** for the Hostinger static build. Vercel and local have **no** `basePath`. The API path is always `/api/register/` (never `/seminar/api/register/`).

## Local setup

1. Install Node.js 20.9 or newer and run `npm install`.
2. Copy `.env.example` to `.env.local`.
3. Set `DATABASE_URL` to a Neon pooled PostgreSQL connection string.
4. Leave `NEXT_PUBLIC_API_URL` unset so the form posts to the local API.
5. Run `npm run db:migrate` (or `npm run db:push` for a quick local sync), then `npm run dev` and open `http://localhost:3000`.

**Security note:** If a real database password was ever committed in `.env.example`, rotate that Neon credential immediately.

## Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | Vercel + local API | Neon PostgreSQL pooled connection string (server-only) |
| `NEXT_PUBLIC_SITE_URL` | Each build | Canonical site URL for that deploy |
| `NEXT_PUBLIC_EVENT_SLUG` | Optional | Defaults to `adreach-tiktok-seminar-2026` |
| `NEXT_PUBLIC_API_URL` | Hostinger static build | API **origin only** (no path), e.g. `https://adreach-psi.vercel.app`. Leave unset on local and Vercel. |
| `ALLOWED_ORIGINS` | Vercel API | CORS origins only (no paths), e.g. `https://adreach.agency` |
| `NEXT_STATIC` | Hostinger build only | Set to `true` only via `npm run build:hostinger` |

### Hostinger static build env

```
NEXT_STATIC=true
NEXT_PUBLIC_SITE_URL=https://adreach.agency/seminar
NEXT_PUBLIC_API_URL=https://adreach-psi.vercel.app
```

### Vercel server env

```
NEXT_PUBLIC_SITE_URL=https://adreach-psi.vercel.app
DATABASE_URL=...
ALLOWED_ORIGINS=https://adreach.agency
```

Do **not** set `NEXT_STATIC=true` or `NEXT_PUBLIC_API_URL` on Vercel (same-origin `/api/register/`).

## Neon and Drizzle

- `npm run db:generate` — create a migration after schema changes.
- `npm run db:migrate` — apply SQL migrations from `drizzle/` via `src/db/migrate.ts` (safe for fresh DBs; do not invent new schema changes casually against production).
- `npm run db:push` — push schema directly with Drizzle Kit (convenient for local/dev; avoid careless use on production).
- `npm run db:studio` — Drizzle Studio.

Do not generate migrations in production. Apply migrations intentionally against the target database.

## Commands

- `npm run dev` — local development (no basePath)
- `npm run build` — Vercel/server production build
- `npm run build:hostinger` — static export for Hostinger (`out/`); upload the **contents** of `out/` into Hostinger `/seminar/` (URLs already include the `/seminar` base path)
- `npm start` — run the server build
- `npm run lint` / `npm run typecheck` / `npm test` / `npm run test:e2e`

## Manual test checklist

- Confirm all accepted Pakistani mobile formats save as `+923XXXXXXXXX`.
- Confirm a duplicate email shows a friendly message and does not unlock export.
- Upload each supported image type; test 5 MB rejection, crop, zoom, reset, and replace.
- Confirm network requests and the database contain text fields only—never photograph data.
- Test live updates, a blank designation, and an 80-character name.
- Download and inspect an opaque 1080×1080 PNG.
- Check keyboard navigation, validation announcements, and widths from 360px to 1440px.
