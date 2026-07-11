# PetID Tags

A web app for NFC pet ID tags: each physical tag links to a unique profile page where a found pet's photo, description, and owner's phone number are shown to whoever scans it.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm --filter @workspace/petid run dev` — run the PetID frontend
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string
- Object storage env: `DEFAULT_OBJECT_STORAGE_BUCKET_ID`, `PRIVATE_OBJECT_DIR`, `PUBLIC_OBJECT_SEARCH_PATHS`

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)
- Frontend: React + Vite (`artifacts/petid`), wouter router, react-query, shadcn/radix UI
- Object storage: Google Cloud Storage via Replit's App Storage sidecar

## Where things live

- API contract: `lib/api-spec/openapi.yaml` (source of truth; run codegen after editing)
- DB schema: `lib/db/src/schema/pets.ts`
- Pet endpoints: `artifacts/api-server/src/routes/pets.ts`
- Object storage endpoints: `artifacts/api-server/src/routes/storage.ts`
- PIN hashing: `artifacts/api-server/src/lib/pin.ts`; brute-force lockout: `artifacts/api-server/src/lib/pinRateLimit.ts`
- Frontend pages: `artifacts/petid/src/pages` (home + `/tag/:id` core page)

## Architecture decisions

- **No user accounts/auth.** Access model is public-link + a per-tag PIN. Anyone with the tag's URL can view the profile; only the PIN unlocks editing. This matches the domain (anyone can scan a physical tag) and was a deliberate choice not to add Replit Auth/Clerk.
- **Claim is a one-time, atomic lock.** `POST /pets/:tagId/claim` updates the row only if `claimed=false` in the same statement, preventing two concurrent claims from both succeeding.
- **PIN brute-force protection.** `verify-pin` and the `PATCH` (edit) endpoint lock out a tag+IP pair for 5 minutes after 5 failed attempts within a 5-minute window (in-memory, single-instance).
- **Photo upload endpoint is intentionally unauthenticated** (no account system), but restricted server-side to `image/*` content types under 10MB to limit abuse of the open endpoint.
- **Tag ids** are short (8-char), unambiguous-alphabet random strings meant to be embedded directly in the URL written to the physical NFC tag.

## Product

- Home page: create a new blank tag (generates a unique link for a physical NFC tag) or jump to an existing tag by id/URL. Recently created tags persist in the browser's `localStorage` for convenience.
- `/tag/:tagId`: unclaimed tags show a setup form (photo, name, species, breed, description, owner contact, PIN) that locks the profile on submit. Claimed tags show a read-only public profile with a tap-to-call owner button, and an "Owner? Unlock to edit" affordance that PIN-gates an edit form.

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- Any change to `lib/api-spec/openapi.yaml` requires re-running `pnpm --filter @workspace/api-spec run codegen` before the generated hooks/schemas reflect it.
- Font `@import` in `index.css` must come before the Tailwind `@import` statements or Vite's CSS processor errors.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
