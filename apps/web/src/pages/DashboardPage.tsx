import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../lib/api';
import type { Invoice } from '../types';

export default function DashboardPage() {
  const { user, token, logout } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) return;

    apiFetch<{ invoices: Invoice[] }>('/api/invoices/mine', {}, token)
      .then((data) => setInvoices(data.invoices))
      .catch(() => setError('Could not load invoices'));
  }, [token]);

  const openBalance = invoices
    .filter((i) => i.status === 'open' || i.status === 'overdue')
    .reduce((sum, i) => sum + Number(i.amount), 0);

  return (
    <div className="min-h-screen">
      <header className="flex items-center justify-between border-b bg-white px-6 py-4">
        <div>
          <h1 className="text-xl font-bold">Dashboard</h1>
          <p className="text-sm text-slate-600">
            {user?.firstName} {user?.lastName} · {user?.role} · {user?.status}
          </p>
        </div>
        <div className="flex gap-3">
          {user?.role === 'admin' && (
            <Link
              to="/admin"
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-50"
            >
              Admin
            </Link>
          )}
          <button
            type="button"
            onClick={logout}
            className="rounded-lg bg-slate-800 px-3 py-1.5 text-sm text-white"
          >
            Log out
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-6 p-6">
        {user?.status === 'pending' && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-amber-900">
            Your account is pending admin approval.
          </div>
        )}

        <section className="rounded-xl bg-white p-6 shadow">
          <h2 className="text-lg font-semibold">Balance due</h2>
          <p className="mt-2 text-3xl font-bold text-blue-600">
            ${openBalance.toFixed(2)}
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Stripe payments coming in Tier 2.
          </p>
        </section>

        <section className="rounded-xl bg-white p-6 shadow">
          <h2 className="text-lg font-semibold">Rent invoices</h2>
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
          <ul className="mt-4 divide-y">
            {invoices.map((inv) => (
              <li key={inv.id} className="flex justify-between py-3 text-sm">
                <span>
                  {inv.period_label} · Unit {inv.unit_no} · {inv.building_name}
                </span>
                <span className="font-medium">
                  ${Number(inv.amount).toFixed(2)}{' '}
                  <span className="text-slate-500">({inv.status})</span>
                </span>
              </li>
            ))}
            {invoices.length === 0 && !error && (
              <li className="py-3 text-slate-500">No invoices yet.</li>
            )}
          </ul>
        </section>
      </main>
    </div>
  );
}
