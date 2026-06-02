/**
 * Authentication middleware.
 *
 * Protects routes by requiring a valid JWT in the Authorization header.
 * After verification, attaches the full user record to req.user.
 */

import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { pool } from '../db.js';
import type { AuthUser, JwtPayload } from '../types.js';

/** Convert a Postgres row (snake_case columns) to our API user shape. */
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

/**
 * Require a valid Bearer token. Use on any route that needs a logged-in user.
 *
 * Flow: read header → verify JWT → load fresh user from DB → call next().
 * We reload from DB so role/status changes take effect without re-login.
 */
export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing or invalid authorization header' });
    return;
  }

  const token = header.slice(7); // Strip "Bearer " prefix
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    res.status(500).json({ error: 'Server misconfiguration' });
    return;
  }

  try {
    const payload = jwt.verify(token, secret) as JwtPayload;

    const { rows } = await pool.query(
      `SELECT id, email, role, status, first_name, last_name, phone
       FROM users WHERE id = $1`,
      [payload.sub]
    );

    if (rows.length === 0) {
      res.status(401).json({ error: 'User not found' });
      return;
    }

    req.user = mapUser(rows[0]);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}

/** Require admin role — chain after requireAuth on admin-only routes. */
export function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  if (req.user.role !== 'admin') {
    res.status(403).json({ error: 'Admin access required' });
    return;
  }
  next();
}
