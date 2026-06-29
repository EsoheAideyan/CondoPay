/**
 * Auth routes: register, login, and current user.
 *
 * POST /register — create tenant account + lease (status: pending)
 * POST /login    — verify password, return JWT
 * GET  /me       — return user from token (protected)
 */

import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt, { type SignOptions } from 'jsonwebtoken';
import { pool } from '../db.js';
import { requireAuth } from '../middleware/auth.js';
import type { AuthUser, JwtPayload } from '../types.js';

const router = Router();

function mapUser(row: Record<string, unknown>): AuthUser {
  return {
    id: row.id as string,
    email: row.email as string,
    role: row.role as AuthUser['role'],
    status: row.status as AuthUser['status'],
    firstName: row.first_name as string,
    lastName: row.last_name as string,
    phone: (row.phone as string) ?? null,
  };
}

/** Create a signed JWT the client sends back on future requests. */
function signToken(user: AuthUser): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET is required');

  const payload: JwtPayload = {
    sub: user.id,
    email: user.email,
    role: user.role,
  };

  const options: SignOptions = {
    expiresIn: (process.env.JWT_EXPIRES_IN ?? '7d') as SignOptions['expiresIn'],
  };
  return jwt.sign(payload, secret, options);
}

// --- Register: tenant signup + building + lease in one transaction ---
router.post('/register', async (req, res) => {
  const {
    email,
    password,
    firstName,
    lastName,
    phone,
    buildingName,
    unitNo,
    monthlyRent,
    leaseStart,
    leaseEnd,
  } = req.body ?? {};

  if (
    !email ||
    !password ||
    !firstName ||
    !lastName ||
    !buildingName ||
    !unitNo ||
    monthlyRent == null ||
    !leaseStart ||
    !leaseEnd
  ) {
    res.status(400).json({ error: 'Missing required fields' });
    return;
  }

  if (password.length < 8) {
    res.status(400).json({ error: 'Password must be at least 8 characters' });
    return;
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const existing = await client.query(
      'SELECT 1 FROM users WHERE email = $1',
      [email.toLowerCase()]
    );
    if (existing.rows.length > 0) {
      await client.query('ROLLBACK');
      res.status(409).json({ error: 'Email already registered' });
      return;
    }

    // bcrypt with cost factor 10 — balances security vs speed
    const passwordHash = await bcrypt.hash(password, 10);

    const userResult = await client.query(
      `INSERT INTO users (email, password_hash, role, status, first_name, last_name, phone)
       VALUES ($1, $2, 'tenant', 'pending', $3, $4, $5)
       RETURNING id, email, role, status, first_name, last_name, phone`,
      [email.toLowerCase(), passwordHash, firstName, lastName, phone ?? null]
    );
    const user = mapUser(userResult.rows[0]);

    const buildingResult = await client.query(
      `INSERT INTO buildings (name) VALUES ($1) RETURNING id`,
      [buildingName]
    );

    await client.query(
      `INSERT INTO leases (tenant_id, building_id, unit_no, monthly_rent, lease_start, lease_end)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        user.id,
        buildingResult.rows[0].id,
        unitNo,
        Number(monthlyRent),
        leaseStart,
        leaseEnd,
      ]
    );

    await client.query('COMMIT');
    res.status(201).json({ user, token: signToken(user) });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Registration failed' });
  } finally {
    client.release();
  }
});

// --- Login: check email + password, return JWT ---
router.post('/login', async (req, res) => {
  const { email, password } = req.body ?? {};
  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required' });
    return;
  }

  const { rows } = await pool.query(
    `SELECT id, email, password_hash, role, status, first_name, last_name, phone
     FROM users WHERE email = $1`,
    [email.toLowerCase()]
  );

  if (rows.length === 0) {
    // Same message for wrong email or wrong password (don't leak which failed)
    res.status(401).json({ error: 'Invalid email or password' });
    return;
  }

  const valid = await bcrypt.compare(password, rows[0].password_hash);
  if (!valid) {
    res.status(401).json({ error: 'Invalid email or password' });
    return;
  }

  const user = mapUser(rows[0]);
  res.json({ user, token: signToken(user) });
});

// --- Current user (requires Authorization: Bearer <token>) ---
router.get('/me', requireAuth, (req, res) => {
  res.json({ user: req.user });
});

export default router;
