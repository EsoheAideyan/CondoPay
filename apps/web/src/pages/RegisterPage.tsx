import { FormEvent, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { inputClassName, labelClassName } from '../components/AppLayout';
import { PasswordField } from '../components/PasswordField';
import { ThemeToggle } from '../components/ThemeToggle';
import { useAuth } from '../context/AuthContext';
import { ApiError } from '../lib/api';

export default function RegisterPage() {
  const { user, register } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
    buildingName: '',
    unitNo: '',
    monthlyRent: '',
    leaseStart: '',
    leaseEnd: '',
  });

  if (user) return <Navigate to="/dashboard" replace />;

  const update = (key: string, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register({ ...form, monthlyRent: Number(form.monthlyRent) });
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    ['firstName', 'First name', 'text'],
    ['lastName', 'Last name', 'text'],
    ['email', 'Email', 'email'],
    ['phone', 'Phone', 'tel'],
    ['buildingName', 'Building name', 'text'],
    ['unitNo', 'Unit number', 'text'],
    ['monthlyRent', 'Monthly rent', 'number'],
    ['leaseStart', 'Lease start', 'date'],
    ['leaseEnd', 'Lease end', 'date'],
  ] as const;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="flex justify-end p-4">
        <ThemeToggle />
      </div>
      <div className="mx-auto max-w-lg px-4 pb-12">
        <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-lg dark:border-slate-700 dark:bg-slate-800">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Create tenant account
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Your account starts as <strong>pending</strong> until an admin
            approves you.
          </p>

          {error && (
            <p
              role="alert"
              className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300"
            >
              {error}
            </p>
          )}

          <form onSubmit={handleSubmit} className="mt-6 grid gap-3 sm:grid-cols-2">
            {fields.map(([key, label, type]) => (
              <div
                key={key}
                className={key === 'buildingName' ? 'sm:col-span-2' : ''}
              >
                <label htmlFor={key} className={labelClassName}>
                  {label}
                </label>
                <input
                  id={key}
                  type={type}
                  required
                  className={inputClassName}
                  value={form[key as keyof typeof form]}
                  onChange={(e) => update(key, e.target.value)}
                />
              </div>
            ))}
            <div className="sm:col-span-2">
              <PasswordField
                id="password"
                label="Password (8+ characters)"
                autoComplete="new-password"
                minLength={8}
                value={form.password}
                onChange={(v) => update('password', v)}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="sm:col-span-2 rounded-lg bg-blue-600 py-2 font-medium text-white hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50"
            >
              {loading ? 'Creating account…' : 'Register'}
            </button>
          </form>

          <p className="mt-4 text-center text-sm">
            <Link
              to="/login"
              className="text-blue-600 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:text-blue-400"
            >
              Back to login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
