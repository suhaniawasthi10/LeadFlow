# LeadFlow

A single-screen lightweight CRM for tracking leads, logging discussions, and setting follow-up reminders. Built as an internship take-home.

## Live demo

🌐 **<https://lead-flow-henna.vercel.app>**

No setup needed — log in with the demo credentials below.

```
Email:    demo@leadflow.test
Password: demo1234
```

Deployed stack:

- **Frontend** on Vercel (Vite SPA on their CDN)
- **Backend** on Railway (Node + Express, built from `backend/Dockerfile`)
- **Database** on MongoDB Atlas (M0 free tier, pre-seeded with the demo user + 6 leads)

Deployment was a stretch goal beyond the brief — the spec only required a local-runnable app. The same code runs end-to-end locally with `docker compose up` (see Quick start below).

## Tech stack

| Layer | Stack |
|---|---|
| Frontend | React 19 + Vite + TypeScript, Tailwind v4, shadcn/ui (Base UI under the hood), TanStack Query, React Hook Form + Zod, date-fns, lucide-react, sonner |
| Backend | Node 22 + Express 5 + TypeScript, Mongoose 9, Zod, bcryptjs, jsonwebtoken |
| Database | MongoDB 7 |
| Tooling | Docker + Docker Compose, ESLint, Prettier |

## Demo credentials

Credentials shown above in the [Live demo](#live-demo) section. Same account works in local Docker / dev setups — created by the seed script. Each logged-in user only sees their own leads.

## Quick start with Docker

```bash
docker compose up --build
docker compose exec backend npm run seed:docker
# open http://localhost:5173
```

That's it. Three services come up: `mongodb` (port 27017), `backend` (port 3000), `frontend` (port 5173 served by nginx). The seed creates the demo user + 6 fixture leads.

## Manual setup (no Docker)

Requires Node 20+ and a running MongoDB on `localhost:27017`.

```bash
# Backend (one terminal)
cd backend
cp .env.example .env             # adjust if needed
npm install
npm run seed                     # populates DB with demo user + leads
npm run dev                      # → http://localhost:3000

# Frontend (another terminal)
cd frontend
cp .env.example .env             # adjust if needed
npm install
npm run dev                      # → http://localhost:5173
```

## Environment variables

| File | Variables | Purpose |
|---|---|---|
| `backend/.env` | `PORT`, `MONGO_URI`, `NODE_ENV`, `JWT_SECRET` | Backend server config |
| `frontend/.env` | `VITE_API_URL` | API base URL (defaults to `http://localhost:3000/api`) |

`.env.example` in each directory has the full list. None of these are real secrets — the dev `JWT_SECRET` is a placeholder. For production, generate a strong random value and inject it from a secret manager.

## Features

### Core (per the spec)
- **Lead list** with name, status badge, last-discussion preview, and "X ago" timestamp
- **Status filter pills** — All / New / Contacted / Qualified / Proposal Sent / Won / Lost
- **Today's Follow-ups** pinned section at the top of the list
- **Add new lead** dialog with inline validation (name required; company + phone optional)
- **Timeline dialog** — opens on lead-card click; shows full discussion history, lets you change status, and add a new note with an optional follow-up date + time
- **Cascade-on-write** — adding a discussion atomically updates the parent lead's denormalized `lastDiscussionNote` / `lastDiscussionAt` and (optionally) `followUpAt`

### Bonus
- **Search by name** — debounced 300ms
- **Overdue red border** — left edge of any card whose `followUpAt < today` and status ∉ {Won, Lost}
- **Follow-up filter dropdown** — Any / Today / Overdue / This week / No follow-up
- **Sort dropdown** — Recent activity / Name A–Z / Follow-up date (no-follow-up leads sort last)
- **Delete lead** — `…` actions menu → confirmation dialog → cascade-delete discussions
- **Empty states** — first-run (UserPlus + CTA) and filter-empty (Search + Clear filters)
- **Loading skeletons** with varied-width placeholders
- **Auth + per-user data scoping** — stretch goal beyond the spec; see [Auth section](#auth--stretch-goal-beyond-spec) below

## API endpoints

| Method | Path | Description | Auth |
|---|---|---|---|
| `GET` | `/api/health` | Health check | — |
| `POST` | `/api/auth/signup` | Create account → `{ user, token }` | — |
| `POST` | `/api/auth/login` | Verify credentials → `{ user, token }` | — |
| `GET` | `/api/auth/me` | Current user from JWT | required |
| `POST` | `/api/leads` | Create a lead | required |
| `GET` | `/api/leads` | List user's leads (filterable via query params) | required |
| `GET` | `/api/leads/:id` | Lead + its discussions | required |
| `PATCH` | `/api/leads/:id` | Partial update | required |
| `DELETE` | `/api/leads/:id` | Delete lead + cascade-delete discussions | required |
| `POST` | `/api/leads/:id/discussions` | Add discussion + cascade onto parent | required |

Query params on `GET /api/leads`:
- `status` — exact match (e.g., `Won`)
- `search` — case-insensitive name regex
- `filter` — one of `today`, `overdue`, `thisWeek`, `noFollowUp`
- `sort` — one of `recent` (default), `name`, `followUp`

## Project structure

```
leadflow/
├── backend/src/
│   ├── app.ts                    # createApp() — middleware + route mounting
│   ├── index.ts                  # bootstrap: connectDB → listen
│   ├── config/db.ts              # mongoose.connect wrapper
│   ├── middleware/
│   │   ├── auth.ts               # requireAuth (verifies JWT, sets req.userId)
│   │   └── errorHandler.ts       # central error handler + AppError class
│   ├── models/
│   │   ├── Lead.ts               # required userId + denormalized lastDiscussion*
│   │   ├── Discussion.ts         # leadId + note + optional followUpAt
│   │   └── User.ts               # email (unique) + passwordHash
│   ├── routes/{auth,leads,health}.ts
│   ├── controllers/              # thin HTTP adapters
│   ├── services/                 # business logic (cascade, scoping, filters)
│   ├── validators/               # Zod schemas — source of truth for input shapes
│   ├── types/lead.ts             # shared LeadStatus enum
│   └── scripts/seed.ts           # demo user + 6 fixture leads
│
├── frontend/src/
│   ├── App.tsx                   # auth gate + header + main
│   ├── main.tsx                  # QueryClientProvider + AuthProvider mount
│   ├── contexts/AuthContext.tsx  # user, login, signup, logout
│   ├── features/
│   │   ├── auth/AuthPage.tsx
│   │   └── leads/
│   │       ├── LeadList.tsx      # search + filters + sort + sections
│   │       ├── LeadCard.tsx
│   │       ├── StatusBadge.tsx
│   │       ├── AddLeadDialog.tsx
│   │       ├── TimelineDialog.tsx
│   │       └── ConfirmDialog.tsx
│   ├── hooks/                    # TanStack Query hooks + useDebouncedValue
│   ├── lib/
│   │   ├── api.ts                # axios instance + auth interceptors
│   │   ├── authApi.ts            # login / signup / me
│   │   ├── leadsApi.ts           # CRUD + boundary date parsing
│   │   ├── leadFilters.ts        # isOverdue / isFollowUpToday / …
│   │   └── utils.ts              # cn() helper
│   ├── types/lead.ts             # Lead, Discussion, LeadStatus
│   └── components/ui/            # shadcn primitives (treat as vendored)
│
├── docker-compose.yml
└── README.md
```

## Auth — stretch goal beyond spec

The original brief explicitly said "no login needed." I added auth as a stretch goal to:

1. Demonstrate working knowledge of JWT + bcrypt patterns
2. Make the data model genuinely **multi-tenant** — each user's leads are scoped via `userId`

Implementation:
- `POST /api/auth/signup` and `POST /api/auth/login` issue 7-day JWTs signed with HS256
- `requireAuth` middleware on every `/api/leads/*` route verifies the JWT and attaches `req.userId`
- **Every service method takes a `userId` and includes it in the DB query** — user A can never reach user B's lead, even with a guessed ID.
- **Cross-tenant access returns 404 instead of 403** — a 403 would confirm the resource exists in another user's account, which is an info leak.
- Seed script attaches all fixture leads to the demo user via `userId`
- Compound indexes `{userId, status}`, `{userId, followUpAt}`, `{userId, updatedAt: -1}` so every tenant-scoped query is index-served

## Security notes — JWT-in-localStorage trade-off

The frontend stores the JWT in `localStorage` and attaches it via an axios request interceptor. This is **adequate for an MVP** but **not what I'd ship to production**.

**The XSS risk**: any script running on the page can read the token. We render only known data (no user-supplied HTML / script), so the surface is small, but it's not zero.

**Production migration plan** when this graduates:

1. Backend issues the JWT as an `httpOnly` cookie on login:
   ```ts
   res.cookie('token', jwt, {
     httpOnly: true,
     secure: true,
     sameSite: 'lax',
     maxAge: 7 * 24 * 60 * 60 * 1000,
   });
   ```
2. Add `cookie-parser` middleware; `requireAuth` reads from `req.cookies.token` instead of the Authorization header
3. Frontend axios instance: `withCredentials: true` (token sent automatically; no JS access)
4. CORS pinned to a specific origin (can't combine `*` with credentials)
5. CSRF mitigation: `SameSite=Lax` for top-level navigation; double-submit cookie token for state-changing requests
6. Add `POST /api/auth/logout` that calls `res.clearCookie('token')` (currently logout is client-only — it clears localStorage)

This was scoped out of the MVP because the migration cost (~2 hours of refactor + a new CSRF surface to test) exceeds the benefit (~0 real XSS surface for a take-home with no user-generated HTML rendering) — but it's the first thing I'd do before going to production.

## Other architectural decisions worth defending

- **Denormalization of `lastDiscussion*` onto `Lead`** — avoids N+1 or `$lookup` on every list render. Cost: write amplification on discussion-create. Accepted because reads dominate.
- **Sequential writes (no transactions)** for the discussion cascade — single-node Mongo doesn't support multi-document transactions without a replica set. Documented as an explicit trade-off; in production with a replica set I'd wrap with `mongoose.startSession()` + `session.withTransaction()`.
- **TanStack Query for server state** — `invalidateQueries` on mutation lets the UI auto-sync without manual state plumbing.
- **Server-side filter / search / sort** — client-side filtering would still require fetching every lead, defeating the index. Backend speaks domain language (`filter=overdue`) at the API boundary; mongo dialect doesn't leak past the service layer.
- **Zod twice (frontend + backend)** — backend Zod is the contract (authoritative); frontend Zod is UX (instant inline feedback before the network round-trip). One-line schema duplication is the cost; better UX is the benefit.

## AI usage disclosure

Built with assistance from Claude (Anthropic) for boilerplate, debugging, and code review across the project. Architecture and feature decisions were mine — including:

- The denormalization of `lastDiscussion*` onto the Lead document
- The decision to add auth as a stretch goal beyond the spec
- The JWT-in-localStorage trade-off and its documented migration path
- Multi-tenant scoping at the service layer (rather than as middleware filters), so the data contract enforces it
- The decision to deploy (Vercel + Railway + Atlas) as a second stretch goal
- UI decisions: Linear/Attio aesthetic, pure-black primary accent, status badge palette deviating from the wireframe's greens, "…" actions menu over an adjacent trash icon

Claude assisted with implementation details, refactors, a curl-based test suite I used to verify the auth + multi-tenant security boundaries, and debugging deploy issues (Railway's `dockerfile:1` buildkit stall, Vercel's multi-service auto-detection).

## License

Take-home assignment, not licensed for redistribution. Code is available for evaluation only.
