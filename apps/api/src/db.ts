/**
 * Database connection module.
 *
 * Loads environment variables first, then creates a shared connection pool.
 * All route handlers import `pool` from here instead of opening new connections.
 */

import dotenv from 'dotenv';

// Must run before reading process.env.DATABASE_URL (import order matters in Node).
dotenv.config();

import pg from 'pg';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL is required');
}

/** Render / managed Postgres often require SSL for external connections. */
const useSsl =
  process.env.PGSSLMODE === 'require' ||
  connectionString.includes('sslmode=require') ||
  (process.env.NODE_ENV === 'production' &&
    connectionString.includes('render.com'));

/**
 * Pool reuses connections across requests — more efficient than
 * connecting/disconnecting on every API call.
 */
export const pool = new pg.Pool({
  connectionString,
  ssl: useSsl ? { rejectUnauthorized: false } : undefined,
});
