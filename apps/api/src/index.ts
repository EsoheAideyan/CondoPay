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

const app = express();
const port = Number(process.env.PORT) || 4000;
const corsOrigin = process.env.CORS_ORIGIN ?? 'http://localhost:5173';

// Allow the React app (different port) to call this API in the browser
app.use(cors({ origin: corsOrigin }));

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

app.listen(port, () => {
  console.log(`CondoPay API listening on port ${port}`);
});
