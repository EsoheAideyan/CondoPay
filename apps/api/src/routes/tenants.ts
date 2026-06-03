/**
 * Admin-only tenant management routes.
 *
 * GET   /           — list all tenants with lease info
 * PATCH /:id/status — approve (active) or deactivate (inactive)
 */

import { Router } from 'express';
import { pool } from '../db.js';
import { requireAdmin, requireAuth } from '../middleware/auth.js';

const router = Router();

// Every route here requires login + admin role
router.use(requireAuth, requireAdmin);

router.get('/', async (_req, res) => {
  const { rows } = await pool.query(
    `
    SELECT u.id, u.email, u.status, u.first_name, u.last_name, u.phone, u.created_at,
           l.unit_no, l.monthly_rent, b.name AS building_name
    FROM users u
    LEFT JOIN leases l ON l.tenant_id = u.id
    LEFT JOIN buildings b ON b.id = l.building_id
    WHERE u.role = 'tenant'
    ORDER BY u.created_at DESC
    `
  );

  res.json({
    tenants: rows.map((r) => ({
      id: r.id,
      email: r.email,
      status: r.status,
      firstName: r.first_name,
      lastName: r.last_name,
      phone: r.phone,
      buildingName: r.building_name,
      unitNo: r.unit_no,
      monthlyRent: r.monthly_rent,
      createdAt: r.created_at,
    })),
  });
});

router.patch('/:id/status', async (req, res) => {
  const { status } = req.body ?? {};

  if (!['pending', 'active', 'inactive'].includes(status)) {
    res.status(400).json({ error: 'Invalid status' });
    return;
  }

  const { rows } = await pool.query(
    `
    UPDATE users
    SET status = $1, updated_at = NOW()
    WHERE id = $2 AND role = 'tenant'
    RETURNING id, email, status, first_name, last_name
    `,
    [status, req.params.id]
  );

  if (rows.length === 0) {
    res.status(404).json({ error: 'Tenant not found' });
    return;
  }

  res.json({
    tenant: {
      id: rows[0].id,
      email: rows[0].email,
      status: rows[0].status,
      firstName: rows[0].first_name,
      lastName: rows[0].last_name,
    },
  });
});

export default router;
