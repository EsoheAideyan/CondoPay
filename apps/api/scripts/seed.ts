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
const DEMO_DOMAIN = '@demo.condopay.com';

const BUILDINGS = [
  'Sunset Condos',
  'Harbor View Towers',
  'Maple Heights',
  'Riverside Lofts',
];

const ADMIN_NAMES = [
  ['Demo', 'Admin'],
  ['Sarah', 'Chen'],
  ['James', 'Okonkwo'],
  ['Maria', 'Lopez'],
  ['David', 'Kim'],
  ['Aisha', 'Patel'],
  ['Robert', 'Martin'],
];

const TENANT_NAMES = [
  ['Demo', 'Tenant'],
  ['Emma', 'Wilson'],
  ['Liam', 'Brown'],
  ['Olivia', 'Garcia'],
  ['Noah', 'Lee'],
  ['Ava', 'Taylor'],
  ['Ethan', 'Moore'],
  ['Sophia', 'Clark'],
  ['Mason', 'Hall'],
  ['Isabella', 'Young'],
  ['Lucas', 'King'],
  ['Mia', 'Wright'],
  ['Jackson', 'Scott'],
];

/** pending | active | inactive */
const TENANT_STATUSES: Array<'pending' | 'active' | 'inactive'> = [
  'active',
  'active',
  'pending',
  'active',
  'pending',
  'active',
  'active',
  'inactive',
  'active',
  'pending',
  'active',
  'active',
  'active',
];

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error('DATABASE_URL is required');

  const client = new pg.Client({ connectionString });
  await client.connect();
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  await client.query('BEGIN');
  try {
    // Delete order matters: invoices → leases → users → buildings
    // Also clear leases on demo buildings (e.g. from manual registrations using same names)
    await client.query(
      `
      DELETE FROM invoices
      WHERE lease_id IN (
        SELECT l.id FROM leases l
        LEFT JOIN users u ON u.id = l.tenant_id
        LEFT JOIN buildings b ON b.id = l.building_id
        WHERE u.email LIKE $1 OR b.name = ANY($2)
      )
      `,
      [`%${DEMO_DOMAIN}`, BUILDINGS]
    );
    await client.query(
      `DELETE FROM maintenance_requests
       WHERE tenant_id IN (SELECT id FROM users WHERE email LIKE $1)`,
      [`%${DEMO_DOMAIN}`]
    );
    await client.query(
      `
      DELETE FROM leases
      WHERE tenant_id IN (SELECT id FROM users WHERE email LIKE $1)
         OR building_id IN (SELECT id FROM buildings WHERE name = ANY($2))
      `,
      [`%${DEMO_DOMAIN}`, BUILDINGS]
    );
    await client.query(`DELETE FROM users WHERE email LIKE $1`, [`%${DEMO_DOMAIN}`]);
    await client.query(`DELETE FROM buildings WHERE name = ANY($1)`, [BUILDINGS]);

    const buildingIds: string[] = [];
    for (const name of BUILDINGS) {
      const r = await client.query<{ id: string }>(
        `INSERT INTO buildings (name) VALUES ($1) RETURNING id`,
        [name]
      );
      buildingIds.push(r.rows[0].id);
    }

    for (let i = 0; i < ADMIN_NAMES.length; i++) {
      const [first, last] = ADMIN_NAMES[i];
      const email =
        i === 0 ? `admin${DEMO_DOMAIN}` : `admin${i + 1}${DEMO_DOMAIN}`;
      await client.query(
        `INSERT INTO users (email, password_hash, role, status, first_name, last_name, phone)
         VALUES ($1, $2, 'admin', 'active', $3, $4, $5)`,
        [email, passwordHash, first, last, `555-100${i}`]
      );
    }

    const months = ['March', 'April', 'May', 'June'];
    for (let i = 0; i < TENANT_NAMES.length; i++) {
      const [first, last] = TENANT_NAMES[i];
      const email =
        i === 0 ? `tenant${DEMO_DOMAIN}` : `tenant${i + 1}${DEMO_DOMAIN}`;
      const status = TENANT_STATUSES[i];
      const rent = 1500 + i * 75;
      const unit = `${100 + i}${i % 3 === 0 ? 'B' : ''}`;
      const buildingId = buildingIds[i % buildingIds.length];

      const userResult = await client.query<{ id: string }>(
        `INSERT INTO users (email, password_hash, role, status, first_name, last_name, phone)
         VALUES ($1, $2, 'tenant', $3, $4, $5, $6)
         RETURNING id`,
        [email, passwordHash, status, first, last, `555-200${i}`]
      );

      const leaseResult = await client.query<{ id: string }>(
        `INSERT INTO leases (tenant_id, building_id, unit_no, monthly_rent, lease_start, lease_end)
         VALUES ($1, $2, $3, $4, '2025-01-01', '2026-12-31')
         RETURNING id`,
        [userResult.rows[0].id, buildingId, unit, rent]
      );

      if (status === 'active') {
        await client.query(
          `INSERT INTO invoices (lease_id, amount, due_date, status, period_label)
           VALUES
             ($1, $2, '2026-06-01', 'open', 'June 2026'),
             ($1, $2, '2026-05-01', 'paid', 'May 2026'),
             ($1, $2, '2026-04-01', 'paid', 'April 2026')`,
          [leaseResult.rows[0].id, rent]
        );
      } else if (status === 'pending') {
        await client.query(
          `INSERT INTO invoices (lease_id, amount, due_date, status, period_label)
           VALUES ($1, $2, '2026-06-01', 'open', 'June 2026')`,
          [leaseResult.rows[0].id, rent]
        );
      }

      if (status === 'active' && i < 5) {
        const samples = [
          [
            'Leaky kitchen faucet',
            'Water drips constantly from the kitchen faucet even when fully closed.',
            'plumbing',
            'normal',
            'open',
          ],
          [
            'AC not cooling',
            'Bedroom air conditioning runs but does not cool below 78°F.',
            'hvac',
            'urgent',
            'in_progress',
          ],
          [
            'Broken outlet in living room',
            'The outlet near the window stopped working after a storm.',
            'electrical',
            'normal',
            'open',
          ],
          [
            'Dishwasher not draining',
            'Standing water remains at the bottom after every cycle.',
            'appliance',
            'low',
            'resolved',
          ],
          [
            'Pest sighting in pantry',
            'Noticed small insects near dry goods storage area.',
            'pest',
            'normal',
            'open',
          ],
        ] as const;
        const [title, description, category, priority, mStatus] = samples[i];
        await client.query(
          `INSERT INTO maintenance_requests
             (tenant_id, lease_id, title, description, category, priority, status)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [
            userResult.rows[0].id,
            leaseResult.rows[0].id,
            title,
            description,
            category,
            priority,
            mStatus,
          ]
        );
      }
    }

    await client.query('COMMIT');

    const counts = await client.query<{ admins: string; tenants: string }>(`
      SELECT
        (SELECT COUNT(*)::text FROM users WHERE role = 'admin' AND email LIKE $1) AS admins,
        (SELECT COUNT(*)::text FROM users WHERE role = 'tenant' AND email LIKE $1) AS tenants
    `, [`%${DEMO_DOMAIN}`]);

    console.log('Seed complete.');
    console.log(`Users: ${counts.rows[0].admins} admins, ${counts.rows[0].tenants} tenants`);
    console.log('Password for all demo accounts:', DEMO_PASSWORD);
    console.log('Primary logins: admin@demo.condopay.com | tenant@demo.condopay.com');
    console.log('Also: admin2–admin7, tenant2–tenant13 @demo.condopay.com');
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
