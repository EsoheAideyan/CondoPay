import { FormEvent, useMemo, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { inputClassName, labelClassName } from '../components/AppLayout';
import { PasswordField } from '../components/PasswordField';
import { SereneBackground } from '../components/SereneBackground';
import { ThemeToggle } from '../components/ThemeToggle';
import { ZoomControls } from '../components/ZoomControls';
import { useAuth } from '../context/AuthContext';
import { ApiError } from '../lib/api';
import {
  getPasswordChecks,
  isPasswordValid,
  PASSWORD_RULES,
} from '../lib/passwordRules';

interface LeaseDateFieldProps {
  id: 'leaseStart' | 'leaseEnd';
  label: string;
  value: string;
  min?: string;
  onChange: (value: string) => void;
}


function LeaseDateField({
  id,
  label,
  value,
  min,
  onChange,
}: LeaseDateFieldProps) {
  return (
    <div>
      <label htmlFor={id} className={labelClassName}>
        {label}
      </label>
      <input
        id={id}
        type="date"
        required
        min={min}
        value={value}
        className={`${inputClassName} modern-date-input`}
        onClick={(event) => event.currentTarget.showPicker?.()}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}

export default function RegisterPage() {
  const { user, register } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
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

  const checks = useMemo(
    () => getPasswordChecks(form.password),
    [form.password]
  );
  const passwordReady = isPasswordValid(form.password);
  const showChecklist = form.password.length > 0;
  const passwordsMatch =
    form.confirmPassword.length > 0 &&
    form.password === form.confirmPassword;
  const showMismatch =
    passwordReady &&
    form.confirmPassword.length > 0 &&
    form.password !== form.confirmPassword;

  const canSubmit = passwordReady && passwordsMatch && !loading;

  const handlePasswordChange = (value: string) => {
    setForm((f) => {
      const next = { ...f, password: value };
      // Clear confirm when password no longer meets rules
      if (!isPasswordValid(value) && f.confirmPassword) {
        next.confirmPassword = '';
      }
      return next;
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!passwordReady) {
      setError('Password does not meet all requirements');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const { confirmPassword: _, ...payload } = form;
      await register({ ...payload, monthlyRent: Number(form.monthlyRent) });
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
  ] as const;

  return (
    <div className="relative min-h-svh overflow-x-hidden bg-[#f8f7fb] text-[#24364b] dark:bg-[#101827] dark:text-slate-100">
      <SereneBackground />
      <div className="relative z-20 flex justify-end gap-2 p-4">
        <ZoomControls />
        <ThemeToggle />
      </div>
      <main className="relative z-10 mx-auto max-w-lg px-4 pb-12">
        <div className="rounded-[2rem] border border-white/80 bg-white/90 p-6 shadow-[0_24px_70px_-28px_rgba(38,52,73,0.38)] backdrop-blur-md sm:p-8 dark:border-slate-700/80 dark:bg-slate-800/90">
          <p className="mb-2 text-center text-3xl font-bold tracking-tight text-[#2c5282] dark:text-[#a9c8ed]">
            CondoPay
          </p>
          <h1 className="text-2xl font-semibold text-[#263449] dark:text-white">
            Create tenant account
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Your account starts as <strong>pending</strong> until an admin
            approves you.
          </p>

          {error && (
            <p
              role="alert"
              className="mt-4 rounded-2xl border border-red-200 bg-red-50/90 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/90 dark:text-red-300"
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

            <LeaseDateField
              id="leaseStart"
              label="Lease start"
              value={form.leaseStart}
              onChange={(value) => update('leaseStart', value)}
            />
            <LeaseDateField
              id="leaseEnd"
              label="Lease end"
              value={form.leaseEnd}
              min={form.leaseStart || undefined}
              onChange={(value) => update('leaseEnd', value)}
            />

            <div className="sm:col-span-2">
              <PasswordField
                id="password"
                label="Password"
                autoComplete="new-password"
                value={form.password}
                onChange={handlePasswordChange}
                describedBy={showChecklist ? 'password-requirements' : undefined}
              />

              {showChecklist && (
                <ul
                  id="password-requirements"
                  className="mt-3 space-y-1.5 rounded-2xl border border-[#e7e4e8] bg-[#f5f3f6]/90 px-3 py-3 text-sm dark:border-slate-600 dark:bg-slate-900/50"
                  aria-live="polite"
                >
                  {PASSWORD_RULES.map((rule) => {
                    const ok = checks[rule.key];
                    return (
                      <li
                        key={rule.key}
                        className={
                          ok
                            ? 'text-green-700 dark:text-green-400'
                            : 'text-[#52657b] dark:text-slate-400'
                        }
                      >
                        <span aria-hidden className="mr-2 font-medium">
                          {ok ? '✓' : '○'}
                        </span>
                        {rule.label}
                        <span className="sr-only">
                          {ok ? ' — met' : ' — not met'}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            <div className="sm:col-span-2">
              <PasswordField
                id="confirmPassword"
                label="Confirm Password"
                autoComplete="new-password"
                minLength={8}
                disabled={!passwordReady}
                value={form.confirmPassword}
                onChange={(v) => update('confirmPassword', v)}
                describedBy={
                  showMismatch
                    ? 'password-mismatch'
                    : !passwordReady
                      ? 'confirm-password-hint'
                      : undefined
                }
              />
              {!passwordReady && (
                <p
                  id="confirm-password-hint"
                  className="mt-1.5 text-xs text-slate-500 dark:text-slate-400"
                >
                  Finish the password requirements above to unlock confirm.
                </p>
              )}
              {showMismatch && (
                <p
                  id="password-mismatch"
                  role="alert"
                  className="mt-1.5 text-sm text-red-600 dark:text-red-400"
                >
                  Passwords do not match
                </p>
              )}
              {passwordsMatch && (
                <p className="mt-1.5 text-sm text-green-700 dark:text-green-400">
                  Passwords match
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={!canSubmit}
              className="sm:col-span-2 rounded-full bg-[#a44c2d] py-3 font-semibold text-white shadow-lg shadow-[#a44c2d]/20 transition hover:bg-[#8e3f24] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8e3f24] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100"
            >
              {loading ? 'Creating account…' : 'Register'}
            </button>
          </form>

          <p className="mt-4 text-center text-sm">
            <Link
              to="/login"
              className="font-semibold text-[#2c5282] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2c5282] dark:text-[#a9c8ed]"
            >
              Back to login
            </Link>
          </p>
        </div>
      </main>

      <footer className="relative z-10 px-4 py-2 text-center text-xs text-slate-500 dark:text-slate-400">
        © {new Date().getFullYear()} CondoPay · Built for clearer rent management
      </footer>
    </div>
  );
}
