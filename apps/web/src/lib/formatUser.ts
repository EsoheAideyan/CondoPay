import type { User } from '../types';

const ROLE_LABELS = { admin: 'Admin', tenant: 'Tenant' } as const;
const STATUS_LABELS = {
  active: 'Active',
  pending: 'Pending',
  inactive: 'Inactive',
} as const;

/** Header line: "Jane Doe · Admin · Active" */
export function formatUserSubtitle(user: User): string {
  const name = `${user.firstName} ${user.lastName}`.trim();
  const role = ROLE_LABELS[user.role];
  const status = STATUS_LABELS[user.status];
  return `${name} · ${role} · ${status}`;
}
