/**
 * Invoice routes — rent bills for tenants.
 *
 * GET /mine — tenant sees own invoices; admin sees all invoices
 */

import { Router } from 'express';
import { pool } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth);

router.get('/mine', async (req, res) => {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  // Admin dashboard: all invoices across tenants
  if (req.user.role === 'admin') {
    const { rows } = await pool.query(
      `
      SELECT i.id, i.amount, i.due_date, i.status, i.period_label,
             u.email AS tenant_email, u.first_name, u.last_name,
             l.unit_no, b.name AS building_name
      FROM invoices i
      JOIN leases l ON l.id = i.lease_id
      JOIN users u ON u.id = l.tenant_id
      JOIN buildings b ON b.id = l.building_id
      ORDER BY i.due_date DESC
      `
    );
    res.json({ invoices: rows });
    return;
  }

  // Tenant dashboard: only their invoices
  const { rows } = await pool.query(
    `
    SELECT i.id, i.amount, i.due_date, i.status, i.period_label,
           l.unit_no, b.name AS building_name
    FROM invoices i
    JOIN leases l ON l.id = i.lease_id
    JOIN buildings b ON b.id = l.building_id
    WHERE l.tenant_id = $1
    ORDER BY i.due_date DESC
    `,
    [req.user.id]
  );

  res.json({ invoices: rows });
});

export default router;
