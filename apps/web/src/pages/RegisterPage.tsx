import { FormEvent, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
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
      await register({
        ...form,
        monthlyRent: Number(form.monthlyRent),
      });
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-lg rounded-xl bg-white p-8 shadow-lg">
        <h1 className="text-2xl font-bold">Create tenant account</h1>
        <p className="mt-1 text-sm text-slate-600">
          Status will be <strong>pending</strong> until an admin approves you.
        </p>

        {error && (
          <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="mt-6 grid gap-3 sm:grid-cols-2">
          {(
            [
              ['firstName', 'First name', 'text'],
              ['lastName', 'Last name', 'text'],
              ['email', 'Email', 'email'],
              ['phone', 'Phone', 'tel'],
              ['password', 'Password (8+ chars)', 'password'],
              ['buildingName', 'Building name', 'text'],
              ['unitNo', 'Unit number', 'text'],
              ['monthlyRent', 'Monthly rent', 'number'],
              ['leaseStart', 'Lease start', 'date'],
              ['leaseEnd', 'Lease end', 'date'],
            ] as const
          ).map(([key, label, type]) => (
            <div
              key={key}
              className={key === 'buildingName' ? 'sm:col-span-2' : ''}
            >
              <label className="block text-sm font-medium text-slate-700">
                {label}
              </label>
              <input
                type={type}
                required
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                value={form[key]}
                onChange={(e) => update(key, e.target.value)}
              />
            </div>
          ))}
          <button
            type="submit"
            disabled={loading}
            className="sm:col-span-2 rounded-lg bg-blue-600 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Creating account…' : 'Register'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm">
          <Link to="/login" className="text-blue-600 hover:underline">
            Back to login
          </Link>
        </p>
      </div>
    </div>
  );
}
