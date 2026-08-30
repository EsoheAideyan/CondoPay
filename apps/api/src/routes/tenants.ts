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

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Lock the tenant so concurrent approval requests cannot create duplicates.
    const currentResult = await client.query(
      `
      SELECT u.id, u.email, u.status, u.first_name, u.last_name,
             l.id AS lease_id
      FROM users u
      LEFT JOIN leases l ON l.tenant_id = u.id
      WHERE u.id = $1 AND u.role = 'tenant'
      FOR UPDATE OF u
      `,
      [req.params.id]
    );

    if (currentResult.rows.length === 0) {
      await client.query('ROLLBACK');
      res.status(404).json({ error: 'Tenant not found' });
      return;
    }

    const currentTenant = currentResult.rows[0];
    if (status === 'active' && !currentTenant.lease_id) {
      await client.query('ROLLBACK');
      res.status(409).json({ error: 'Tenant needs a lease before approval' });
      return;
    }

    const { rows } = await client.query(
      `
      UPDATE users
      SET status = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING id, email, status, first_name, last_name
      `,
      [status, req.params.id]
    );

    let invoiceCreated = false;
    if (status === 'active' && currentTenant.status !== 'active') {
      const invoiceResult = await client.query(
        `
        WITH invoice_details AS (
          SELECT l.id AS lease_id,
                 l.monthly_rent AS amount,
                 CASE
                   WHEN l.lease_start > CURRENT_DATE THEN l.lease_start
                   ELSE (date_trunc('month', CURRENT_DATE) + INTERVAL '1 month')::date
                 END AS due_date
          FROM leases l
          WHERE l.tenant_id = $1
        )
        INSERT INTO invoices (lease_id, amount, due_date, status, period_label)
        SELECT d.lease_id,
               d.amount,
               d.due_date,
               'open',
               to_char(d.due_date, 'FMMonth YYYY')
        FROM invoice_details d
        WHERE NOT EXISTS (
          SELECT 1
          FROM invoices i
          WHERE i.lease_id = d.lease_id
            AND i.due_date = d.due_date
        )
        RETURNING id
        `,
        [req.params.id]
      );
      invoiceCreated = invoiceResult.rows.length > 0;
    }

    await client.query('COMMIT');
    res.json({
      tenant: {
        id: rows[0].id,
        email: rows[0].email,
        status: rows[0].status,
        firstName: rows[0].first_name,
        lastName: rows[0].last_name,
      },
      invoiceCreated,
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Could not update tenant status' });
  } finally {
    client.release();
  }
});

export default router;
