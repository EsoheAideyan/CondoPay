# Deploy CondoPay (Vercel + Render)

**Frontend:** Vercel (static React app)  
**Backend + DB:** Render (Node API + managed PostgreSQL)

Estimated time: ~20 minutes.

---

## Prerequisites

- GitHub repo pushed (`main` branch)
- [Vercel](https://vercel.com) account (free)
- [Render](https://render.com) account (free)

---

## Step 1 — Deploy API + database on Render

1. Go to [Render Dashboard](https://dashboard.render.com) → **New** → **Blueprint**
2. Connect your GitHub repo (`CondoPay`)
3. Render reads `render.yaml` and creates:
   - **condopay-db** — PostgreSQL
   - **condopay-api** — Web service
4. Click **Apply** and wait for the first deploy (~5–10 min on free tier)
5. When done, open **condopay-api** → copy the URL, e.g.  
   `https://condopay-api.onrender.com`
6. Test: open `https://condopay-api.onrender.com/health`  
   You should see `{"status":"ok","database":"connected"}`

### Seed demo data (one time)

In Render → **condopay-api** → **Shell**:

```bash
npm run db:seed -w @condopay/api
```

Demo logins: `admin@demo.condopay.com` / `tenant@demo.condopay.com` — password `Demo123!`

---

## Step 2 — Deploy frontend on Vercel

1. Go to [Vercel Dashboard](https://vercel.com/new)
2. **Import** your GitHub repo
3. Configure the project:

| Setting | Value |
|---------|--------|
| **Framework Preset** | Vite |
| **Root Directory** | `apps/web` |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |

4. **Environment variables** (required before first build):

| Name | Value |
|------|--------|
| `VITE_API_URL` | `https://condopay-api.onrender.com` (your Render API URL, no trailing slash) |

5. Click **Deploy**
6. Copy your Vercel URL, e.g. `https://condopay.vercel.app`

---

## Step 3 — Connect CORS (API ↔ frontend)

1. Render → **condopay-api** → **Environment**
2. Add or update:

| Key | Value |
|-----|--------|
| `CORS_ORIGIN` | `https://condopay.vercel.app` (your exact Vercel URL) |

For preview deployments, you can also add:

| Key | Value |
|-----|--------|
| `CORS_ORIGINS` | `https://condopay-git-main-yourname.vercel.app` |

(comma-separated, no spaces)

3. **Save** → Render will redeploy the API automatically

---

## Step 4 — Verify end-to-end

1. Open your Vercel URL
2. Log in with `admin@demo.condopay.com` / `Demo123!`
3. Check dashboard, admin panel, maintenance

If login fails with a network error:

- Confirm `VITE_API_URL` on Vercel matches the Render API URL
- Confirm `CORS_ORIGIN` on Render matches the Vercel URL exactly (including `https://`)
- Redeploy **both** after env changes (Vercel rebuild for `VITE_*` vars)

---

## Free tier notes

| Platform | Caveat |
|----------|--------|
| **Render web** | Spins down after ~15 min idle; first request may take 30–60s (cold start) |
| **Render Postgres** | Free DB expires after 90 days (fine for demos/interviews) |
| **Vercel** | Generous free tier for hobby projects |

---

## Manual deploy (without Blueprint)

### Render API

- **New Web Service** → connect repo
- **Root Directory:** leave empty (repo root)
- **Build:** `npm install && npm run build -w @condopay/api`
- **Start:** `npm run start -w @condopay/api`
- **Pre-deploy:** `npm run db:migrate -w @condopay/api`
- Env: `DATABASE_URL`, `JWT_SECRET`, `CORS_ORIGIN`, `NODE_ENV=production`

### Render Postgres

- **New PostgreSQL** → copy **Internal Database URL** into `DATABASE_URL`

---

## Local vs production

| | Local | Production |
|---|--------|------------|
| Web | `http://localhost:5173` | `https://*.vercel.app` |
| API | `http://localhost:4000` | `https://*.onrender.com` |
| DB | Docker `:5433` | Render Postgres |
| Env (web) | `apps/web/.env` | Vercel env vars |
| Env (api) | `apps/api/.env` | Render env vars |

---

## Troubleshooting

**`DATABASE_URL is required`** — Render DB not linked; check env vars.

**CORS error in browser console** — `CORS_ORIGIN` mismatch; must match the browser origin exactly.

**`Cannot reach the API`** — Wrong `VITE_API_URL` or API still cold-starting.

**Migrations failed on deploy** — Check Render deploy logs; run `npm run db:migrate -w @condopay/api` in Shell.

**Build fails on Vercel** — Ensure Root Directory is `apps/web` and `VITE_API_URL` is set.
