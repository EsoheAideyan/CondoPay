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

**Flows:** register tenant → pending status → admin approves → tenant/admin see invoices (seeded demo data).

**Not in Tier 1 yet:** Stripe, Prisma, TanStack Query, deploy to Vercel/Render.

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

```bash
npm run dev
```

- Web: http://localhost:5173  
- API: http://localhost:4000/health  

### Demo logins (after seed)

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@demo.condopay.com` | `Demo123!` |
| Tenant | `tenant@demo.condopay.com` | `Demo123!` |

## API endpoints (Tier 1)

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| GET | `/health` | — | Health + DB check |
| POST | `/api/auth/register` | — | Tenant signup + lease |
| POST | `/api/auth/login` | — | Login → JWT |
| GET | `/api/auth/me` | Bearer | Current user |
| GET | `/api/tenants` | Admin | List tenants |
| PATCH | `/api/tenants/:id/status` | Admin | Approve / deactivate |
| GET | `/api/invoices/mine` | User | Tenant: own invoices; Admin: all |

## What we removed / archived

| Before | Now |
|--------|-----|
| `frontend/` (CRA + Firebase) | `legacy/frontend-firebase/` |
| `backend/` (empty Express manifest) | `legacy/backend-stub/` |

You can delete `legacy/` when you no longer need the old UI as reference.

## Next (Tier 2+)

- Stripe Checkout + webhooks  
- Deploy: Vercel (web) + Render (API + DB)  
- Prisma, Zod, TanStack Query  
- AWS / Redis (optional Tier 3)
