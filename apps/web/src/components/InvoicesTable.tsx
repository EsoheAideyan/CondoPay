import { useEffect, useMemo, useState } from 'react';
import type { Invoice } from '../types';

const PAGE_SIZE = 10;

type SortKey = 'due_date' | 'building_name' | 'unit_no' | 'amount' | 'status';
type SortDir = 'asc' | 'desc';

const STATUS_STYLES: Record<string, string> = {
  paid: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
  open: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
  overdue: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
  cancelled: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400',
};

function compareInvoices(a: Invoice, b: Invoice, key: SortKey): number {
  switch (key) {
    case 'due_date':
      return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
    case 'amount':
      return Number(a.amount) - Number(b.amount);
    case 'building_name':
      return (a.building_name ?? '').localeCompare(b.building_name ?? '');
    case 'unit_no':
      return (a.unit_no ?? '').localeCompare(b.unit_no ?? '', undefined, {
        numeric: true,
      });
    case 'status':
      return a.status.localeCompare(b.status);
    default:
      return 0;
  }
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

interface SortableHeaderProps {
  label: string;
  sortKey: SortKey;
  activeKey: SortKey;
  direction: SortDir;
  onSort: (key: SortKey) => void;
}

function SortableHeader({
  label,
  sortKey,
  activeKey,
  direction,
  onSort,
}: SortableHeaderProps) {
  const active = activeKey === sortKey;
  return (
    <th
      scope="col"
      className="px-4 py-3"
      aria-sort={active ? (direction === 'asc' ? 'ascending' : 'descending') : 'none'}
    >
      <button
        type="button"
        onClick={() => onSort(sortKey)}
        className="inline-flex items-center gap-1 font-medium hover:text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:hover:text-white"
      >
        {label}
        <span className="text-xs text-slate-400 dark:text-slate-500" aria-hidden>
          {active ? (direction === 'asc' ? '↑' : '↓') : '↕'}
        </span>
      </button>
    </th>
  );
}

interface InvoicesTableProps {
  invoices: Invoice[];
  emptyMessage?: string;
}

export function InvoicesTable({
  invoices,
  emptyMessage = 'No invoices yet.',
}: InvoicesTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('due_date');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [page, setPage] = useState(1);

  const handleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir(key === 'due_date' ? 'desc' : 'asc');
    }
  };

  const sorted = useMemo(() => {
    const copy = [...invoices];
    copy.sort((a, b) => {
      const cmp = compareInvoices(a, b, sortKey);
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return copy;
  }, [invoices, sortKey, sortDir]);

  const total = sorted.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  useEffect(() => {
    setPage(1);
  }, [invoices.length]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const paged = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return sorted.slice(start, start + PAGE_SIZE);
  }, [sorted, page]);

  const rangeStart = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(page * PAGE_SIZE, total);

  if (invoices.length === 0) {
    return <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">{emptyMessage}</p>;
  }

  return (
    <div className="mt-4">
      <div className="overflow-x-auto">
      <table className="w-full min-w-[560px] text-left text-sm">
        <caption className="sr-only">
          Rent invoices; click column headers to sort
        </caption>
        <thead className="bg-slate-50 text-slate-600 dark:bg-slate-700 dark:text-slate-300">
          <tr>
            <SortableHeader
              label="Date"
              sortKey="due_date"
              activeKey={sortKey}
              direction={sortDir}
              onSort={handleSort}
            />
            <SortableHeader
              label="Unit"
              sortKey="unit_no"
              activeKey={sortKey}
              direction={sortDir}
              onSort={handleSort}
            />
            <SortableHeader
              label="Building"
              sortKey="building_name"
              activeKey={sortKey}
              direction={sortDir}
              onSort={handleSort}
            />
            <SortableHeader
              label="Amount"
              sortKey="amount"
              activeKey={sortKey}
              direction={sortDir}
              onSort={handleSort}
            />
            <SortableHeader
              label="Status"
              sortKey="status"
              activeKey={sortKey}
              direction={sortDir}
              onSort={handleSort}
            />
          </tr>
        </thead>
        <tbody>
          {paged.map((inv) => (
            <tr
              key={inv.id}
              className="border-t border-slate-200 dark:border-slate-700"
            >
              <td className="px-4 py-3 text-slate-700 dark:text-slate-300">
                <span className="block">{formatDate(inv.due_date)}</span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {inv.period_label}
                </span>
              </td>
              <td className="px-4 py-3 text-slate-900 dark:text-slate-100">
                {inv.unit_no ?? '—'}
              </td>
              <td className="px-4 py-3 text-slate-700 dark:text-slate-300">
                {inv.building_name ?? '—'}
              </td>
              <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">
                ${Number(inv.amount).toFixed(2)}
              </td>
              <td className="px-4 py-3">
                <span
                  className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${
                    STATUS_STYLES[inv.status] ?? STATUS_STYLES.cancelled
                  }`}
                >
                  {inv.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>

      <nav
        className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4 dark:border-slate-700"
        aria-label="Invoice pagination"
      >
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Showing {rangeStart}–{rangeEnd} of {total}
        </p>
        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              Previous
            </button>
            <span className="text-sm text-slate-600 dark:text-slate-400">
              Page {page} of {totalPages}
            </span>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              Next
            </button>
          </div>
        )}
      </nav>
    </div>
  );
}
