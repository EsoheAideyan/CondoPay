import { useEffect, useState } from 'react';
import { AppLayout } from '../components/AppLayout';
import { BalanceByBuilding } from '../components/BalanceByBuilding';
import { InvoicesTable } from '../components/InvoicesTable';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../lib/api';
import type { Invoice } from '../types';

export default function DashboardPage() {
  const { user, token } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) return;
    apiFetch<{ invoices: Invoice[] }>('/api/invoices/mine', {}, token)
      .then((data) => setInvoices(data.invoices))
      .catch(() => setError('Could not load invoices'));
  }, [token]);

  return (
    <AppLayout title="Dashboard" showUserMeta showAppNav showAdminLink>
      {user?.status === 'pending' && (
        <div
          role="alert"
          className="mb-6 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-amber-900 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-200"
        >
          Your account is pending admin approval.
        </div>
      )}

      <div className="space-y-6">
        <section
          aria-labelledby="balance-heading"
          className="rounded-xl border border-slate-200 bg-white p-6 shadow dark:border-slate-700 dark:bg-slate-800"
        >
          <h2
            id="balance-heading"
            className="text-lg font-semibold text-slate-900 dark:text-white"
          >
            Balance due by building
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Amounts owed per property from open and overdue invoices.
          </p>
          <BalanceByBuilding invoices={invoices} />
        </section>

        <section
          aria-labelledby="invoices-heading"
          className="rounded-xl border border-slate-200 bg-white p-6 shadow dark:border-slate-700 dark:bg-slate-800"
        >
          <h2
            id="invoices-heading"
            className="text-lg font-semibold text-slate-900 dark:text-white"
          >
            Rent invoices
          </h2>
          {error && (
            <p role="alert" className="mt-2 text-sm text-red-600 dark:text-red-400">
              {error}
            </p>
          )}
          {!error && <InvoicesTable invoices={invoices} />}
        </section>
      </div>
    </AppLayout>
  );
}
