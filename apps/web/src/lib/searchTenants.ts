import type { TenantRow } from '../types';

function tenantSearchText(t: TenantRow): string {
  return [
    t.firstName,
    t.lastName,
    t.email,
    t.phone,
    t.buildingName,
    t.unitNo,
    t.status,
    t.monthlyRent != null ? String(t.monthlyRent) : '',
    t.monthlyRent != null ? Number(t.monthlyRent).toFixed(2) : '',
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

export function filterTenants(tenants: TenantRow[], query: string): TenantRow[] {
  const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return tenants;
  return tenants.filter((t) => {
    const haystack = tenantSearchText(t);
    return terms.every((term) => haystack.includes(term));
  });
}
