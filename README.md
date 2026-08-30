# CondoPay v2 (Tier 1)

Digital rent management platform — **React + Express + PostgreSQL + JWT**.

The previous Firebase MVP lives in [`legacy/`](legacy/) for reference only.

## What Tier 1 includes

| Layer | Tech |
|-------|------|
| Frontend | React 19, TypeScript, Vite, Tailwind, React Router |
| Backend | Node, Express, TypeScript |
| Database | PostgreSQL (Docker locally) |
| Auth | JWT (Bearer token in `localStorage`) |

**Core flows:** register tenant → pending status → admin approves → first rent invoice is created → tenant/admin view invoices. Active tenants can also submit maintenance requests, and admins can track them through resolution.

**UX:** light/dark mode, persistent zoom controls with inline guidance, accessible form feedback, password visibility and strength checks, sortable/paginated invoices, and tenant search.

**Deployment:** Vercel frontend + Render API/PostgreSQL.

**Not in Tier 1 yet:** real payment processing, email notifications, Prisma, Zod, or TanStack Query.

**Deploy:** See [`DEPLOY.md`](DEPLOY.md) — Vercel (web) + Render (API + DB).

## Project layout

```text
condopay/
  apps/
    web/          # React UI (port 5173)
    api/          # REST API (port 4000)
  legacy/         # Old Firebase app (archived)
  docker-compose.yml
  package.json    # npm workspaces
```

## Quick start

### 1. Prerequisites

- Node.js 20+
- Docker Desktop (for Postgres)

### 2. Install

```bash
npm install
```

### 3. Environment

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
```

Edit `apps/api/.env` if needed (defaults match `docker-compose.yml`).

### 4. Database

```bash
npm run db:up
npm run db:migrate
npm run db:seed
```

### 5. Run

Start each app in a separate terminal:

```bash
npm run dev:api
npm run dev:web
```

- Web: http://localhost:5173
- API health check: http://localhost:4000/health

### Demo logins (after seed)

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@demo.condopay.com` | `Demo123!` |
| Tenant | `tenant@demo.condopay.com` | `Demo123!` |

## API endpoints (Tier 1)

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| GET | `/health` | — | Health + DB check |
| POST | `/api/auth/register` | — | Tenant signup + lease (strong password required) |
| POST | `/api/auth/login` | — | Login → JWT |
| GET | `/api/auth/me` | Bearer | Current user |
| GET | `/api/tenants` | Admin | List tenants |
| PATCH | `/api/tenants/:id/status` | Admin | Approve / deactivate; approval creates first invoice |
| GET | `/api/invoices/mine` | User | Tenant: own invoices; Admin: all |
| GET | `/api/maintenance/mine` | User | Maintenance requests |
| POST | `/api/maintenance` | Active tenant | Submit maintenance request |
| PATCH | `/api/maintenance/:id/status` | Admin | Update maintenance status |

## Deploy to production

See **[DEPLOY.md](DEPLOY.md)** for step-by-step Vercel + Render setup.

## What we removed / archived

| Before | Now |
|--------|-----|
| `frontend/` (CRA + Firebase) | `legacy/frontend-firebase/` |
| `backend/` (empty Express manifest) | `legacy/backend-stub/` |

You can delete `legacy/` when you no longer need the old UI as reference.

## Next (Tier 2+)

- Stripe Checkout + webhook-driven payment status
- Email notifications for approvals, invoices, and maintenance updates
- API input validation and automated end-to-end tests
- httpOnly cookie sessions and auth rate limiting
- Prisma and TanStack Query (optional refactors)
- AWS / Redis (only when scale requires them)
