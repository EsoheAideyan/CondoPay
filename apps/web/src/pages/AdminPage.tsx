import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../lib/api';
import type { TenantRow } from '../types';

export default function AdminPage() {
  const { token, logout } = useAuth();
  const [tenants, setTenants] = useState<TenantRow[]>([]);
  const [error, setError] = useState('');

  const loadTenants = useCallback(() => {
    if (!token) return;

    apiFetch<{ tenants: TenantRow[] }>('/api/tenants', {}, token)
      .then((data) => setTenants(data.tenants))
      .catch(() => setError('Could not load tenants'));
  }, [token]);

  useEffect(() => {
    loadTenants();
  }, [loadTenants]);

  const setStatus = async (id: string, status: string) => {
    if (!token) return;

    await apiFetch(`/api/tenants/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }, token);

    loadTenants();
  };

  return (
    <div className="min-h-screen">
      <header className="flex items-center justify-between border-b bg-white px-6 py-4">
        <h1 className="text-xl font-bold">Admin · Tenants</h1>
        <div className="flex gap-3">
          <Link to="/dashboard" className="text-sm text-blue-600 hover:underline">
            Dashboard
          </Link>
          <button type="button" onClick={logout} className="text-sm text-slate-600">
            Log out
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-4xl p-6">
        {error && <p className="text-red-600">{error}</p>}

        <div className="overflow-hidden rounded-xl bg-white shadow">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3">Tenant</th>
                <th className="px-4 py-3">Unit</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tenants.map((t) => (
                <tr key={t.id} className="border-t">
                  <td className="px-4 py-3">
                    {t.firstName} {t.lastName}
                    <br />
                    <span className="text-slate-500">{t.email}</span>
                  </td>
                  <td className="px-4 py-3">
                    {t.buildingName} · {t.unitNo}
                  </td>
                  <td className="px-4 py-3 capitalize">{t.status}</td>
                  <td className="space-x-2 px-4 py-3">
                    {t.status !== 'active' && (
                      <button
                        type="button"
                        onClick={() => setStatus(t.id, 'active')}
                        className="text-green-600 hover:underline"
                      >
                        Approve
                      </button>
                    )}
                    {t.status === 'active' && (
                      <button
                        type="button"
                        onClick={() => setStatus(t.id, 'inactive')}
                        className="text-amber-600 hover:underline"
                      >
                        Deactivate
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {tenants.length === 0 && !error && (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-slate-500">
                    No tenants yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
