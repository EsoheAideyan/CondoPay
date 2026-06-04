/**
 * CondoPay API entry point.
 *
 * Sets up Express middleware, health check, and route modules.
 * Run with: npm run dev
 */

import express from 'express';
import cors from 'cors';
import { pool } from './db.js';
import authRoutes from './routes/auth.js';
import tenantRoutes from './routes/tenants.js';
import invoiceRoutes from './routes/invoices.js';
import maintenanceRoutes from './routes/maintenance.js';

const app = express();
const port = Number(process.env.PORT) || 4000;
// Browser may use localhost or 127.0.0.1 — both must be allowed in dev
const corsOrigins = new Set(
  [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    process.env.CORS_ORIGIN,
  ].filter((o): o is string => Boolean(o))
);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || corsOrigins.has(origin)) {
        callback(null, true);
        return;
      }
      callback(null, false);
    },
  })
);

// Parse JSON request bodies (e.g. { email, password } on login)
app.use(express.json());

// Public health check — used by you now, by deploy platforms later
app.get('/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', database: 'connected' });
  } catch {
    res.status(503).json({ status: 'degraded', database: 'disconnected' });
  }
});

// Auth: /api/auth/register, /api/auth/login, /api/auth/me
app.use('/api/auth', authRoutes);

// Admin: /api/tenants, /api/tenants/:id/status
app.use('/api/tenants', tenantRoutes);

// Invoices: /api/invoices/mine
app.use('/api/invoices', invoiceRoutes);

// Maintenance: /api/maintenance/mine, POST /, PATCH /:id/status
app.use('/api/maintenance', maintenanceRoutes);

app.listen(port, () => {
  console.log(`CondoPay API listening on port ${port}`);
});
