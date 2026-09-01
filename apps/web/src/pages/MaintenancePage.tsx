import { FormEvent, useCallback, useEffect, useState } from 'react';
import { AppLayout, inputClassName, labelClassName } from '../components/AppLayout';
import { useAuth } from '../context/AuthContext';
import { apiFetch, ApiError } from '../lib/api';
import type { MaintenanceRequest, MaintenanceStatus } from '../types';

const CATEGORIES = [
  { value: 'general', label: 'General' },
  { value: 'plumbing', label: 'Plumbing' },
  { value: 'electrical', label: 'Electrical' },
  { value: 'hvac', label: 'HVAC' },
  { value: 'appliance', label: 'Appliance' },
  { value: 'pest', label: 'Pest control' },
  { value: 'other', label: 'Other' },
];

const PRIORITIES = [
  { value: 'low', label: 'Low' },
  { value: 'normal', label: 'Normal' },
  { value: 'urgent', label: 'Urgent' },
];

const STATUS_STYLES: Record<string, string> = {
  open: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
  in_progress:
    'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  resolved: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
  cancelled: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400',
};

const STATUS_LABELS: Record<MaintenanceStatus, string> = {
  open: 'Open',
  in_progress: 'In progress',
  resolved: 'Resolved',
  cancelled: 'Cancelled',
};

const SERENE_INPUT_CLASS_NAME = `${inputClassName} !rounded-2xl !border-[#d9dce7] !bg-[#f7f6fa]/90 !px-4 !text-[#24364b] focus-visible:!outline-[#2c5282] dark:!border-slate-600 dark:!bg-slate-900/70 dark:!text-white dark:focus-visible:!outline-[#a9c8ed]`;
const SERENE_LABEL_CLASS_NAME = `${labelClassName} ml-1 !text-[#34445a] dark:!text-slate-200`;

function formatWhen(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

export default function MaintenancePage() {
  const { user, token } = useAuth();
  const isAdmin = user?.role === 'admin';
  const canSubmit = user?.role === 'tenant' && user.status === 'active';

  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [loadError, setLoadError] = useState('');
  const [formError, setFormError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('general');
  const [priority, setPriority] = useState('normal');

  const loadRequests = useCallback(() => {
    if (!token) return;
    apiFetch<{ requests: MaintenanceRequest[] }>('/api/maintenance/mine', {}, token)
      .then((data) => {
        setRequests(data.requests);
        setLoadError('');
      })
      .catch(() => setLoadError('Could not load maintenance requests'));
  }, [token]);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!token || !canSubmit) return;
    setFormError('');
    setSuccess('');
    setSubmitting(true);
    try {
      await apiFetch('/api/maintenance', {
        method: 'POST',
        body: JSON.stringify({ title, description, category, priority }),
      }, token);
      setTitle('');
      setDescription('');
      setCategory('general');
      setPriority('normal');
      setSuccess('Request submitted. Our team will follow up soon.');
      loadRequests();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'Could not submit request');
    } finally {
      setSubmitting(false);
    }
  };

  const updateStatus = async (id: string, status: MaintenanceStatus) => {
    if (!token) return;
    setUpdatingId(id);
    try {
      await apiFetch(`/api/maintenance/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }, token);
      loadRequests();
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <AppLayout
      title="Maintenance"
      showUserMeta
      showAppNav
      showAdminLink
    >
      <div className="space-y-6">
        {canSubmit && (
          <section
            aria-labelledby="maintenance-form-heading"
            className="rounded-2xl border border-[#e7e4e8] bg-white/90 p-6 shadow-[0_20px_55px_-32px_rgba(38,52,73,0.38)] backdrop-blur-md dark:border-slate-700/80 dark:bg-slate-800/90"
          >
            <h2
              id="maintenance-form-heading"
              className="text-lg font-semibold text-[#263449] dark:text-white"
            >
              Submit a request
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Describe the issue in your unit. Include as much detail as you can.
            </p>

            {success && (
              <p
                role="status"
                className="mt-4 rounded-2xl border border-green-200 bg-green-50/90 px-4 py-3 text-sm text-green-800 dark:border-green-900 dark:bg-green-950/90 dark:text-green-200"
              >
                {success}
              </p>
            )}
            {formError && (
              <p
                role="alert"
                className="mt-4 rounded-2xl border border-red-200 bg-red-50/90 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/90 dark:text-red-300"
              >
                {formError}
              </p>
            )}

            <form onSubmit={handleSubmit} className="mt-4 space-y-4" noValidate>
              <div>
                <label htmlFor="maint-title" className={SERENE_LABEL_CLASS_NAME}>
                  Title
                </label>
                <input
                  id="maint-title"
                  required
                  minLength={3}
                  className={SERENE_INPUT_CLASS_NAME}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Leaky bathroom sink"
                />
              </div>
              <div>
                <label htmlFor="maint-desc" className={SERENE_LABEL_CLASS_NAME}>
                  Description
                </label>
                <textarea
                  id="maint-desc"
                  required
                  minLength={10}
                  rows={4}
                  className={SERENE_INPUT_CLASS_NAME}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What happened, when did it start, and any safety concerns?"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="maint-category" className={SERENE_LABEL_CLASS_NAME}>
                    Category
                  </label>
                  <select
                    id="maint-category"
                    className={SERENE_INPUT_CLASS_NAME}
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="maint-priority" className={SERENE_LABEL_CLASS_NAME}>
                    Priority
                  </label>
                  <select
                    id="maint-priority"
                    className={SERENE_INPUT_CLASS_NAME}
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                  >
                    {PRIORITIES.map((p) => (
                      <option key={p.value} value={p.value}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="rounded-full bg-[#a44c2d] px-5 py-2.5 font-semibold text-white shadow-lg shadow-[#a44c2d]/20 transition hover:bg-[#8e3f24] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8e3f24] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100"
              >
                {submitting ? 'Submitting…' : 'Submit request'}
              </button>
            </form>
          </section>
        )}

        {user?.role === 'tenant' && user.status === 'pending' && (
          <div
            role="alert"
            className="rounded-2xl border border-amber-300 bg-amber-50/90 px-4 py-3 text-amber-900 shadow-sm backdrop-blur-md dark:border-amber-700 dark:bg-amber-950/90 dark:text-amber-200"
          >
            Your account is pending approval. You can submit maintenance requests once
            an admin activates your account.
          </div>
        )}

        <section
          aria-labelledby="maintenance-list-heading"
          className="rounded-2xl border border-[#e7e4e8] bg-white/90 p-6 shadow-[0_20px_55px_-32px_rgba(38,52,73,0.38)] backdrop-blur-md dark:border-slate-700/80 dark:bg-slate-800/90"
        >
          <h2
            id="maintenance-list-heading"
            className="text-lg font-semibold text-[#263449] dark:text-white"
          >
            {isAdmin ? 'All maintenance requests' : 'Your requests'}
          </h2>
          {loadError && (
            <p role="alert" className="mt-2 text-sm text-red-600 dark:text-red-400">
              {loadError}
            </p>
          )}
          {!loadError && requests.length === 0 && (
            <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
              No maintenance requests yet.
            </p>
          )}
          {!loadError && requests.length > 0 && (
            <div className="mt-4 overflow-x-auto rounded-2xl border border-[#e7e4e8] dark:border-slate-700">
              <table className="w-full min-w-[640px] text-left text-sm">
                <caption className="sr-only">
                  Maintenance requests with status and property details
                </caption>
                <thead className="bg-[#f5f3f6]/90 text-[#48698d] dark:bg-slate-700/80 dark:text-slate-300">
                  <tr>
                    <th scope="col" className="px-4 py-3">
                      Submitted
                    </th>
                    {isAdmin && (
                      <th scope="col" className="px-4 py-3">
                        Tenant
                      </th>
                    )}
                    <th scope="col" className="px-4 py-3">
                      Unit / Building
                    </th>
                    <th scope="col" className="px-4 py-3">
                      Request
                    </th>
                    <th scope="col" className="px-4 py-3">
                      Priority
                    </th>
                    <th scope="col" className="px-4 py-3">
                      Status
                    </th>
                    {isAdmin && (
                      <th scope="col" className="px-4 py-3">
                        Update
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {requests.map((r) => (
                    <tr
                      key={r.id}
                      className="border-t border-[#e7e4e8] dark:border-slate-700"
                    >
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                        {formatWhen(r.createdAt)}
                      </td>
                      {isAdmin && (
                        <td className="px-4 py-3 text-slate-900 dark:text-slate-100">
                          {r.tenantFirstName} {r.tenantLastName}
                          <br />
                          <span className="text-xs text-slate-500">{r.tenantEmail}</span>
                        </td>
                      )}
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                        Unit {r.unitNo ?? '—'}
                        <br />
                        {r.buildingName ?? '—'}
                      </td>
                      <td className="max-w-xs px-4 py-3 text-slate-900 dark:text-slate-100">
                        <span className="font-medium">{r.title}</span>
                        <br />
                        <span className="text-xs capitalize text-slate-500 dark:text-slate-400">
                          {r.category.replace('_', ' ')}
                        </span>
                        <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                          {r.description}
                        </p>
                      </td>
                      <td className="px-4 py-3 capitalize">{r.priority}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            STATUS_STYLES[r.status] ?? STATUS_STYLES.cancelled
                          }`}
                        >
                          {STATUS_LABELS[r.status] ?? r.status}
                        </span>
                      </td>
                      {isAdmin && (
                        <td className="px-4 py-3">
                          <label className="sr-only" htmlFor={`status-${r.id}`}>
                            Update status for {r.title}
                          </label>
                          <select
                            id={`status-${r.id}`}
                            disabled={updatingId === r.id}
                            value={r.status}
                            onChange={(e) =>
                              updateStatus(r.id, e.target.value as MaintenanceStatus)
                            }
                            className="rounded-xl border border-[#d9dce7] bg-[#f7f6fa]/90 px-2 py-1 text-sm text-[#24364b] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#2c5282] dark:border-slate-600 dark:bg-slate-900/70 dark:text-slate-100 dark:focus-visible:outline-[#a9c8ed]"
                          >
                            {(Object.keys(STATUS_LABELS) as MaintenanceStatus[]).map(
                              (s) => (
                                <option key={s} value={s}>
                                  {STATUS_LABELS[s]}
                                </option>
                              )
                            )}
                          </select>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </AppLayout>
  );
}
