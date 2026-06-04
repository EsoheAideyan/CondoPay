import { useMemo } from 'react';
import type { Invoice } from '../types';

interface BuildingBalance {
  buildingName: string;
  amount: number;
  units: string[];
  openCount: number;
  overdueCount: number;
}

function isDue(inv: Invoice) {
  return inv.status === 'open' || inv.status === 'overdue';
}

function groupBalanceByBuilding(invoices: Invoice[]): BuildingBalance[] {
  const map = new Map<string, BuildingBalance>();

  for (const inv of invoices) {
    if (!isDue(inv)) continue;
    const buildingName = inv.building_name?.trim() || 'Unknown building';
    const existing = map.get(buildingName) ?? {
      buildingName,
      amount: 0,
      units: [],
      openCount: 0,
      overdueCount: 0,
    };
    existing.amount += Number(inv.amount);
    if (inv.status === 'open') existing.openCount += 1;
    if (inv.status === 'overdue') existing.overdueCount += 1;
    if (inv.unit_no && !existing.units.includes(inv.unit_no)) {
      existing.units.push(inv.unit_no);
    }
    map.set(buildingName, existing);
  }

  return [...map.values()].sort((a, b) => b.amount - a.amount);
}

interface BalanceByBuildingProps {
  invoices: Invoice[];
}

export function BalanceByBuilding({ invoices }: BalanceByBuildingProps) {
  const byBuilding = useMemo(() => groupBalanceByBuilding(invoices), [invoices]);
  const total = byBuilding.reduce((sum, b) => sum + b.amount, 0);

  if (byBuilding.length === 0) {
    return (
      <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">
        No balance due — you&apos;re caught up on rent.
      </p>
    );
  }

  return (
    <div className="mt-4 space-y-4">
      <ul className="divide-y divide-slate-200 rounded-lg border border-slate-200 dark:divide-slate-700 dark:border-slate-600">
        {byBuilding.map((row) => (
          <li
            key={row.buildingName}
            className="flex flex-wrap items-baseline justify-between gap-2 px-4 py-3"
          >
            <div>
              <p className="font-medium text-slate-900 dark:text-white">
                {row.buildingName}
              </p>
              {row.units.length > 0 && (
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Unit{row.units.length > 1 ? 's' : ''}: {row.units.sort().join(', ')}
                </p>
              )}
              {(row.overdueCount > 0 || row.openCount > 0) && (
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                  {row.overdueCount > 0 && (
                    <span className="text-red-600 dark:text-red-400">
                      {row.overdueCount} overdue
                    </span>
                  )}
                  {row.overdueCount > 0 && row.openCount > 0 && ' · '}
                  {row.openCount > 0 && `${row.openCount} open`}
                </p>
              )}
            </div>
            <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">
              ${row.amount.toFixed(2)}
            </p>
          </li>
        ))}
      </ul>

      {byBuilding.length > 1 && (
        <div className="flex items-baseline justify-between border-t border-slate-200 pt-3 dark:border-slate-600">
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Total due
          </p>
          <p className="text-xl font-bold text-slate-900 dark:text-white">
            ${total.toFixed(2)}
          </p>
        </div>
      )}

      <p className="text-xs text-slate-500 dark:text-slate-400">
        Based on open and overdue invoices. Stripe payments — Tier 2.
      </p>
    </div>
  );
}
