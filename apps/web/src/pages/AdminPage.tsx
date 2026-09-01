import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AppLayout, inputClassName } from '../components/AppLayout';
import { useAuth } from '../context/AuthContext';
import { ApiError, apiFetch } from '../lib/api';
import { filterTenants } from '../lib/searchTenants';
import type { TenantRow } from '../types';

export default function AdminPage() {
  const { token } = useAuth();
  const [tenants, setTenants] = useState<TenantRow[]>([]);
  const [error, setError] = useState('');
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const loadTenants = useCallback(() => {
    if (!token) return;
    apiFetch<{ tenants: TenantRow[] }>('/api/tenants', {}, token)
      .then((data) => setTenants(data.tenants))
      .catch(() => setError('Could not load tenants'));
  }, [token]);

  useEffect(() => {
    loadTenants();
  }, [loadTenants]);

  const pending = tenants.filter((t) => t.status === 'pending');
  const filteredTenants = useMemo(
    () => filterTenants(tenants, search),
    [tenants, search]
  );

  const setStatus = async (id: string, status: string) => {
    if (!token) return;
    setApprovingId(id);
    setError('');
    try {
      await apiFetch(
        `/api/tenants/${id}/status`,
        {
          method: 'PATCH',
          body: JSON.stringify({ status }),
        },
        token
      );
      loadTenants();
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : `Could not ${status === 'active' ? 'approve' : 'deactivate'} tenant`
      );
    } finally {
      setApprovingId(null);
    }
  };

  return (
    <AppLayout
      title="Admin · Tenants"
      subtitle={`${tenants.length} tenants in system`}
      showAppNav
      showAdminLink
    >
      <Link
        to="/dashboard"
        className="mb-4 inline-block text-sm font-medium text-[#2c5282] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2c5282] dark:text-[#a9c8ed] dark:focus-visible:outline-[#a9c8ed]"
      >
        ← Back to dashboard
      </Link>

      {pending.length > 0 && (
        <div
          role="alert"
          className="mb-6 rounded-2xl border-2 border-amber-400 bg-amber-50/90 px-4 py-4 shadow-sm backdrop-blur-md dark:border-amber-600 dark:bg-amber-950/90"
        >
          <h2 className="font-semibold text-amber-900 dark:text-amber-100">
            {pending.length} tenant{pending.length === 1 ? '' : 's'} awaiting approval
          </h2>
          <ul className="mt-3 space-y-2">
            {pending.map((t) => (
              <li
                key={t.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-amber-200/80 bg-white/80 px-3 py-2 dark:border-amber-800/70 dark:bg-slate-800/80"
              >
                <span className="text-sm text-amber-950 dark:text-amber-100">
                  {t.firstName} {t.lastName} ({t.email}) — {t.buildingName} {t.unitNo}
                </span>
                <button
                  type="button"
                  disabled={approvingId === t.id}
                  onClick={() => setStatus(t.id, 'active')}
                  className="rounded-lg bg-green-600 px-3 py-1 text-sm font-medium text-white hover:bg-green-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600 disabled:opacity-50"
                >
                  {approvingId === t.id ? 'Approving…' : 'Approve'}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mb-4 grid grid-cols-3 gap-3 text-center text-sm">
        <div className="rounded-2xl border border-[#e7e4e8] bg-white/90 p-3 shadow-sm backdrop-blur-md dark:border-slate-700/80 dark:bg-slate-800/90">
          <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
            {pending.length}
          </p>
          <p className="text-slate-600 dark:text-slate-400">Pending</p>
        </div>
        <div className="rounded-2xl border border-[#e7e4e8] bg-white/90 p-3 shadow-sm backdrop-blur-md dark:border-slate-700/80 dark:bg-slate-800/90">
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">
            {tenants.filter((t) => t.status === 'active').length}
          </p>
          <p className="text-slate-600 dark:text-slate-400">Active</p>
        </div>
        <div className="rounded-2xl border border-[#e7e4e8] bg-white/90 p-3 shadow-sm backdrop-blur-md dark:border-slate-700/80 dark:bg-slate-800/90">
          <p className="text-2xl font-bold text-[#263449] dark:text-slate-200">
            {tenants.length}
          </p>
          <p className="text-slate-600 dark:text-slate-400">Total</p>
        </div>
      </div>

      {error && (
        <p
          role="alert"
          className="mb-4 rounded-2xl border border-red-200 bg-red-50/90 px-4 py-3 text-red-700 dark:border-red-900 dark:bg-red-950/90 dark:text-red-300"
        >
          {error}
        </p>
      )}

      <div className="mb-4">
        <label htmlFor="tenant-search" className="sr-only">
          Search tenants
        </label>
        <div className="flex flex-wrap items-center gap-2">
          <input
            id="tenant-search"
            type="search"
            placeholder="Search by name, email, building, unit, status, or rent…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`${inputClassName.replace('mt-1 ', '')} max-w-xl flex-1 !rounded-2xl !border-[#d9dce7] !bg-[#f7f6fa]/90 !px-4 !text-[#24364b] focus-visible:!outline-[#2c5282] dark:!border-slate-600 dark:!bg-slate-900/70 dark:!text-white dark:focus-visible:!outline-[#a9c8ed]`}
            aria-describedby={search ? 'tenant-search-hint' : undefined}
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="rounded-full border border-[#d9dce7] bg-white/80 px-4 py-2 text-sm font-medium text-[#34445a] hover:bg-[#f5f3f6] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2c5282] dark:border-slate-600 dark:bg-slate-800/80 dark:text-slate-200 dark:hover:bg-slate-700 dark:focus-visible:outline-[#a9c8ed]"
            >
              Clear
            </button>
          )}
        </div>
        {search && (
          <p id="tenant-search-hint" className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Showing {filteredTenants.length} of {tenants.length} tenants
          </p>
        )}
      </div>

      <div className="overflow-x-auto rounded-2xl border border-[#e7e4e8] bg-white/90 shadow-[0_20px_55px_-32px_rgba(38,52,73,0.38)] backdrop-blur-md dark:border-slate-700/80 dark:bg-slate-800/90">
        <table className="w-full min-w-[720px] text-left text-sm">
          <caption className="sr-only">
            All tenants with unit, monthly rent, status, and approval actions
          </caption>
          <thead className="bg-[#f5f3f6]/90 text-[#48698d] dark:bg-slate-700/80 dark:text-slate-300">
            <tr>
              <th scope="col" className="px-4 py-3">
                Tenant
              </th>
              <th scope="col" className="px-4 py-3">
                Unit
              </th>
              <th scope="col" className="px-4 py-3">
                Monthly rent
              </th>
              <th scope="col" className="px-4 py-3">
                Status
              </th>
              <th scope="col" className="px-4 py-3">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredTenants.map((t) => (
              <tr
                key={t.id}
                className={`border-t border-[#e7e4e8] dark:border-slate-700 ${
                  t.status === 'pending' ? 'bg-amber-50/50 dark:bg-amber-950/30' : ''
                }`}
              >
                <td className="px-4 py-3 text-slate-900 dark:text-slate-100">
                  {t.firstName} {t.lastName}
                  <br />
                  <span className="text-slate-500 dark:text-slate-400">{t.email}</span>
                </td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                  {t.buildingName ?? '—'} · {t.unitNo ?? '—'}
                </td>
                <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">
                  {t.monthlyRent != null
                    ? `$${Number(t.monthlyRent).toFixed(2)}`
                    : '—'}
                </td>
                <td className="px-4 py-3 capitalize">{t.status}</td>
                <td className="space-x-2 px-4 py-3">
                  {t.status !== 'active' && (
                    <button
                      type="button"
                      aria-label={`Approve ${t.firstName} ${t.lastName}`}
                      disabled={approvingId === t.id}
                      onClick={() => setStatus(t.id, 'active')}
                      className="font-medium text-green-600 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600 dark:text-green-400"
                    >
                      Approve
                    </button>
                  )}
                  {t.status === 'active' && (
                    <button
                      type="button"
                      aria-label={`Deactivate ${t.firstName} ${t.lastName}`}
                      onClick={() => setStatus(t.id, 'inactive')}
                      className="font-medium text-amber-600 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600 dark:text-amber-400"
                    >
                      Deactivate
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {filteredTenants.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-8 text-center text-slate-500 dark:text-slate-400"
                >
                  {search
                    ? 'No tenants match your search.'
                    : 'No tenants in the system.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </AppLayout>
  );
}
