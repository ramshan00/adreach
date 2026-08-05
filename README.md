# Adreach TikTok Seminar 2026

Production-ready event registration landing page and personalized 1080×1080  image generator built with Next.js, Neon PostgreSQL, Drizzle ORM, and browser-only photo cropping.

## Local setup

1. Install Node.js 20.9 or newer and run `npm install`.
2. Copy `.env.example` to `.env.local`.
3. Set `DATABASE_URL` to a Neon pooled PostgreSQL connection string.
4. Run `npm run db:migrate`, then `npm run dev` and open `http://localhost:3000`.

The project can lint, type-check, test, and build without database credentials. Registration requires a configured database at runtime.

## Neon and Drizzle

Create a project at Neon, copy its pooled connection string from the Connect panel, and place it in `DATABASE_URL`. Keep this value server-only.

- `npm run db:generate` creates a migration after schema changes.
- `npm run db:migrate` applies pending migrations.
- `npm run db:studio` opens Drizzle Studio.

For production, point your local environment temporarily at the production Neon database and run `npm run db:migrate` once during deployment. Do not generate migrations in production.

## Commands

- `npm run dev` — local development
- `npm run lint` — ESLint
- `npm run typecheck` — strict TypeScript check
- `npm test` — unit tests
- `npm run test:e2e` — Playwright UI, form, cropper, console, screenshot, and responsive tests
- `npm run build` / `npm start` — production build and server

## Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | Runtime registration | Neon PostgreSQL pooled connection string |
| `NEXT_PUBLIC_SITE_URL` | Production | Canonical deployment origin, such as `https://event.example.com` |
| `NEXT_PUBLIC_EVENT_SLUG` | Optional | Defaults to `adreach-tiktok-seminar-2026` |

## Brand assets

Add the supplied files at `public/brand/adreach-logo-light.png`, `public/brand/adreach-logo-dark.png`, `public/brand/adreach-icon.png`, `public/reference/seminar-design-reference.jpeg`, and `public/reference/brand-guidelines.pdf`. Missing optional assets do not prevent compilation; the interface includes a text logo fallback.

## Vercel deployment

Import the repository in Vercel, keep the Next.js defaults, add the environment variables for Production and Preview, deploy, and apply the migration to the same Neon database. Set `NEXT_PUBLIC_SITE_URL` before the final production build so canonical URLs, robots, sitemap, and structured data use the public origin.

## Manual test checklist

- Confirm all accepted Pakistani mobile formats save as `+923XXXXXXXXX`.
- Confirm a duplicate email shows a friendly message and does not unlock export.
- Upload each supported image type; test 5 MB rejection, crop, zoom, reset, and replace.
- Confirm network requests and the database contain text fields only—never photograph data.
- Test live updates, a blank designation, and an 80-character name.
- Download and inspect an opaque 1080×1080 PNG; test native file sharing on a supported mobile device.
- Check keyboard navigation, validation announcements, reduced motion, and widths from 360px to 1440px.
- Check the console for runtime, hydration, and image errors after final brand assets are installed.
"# addreach" 
