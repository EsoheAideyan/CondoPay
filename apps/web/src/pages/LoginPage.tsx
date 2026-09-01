import { FormEvent, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';

import { PasswordField } from '../components/PasswordField';
import { SereneBackground } from '../components/SereneBackground';
import { ThemeToggle } from '../components/ThemeToggle';
import { ZoomControls } from '../components/ZoomControls';
import { useAuth } from '../context/AuthContext';
import { ApiError } from '../lib/api';


export default function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to="/dashboard" replace />;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-svh flex-col overflow-x-hidden bg-[#f8f7fb] text-[#24364b] dark:bg-[#101827] dark:text-slate-100">
      <SereneBackground />
      <div className="absolute right-0 top-0 z-20 flex justify-end gap-2 p-3 sm:p-5">
        <ZoomControls />
        <ThemeToggle />
      </div>

      <main className="relative z-10 flex w-full flex-1 flex-col items-center justify-center px-4 pb-3 pt-14 sm:px-6 sm:pt-16">
        <header className="mb-3 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-[#2c5282] sm:text-4xl dark:text-[#a9c8ed]">
            CondoPay
          </h1>
          <p className="mx-auto mt-1 max-w-md text-sm font-medium leading-5 text-[#48698d] sm:text-base dark:text-slate-300">
            Rent management, made simple and transparent.
          </p>
        </header>

        <section
          aria-labelledby="sign-in-heading"
          className="w-full max-w-md rounded-[2rem] border border-white/80 bg-white/90 p-4 shadow-[0_24px_70px_-28px_rgba(38,52,73,0.38)] backdrop-blur-md sm:p-5 dark:border-slate-700/80 dark:bg-slate-800/90"
        >
          <h2
            id="sign-in-heading"
            className="text-2xl font-semibold text-[#263449] dark:text-white"
          >
            Welcome home
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Sign in to manage your rent and residence.
          </p>

          <div className="mt-3 rounded-2xl border border-[#e7e4e8] bg-[#f5f3f6]/90 px-3.5 py-2.5 dark:border-slate-600 dark:bg-slate-700/70">
            <p className="text-[0.6875rem] font-bold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-300">
              Demo credentials
            </p>
            <p className="mt-1 text-xs leading-4 text-slate-600 sm:text-sm dark:text-slate-200">
              <strong className="font-semibold text-[#334e70] dark:text-white">
                Admin:
              </strong>{' '}
              admin@demo.condopay.com
              <br />
              <strong className="font-semibold text-[#334e70] dark:text-white">
                Tenant:
              </strong>{' '}
              tenant@demo.condopay.com
              <br />
              <strong className="font-semibold text-[#334e70] dark:text-white">
                Password:
              </strong>{' '}
              Demo123!
            </p>
          </div>

          {error && (
            <p
              role="alert"
              className="mt-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300"
            >
              {error}
            </p>
          )}

          <form onSubmit={handleSubmit} className="mt-3 space-y-2.5" noValidate>
            <div>
              <label
                htmlFor="email"
                className="ml-1 block text-sm font-medium text-[#34445a] dark:text-slate-200"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                placeholder="you@example.com"
                className="mt-1 w-full rounded-2xl border border-[#d9dce7] bg-[#f7f6fa]/90 px-4 py-2 text-[#24364b] placeholder:text-slate-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2c5282] dark:border-slate-600 dark:bg-slate-900/70 dark:text-white dark:focus-visible:outline-[#a9c8ed]"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="[&_input]:!mt-1 [&_input]:!rounded-2xl [&_input]:!border-[#d9dce7] [&_input]:!bg-[#f7f6fa]/90 [&_input]:!px-4 [&_input]:!py-2 [&_input]:!text-[#24364b] [&_input]:focus-visible:!outline-[#2c5282] [&_label]:!ml-1 [&_label]:!text-[#34445a] [&_button]:!right-3 [&_button]:!text-[#2c5282] dark:[&_input]:!border-slate-600 dark:[&_input]:!bg-slate-900/70 dark:[&_input]:!text-white dark:[&_input]:focus-visible:!outline-[#a9c8ed] dark:[&_label]:!text-slate-200 dark:[&_button]:!text-[#a9c8ed]">
              <PasswordField
                id="password"
                label="Password"
                autoComplete="current-password"
                value={password}
                onChange={setPassword}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-1 w-full rounded-full bg-[#a44c2d] py-2.5 font-semibold text-white shadow-lg shadow-[#a44c2d]/20 transition hover:bg-[#8e3f24] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8e3f24] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 disabled:active:scale-100"
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <p className="mt-3 text-center text-sm text-slate-500 dark:text-slate-400">
            No account?{' '}
            <Link
              to="/register"
              className="font-semibold text-[#2c5282] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2c5282] dark:text-[#a9c8ed]"
            >
              Register
            </Link>
          </p>
        </section>
      </main>

      <footer className="relative z-10 px-4 py-2 text-center text-xs text-slate-500 dark:text-slate-400">
        © {new Date().getFullYear()} CondoPay · Built for clearer rent management
      </footer>
    </div>
  );
}
