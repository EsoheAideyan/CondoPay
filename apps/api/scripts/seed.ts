/**
 * Seed demo data for local development and interviewer demos.
 *
 * Creates:
 * - admin@demo.condopay.com (admin, active)
 * - tenant@demo.condopay.com (tenant, active) + lease + sample invoices
 *
 * Safe to re-run: deletes demo users by email first, then recreates.
 * Run: npm run db:seed
 */

import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import pg from 'pg';

dotenv.config();

const DEMO_PASSWORD = 'Demo123!';

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL is required');
  }

  const client = new pg.Client({ connectionString });
  await client.connect();

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  await client.query('BEGIN');
  try {
    // Remove old demo data (invoices → leases → users for demo emails)
    await client.query(
      `
      DELETE FROM invoices
      WHERE lease_id IN (
        SELECT l.id FROM leases l
        JOIN users u ON u.id = l.tenant_id
        WHERE u.email IN ($1, $2)
      )
    `,
      ['admin@demo.condopay.com', 'tenant@demo.condopay.com']
    );

    await client.query(
      `
      DELETE FROM leases
      WHERE tenant_id IN (
        SELECT id FROM users WHERE email IN ($1, $2)
      )
    `,
      ['admin@demo.condopay.com', 'tenant@demo.condopay.com']
    );

    await client.query(
      `DELETE FROM users WHERE email IN ($1, $2)`,
      ['admin@demo.condopay.com', 'tenant@demo.condopay.com']
    );

    // Admin account (no lease)
    await client.query(
      `
      INSERT INTO users (email, password_hash, role, status, first_name, last_name, phone)
      VALUES ($1, $2, 'admin', 'active', 'Demo', 'Admin', '555-0100')
    `,
      ['admin@demo.condopay.com', passwordHash]
    );

    // Tenant + building + lease
    const tenantResult = await client.query<{ id: string }>(
      `
      INSERT INTO users (email, password_hash, role, status, first_name, last_name, phone)
      VALUES ($1, $2, 'tenant', 'active', 'Demo', 'Tenant', '555-0101')
      RETURNING id
    `,
      ['tenant@demo.condopay.com', passwordHash]
    );

    const buildingResult = await client.query<{ id: string }>(
      `INSERT INTO buildings (name) VALUES ('Sunset Condos') RETURNING id`
    );

    const leaseResult = await client.query<{ id: string }>(
      `
      INSERT INTO leases (tenant_id, building_id, unit_no, monthly_rent, lease_start, lease_end)
      VALUES ($1, $2, '407', 1850.00, '2025-01-01', '2025-12-31')
      RETURNING id
    `,
      [tenantResult.rows[0].id, buildingResult.rows[0].id]
    );

    // Sample rent invoices for the demo tenant
    await client.query(
      `
      INSERT INTO invoices (lease_id, amount, due_date, status, period_label)
      VALUES
        ($1, 1850.00, '2026-06-01', 'open', 'June 2026'),
        ($1, 1850.00, '2026-05-01', 'paid', 'May 2026')
    `,
      [leaseResult.rows[0].id]
    );

    await client.query('COMMIT');

    console.log('Seed complete.');
    console.log('Demo logins (password for both):', DEMO_PASSWORD);
    console.log('  Admin:  admin@demo.condopay.com');
    console.log('  Tenant: tenant@demo.condopay.com');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
