import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { formatUserSubtitle } from '../lib/formatUser';
import { ThemeToggle } from './ThemeToggle';

interface AppLayoutProps {
  title: string;
  subtitle?: string;
  /** Show signed-in user as "Name · Role · Status" under the page title */
  showUserMeta?: boolean;
  children: ReactNode;
  showAdminLink?: boolean;
  /** Dashboard + Maintenance links in the header */
  showAppNav?: boolean;
}

export function AppLayout({
  title,
  subtitle,
  showUserMeta,
  children,
  showAdminLink,
  showAppNav,
}: AppLayoutProps) {
  const { user, logout } = useAuth();
  const userMetaLine = user && showUserMeta ? formatUserSubtitle(user) : null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-blue-600 focus:px-4 focus:py-2 focus:text-white"
      >
        Skip to main content
      </a>

      <header className="border-b border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">
              CondoPay
            </p>
            <h1 className="mt-1 text-sm font-medium text-slate-600 dark:text-slate-400">
              {title}
            </h1>
            {userMetaLine && (
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {userMetaLine}
              </p>
            )}
            {subtitle && (
              <p className="text-sm text-slate-500 dark:text-slate-500">
                {subtitle}
              </p>
            )}
          </div>
          <nav
            className="flex flex-wrap items-center gap-2"
            aria-label="Account navigation"
          >
            {showAppNav && (
              <>
                <Link
                  to="/dashboard"
                  className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700"
                >
                  Dashboard
                </Link>
                <Link
                  to="/maintenance"
                  className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700"
                >
                  Maintenance
                </Link>
              </>
            )}
            {showAdminLink && user?.role === 'admin' && (
              <Link
                to="/admin"
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                Admin panel
              </Link>
            )}
            <ThemeToggle />
            <button
              type="button"
              onClick={logout}
              className="rounded-lg bg-slate-800 px-3 py-1.5 text-sm text-white hover:bg-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:bg-slate-600 dark:hover:bg-slate-500"
            >
              Log out
            </button>
          </nav>
        </div>
      </header>

      <main id="main-content" className="mx-auto max-w-5xl p-4 sm:p-6">
        {children}
      </main>
    </div>
  );
}

/** Shared input styles for forms */
export const inputClassName =
  'mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-blue-600 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100';

export const labelClassName =
  'block text-sm font-medium text-slate-700 dark:text-slate-300';
