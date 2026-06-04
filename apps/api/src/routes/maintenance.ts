/**
 * Maintenance request routes.
 *
 * GET  /mine           — tenant: own requests; admin: all
 * POST /               — tenant submits a new request (active accounts)
 * PATCH /:id/status    — admin updates request status
 */

import { Router } from 'express';
import { pool } from '../db.js';
import { requireAdmin, requireAuth } from '../middleware/auth.js';

const router = Router();
const VALID_STATUSES = ['open', 'in_progress', 'resolved', 'cancelled'] as const;
const VALID_PRIORITIES = ['low', 'normal', 'urgent'] as const;
const VALID_CATEGORIES = [
  'general',
  'plumbing',
  'electrical',
  'hvac',
  'appliance',
  'pest',
  'other',
] as const;

function mapRequest(row: Record<string, unknown>) {
  return {
    id: row.id as string,
    title: row.title as string,
    description: row.description as string,
    category: row.category as string,
    priority: row.priority as string,
    status: row.status as string,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
    buildingName: (row.building_name as string) ?? null,
    unitNo: (row.unit_no as string) ?? null,
    tenantId: row.tenant_id as string,
    tenantFirstName: (row.tenant_first_name as string) ?? null,
    tenantLastName: (row.tenant_last_name as string) ?? null,
    tenantEmail: (row.tenant_email as string) ?? null,
  };
}

router.use(requireAuth);

router.get('/mine', async (req, res) => {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  if (req.user.role === 'admin') {
    const { rows } = await pool.query(
      `
      SELECT m.*, b.name AS building_name, l.unit_no,
             u.first_name AS tenant_first_name, u.last_name AS tenant_last_name,
             u.email AS tenant_email
      FROM maintenance_requests m
      JOIN users u ON u.id = m.tenant_id
      LEFT JOIN leases l ON l.id = m.lease_id
      LEFT JOIN buildings b ON b.id = l.building_id
      ORDER BY m.created_at DESC
      `
    );
    res.json({ requests: rows.map(mapRequest) });
    return;
  }

  const { rows } = await pool.query(
    `
    SELECT m.*, b.name AS building_name, l.unit_no,
           u.first_name AS tenant_first_name, u.last_name AS tenant_last_name,
           u.email AS tenant_email
    FROM maintenance_requests m
    JOIN users u ON u.id = m.tenant_id
    LEFT JOIN leases l ON l.id = m.lease_id
    LEFT JOIN buildings b ON b.id = l.building_id
    WHERE m.tenant_id = $1
    ORDER BY m.created_at DESC
    `,
    [req.user.id]
  );
  res.json({ requests: rows.map(mapRequest) });
});

router.post('/', async (req, res) => {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  if (req.user.role !== 'tenant') {
    res.status(403).json({ error: 'Only tenants can submit maintenance requests' });
    return;
  }

  if (req.user.status !== 'active') {
    res.status(403).json({
      error: 'Your account must be active before submitting maintenance requests',
    });
    return;
  }

  const { title, description, category, priority } = req.body ?? {};

  if (!title?.trim() || !description?.trim()) {
    res.status(400).json({ error: 'Title and description are required' });
    return;
  }

  if (title.trim().length < 3) {
    res.status(400).json({ error: 'Title must be at least 3 characters' });
    return;
  }

  if (description.trim().length < 10) {
    res.status(400).json({ error: 'Description must be at least 10 characters' });
    return;
  }

  const cat = (category ?? 'general').toLowerCase();
  if (!VALID_CATEGORIES.includes(cat as (typeof VALID_CATEGORIES)[number])) {
    res.status(400).json({ error: 'Invalid category' });
    return;
  }

  const pri = (priority ?? 'normal').toLowerCase();
  if (!VALID_PRIORITIES.includes(pri as (typeof VALID_PRIORITIES)[number])) {
    res.status(400).json({ error: 'Invalid priority' });
    return;
  }

  const leaseResult = await pool.query<{ id: string }>(
    `SELECT id FROM leases WHERE tenant_id = $1 ORDER BY created_at DESC LIMIT 1`,
    [req.user.id]
  );

  const { rows } = await pool.query(
    `
    INSERT INTO maintenance_requests
      (tenant_id, lease_id, title, description, category, priority)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *
    `,
    [
      req.user.id,
      leaseResult.rows[0]?.id ?? null,
      title.trim(),
      description.trim(),
      cat,
      pri,
    ]
  );

  const detail = await pool.query(
    `
    SELECT m.*, b.name AS building_name, l.unit_no,
           u.first_name AS tenant_first_name, u.last_name AS tenant_last_name,
           u.email AS tenant_email
    FROM maintenance_requests m
    JOIN users u ON u.id = m.tenant_id
    LEFT JOIN leases l ON l.id = m.lease_id
    LEFT JOIN buildings b ON b.id = l.building_id
    WHERE m.id = $1
    `,
    [rows[0].id]
  );

  res.status(201).json({ request: mapRequest(detail.rows[0]) });
});

router.patch('/:id/status', requireAdmin, async (req, res) => {
  const { status } = req.body ?? {};
  if (!VALID_STATUSES.includes(status)) {
    res.status(400).json({ error: 'Invalid status' });
    return;
  }

  const { rows } = await pool.query(
    `
    UPDATE maintenance_requests
    SET status = $1, updated_at = NOW()
    WHERE id = $2
    RETURNING *
    `,
    [status, req.params.id]
  );

  if (rows.length === 0) {
    res.status(404).json({ error: 'Request not found' });
    return;
  }

  const detail = await pool.query(
    `
    SELECT m.*, b.name AS building_name, l.unit_no,
           u.first_name AS tenant_first_name, u.last_name AS tenant_last_name,
           u.email AS tenant_email
    FROM maintenance_requests m
    JOIN users u ON u.id = m.tenant_id
    LEFT JOIN leases l ON l.id = m.lease_id
    LEFT JOIN buildings b ON b.id = l.building_id
    WHERE m.id = $1
    `,
    [rows[0].id]
  );

  res.json({ request: mapRequest(detail.rows[0]) });
});

export default router;
