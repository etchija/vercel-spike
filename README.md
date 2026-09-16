# vercel-spike — LCC-3046 capstone D

Personal Next.js 15 App Router spike for Dashboard 2.0. Piece D: progress bar + breakdown modal, climbed the backend-first ladder (Stages A–C).

Production: [https://vercel-spike-virid.vercel.app/progress](https://vercel-spike-virid.vercel.app/progress)

## Run locally

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000/progress](http://localhost:3000/progress).

Optional `.env.local` (gitignored):

| Name | What |
| --- | --- |
| `DATABASE_URL` | Neon/Postgres. Unset → in-memory prefs (`store memory`). |
| `BACKEND_ORIGIN` | Other Vercel origin, no trailing slash. Unset → progress mocks run in-process. Changing this needs a **rebuild**. |
| `NEXT_PUBLIC_SPIKE_STAGE` | Preview vs production label. Read only from `src/lib/config/env.ts`. |
| `SPIKE_DIST_ID` | Default `1000001`. |

Do not put `DATABASE_URL` on the personal Hobby project.

Demo query flags: `?fail=volume` · `?fail=rank` · `?empty=1`

## Boundary decision

The **bar** is a Server Component. It only displays rank, percent, and volume. No clicks, no hooks.

The **breakdown** is a client component (`breakdown-modal.tsx`). It needs `showModal()` / focus on a `<dialog>`.

`'use client'` is the entry to that client graph, not “how we refresh data.” Prefs and progress are loaded on the server (`loadCachedPreferences`, `loadProgress`). The hide-empty **write** is a form: `POST /api/preferences` (Save) or a Server Action (Save without revalidate).

Member-like numbers (rank / volume / requirements) are **not** dashboard Postgres. They are aggregated mocks (Stage A) or the other origin (Stage C). The SDK is not used here and must not be imported in a route handler or Server Component.

## Repository seam

`getPreferences` / `savePreferences` in `src/lib/progress/preferences-repo.ts`.

Handlers and the page never talk to the `Map` or to `pg` directly. Stage B swapped the body to SQL (`progress_preferences`) when `DATABASE_URL` is set. Signatures stayed the same.

That is dashboard-owned data (arch §6.2 user config). It is not PO3 member volume.

## Aggregation and Stage C

`GET /api/progress` fans out to three mocks (rank ~80ms, volume ~250ms, requirements ~400ms) with `Promise.allSettled`. One failure sets `degraded` and the rest still return.

`next.config.ts` rewrites `/backend/:path*` → `$BACKEND_ORIGIN/api/:path*` at **build** time (or to this app’s `/api` when unset). A copy of the progress API lives in `backend-origin/` and is deployed as its **own** Vercel project (root directory `backend-origin`). That is the fake PO3. We do **not** rewrite to `int3-po3.doterra.com`.

The page does **not** HTTP-fetch itself. Locally it calls `aggregateProgress` in-process. On Vercel it calls `BACKEND_ORIGIN` server-to-server. The browser can still hit `/backend/progress` on this origin (same-origin; no preflight). Changing the destination is a redeploy, not an env edit + refresh.

## What changes when mocks become real

| Seam | Becomes |
| --- | --- |
| `preferences-repo` | Already Postgres locally. Team RDS later; same functions. |
| One `services.ts` mock | `fetch` from the route handler / `loadProgress` to local PO3 (`1004`) or RT (`1003`) with a forwarded token. Not the client SDK. |
| Stage C other origin | Same rewrite, destination a reachable non-prod host once LCC-3045 exists — still not a public int3 DNS name today. |

The `/progress` UI and the `getPreferences` / `loadProgress` shapes should not need a rewrite.

## Portability rule I was most tempted to break

**P5 / `VERCEL_URL`.** The page needed an absolute URL to call `/api` and `/backend`. The convenient fix was `process.env.VERCEL_URL` in the component (or a self-`fetch` to the incoming `Host`). That only exists on Vercel, and self-fetch deadlocked locally and can 401 on a protected preview.

The compliant fix: env only in `lib/config/env.ts`, progress from `BACKEND_ORIGIN` or in-process, rewrite destination in `next.config.ts` at build time. No `@vercel/*` storage (P1/P2). Node default, no `runtime = 'edge'` (P3).

## Stage C second project

1. Deploy this repo again with **Root Directory** `backend-origin`.
2. On the **main** project, set `BACKEND_ORIGIN` to that URL (Preview and/or Production).
3. Redeploy the main project.
