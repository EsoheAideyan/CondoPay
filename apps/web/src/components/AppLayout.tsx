import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { formatUserSubtitle } from '../lib/formatUser';
import { SereneBackground } from './SereneBackground';
import { ThemeToggle } from './ThemeToggle';
import { ZoomControls } from './ZoomControls';

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
    <div className="relative flex min-h-svh flex-col overflow-x-hidden bg-[#f8f7fb] text-[#24364b] dark:bg-[#101827] dark:text-slate-100">
      <SereneBackground />
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-[#2c5282] focus:px-4 focus:py-2 focus:text-white"
      >
        Skip to main content
      </a>

      <header className="relative z-10 border-b border-[#e7e4e8] bg-white/85 shadow-sm backdrop-blur-md dark:border-slate-700/80 dark:bg-slate-800/85">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <div>
            <p className="text-2xl font-bold text-[#2c5282] dark:text-[#a9c8ed]">
              CondoPay
            </p>
            <h1 className="mt-1 text-sm font-medium text-[#48698d] dark:text-slate-300">
              {title}
            </h1>
            {userMetaLine && (
              <p className="text-sm text-[#52657b] dark:text-slate-300">
                {userMetaLine}
              </p>
            )}
            {subtitle && (
              <p className="text-sm text-slate-500 dark:text-slate-400">
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
                  className="rounded-full border border-[#d9dce7] bg-white/70 px-3 py-1.5 text-sm font-medium text-[#2c5282] hover:bg-[#f0eff4] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2c5282] dark:border-slate-600 dark:bg-slate-800/70 dark:text-[#a9c8ed] dark:hover:bg-slate-700"
                >
                  Dashboard
                </Link>
                <Link
                  to="/maintenance"
                  className="rounded-full border border-[#d9dce7] bg-white/70 px-3 py-1.5 text-sm font-medium text-[#2c5282] hover:bg-[#f0eff4] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2c5282] dark:border-slate-600 dark:bg-slate-800/70 dark:text-[#a9c8ed] dark:hover:bg-slate-700"
                >
                  Maintenance
                </Link>
              </>
            )}
            {showAdminLink && user?.role === 'admin' && (
              <Link
                to="/admin"
                className="rounded-full border border-[#d9dce7] bg-white/70 px-3 py-1.5 text-sm font-medium text-[#2c5282] hover:bg-[#f0eff4] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2c5282] dark:border-slate-600 dark:bg-slate-800/70 dark:text-[#a9c8ed] dark:hover:bg-slate-700"
              >
                Admin panel
              </Link>
            )}
            <ZoomControls />
            <ThemeToggle />
            <button
              type="button"
              onClick={logout}
              className="rounded-full bg-[#a44c2d] px-3 py-1.5 text-sm font-medium text-white hover:bg-[#8e3f24] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8e3f24] dark:bg-[#a95a3e] dark:hover:bg-[#b9694c]"
            >
              Log out
            </button>
          </nav>
        </div>
      </header>

      <main
        id="main-content"
        className="relative z-10 mx-auto w-full max-w-5xl flex-1 p-4 sm:p-6"
      >
        {children}
      </main>

      <footer className="relative z-10 px-4 py-2 text-center text-xs text-slate-500 dark:text-slate-400">
        © {new Date().getFullYear()} CondoPay · Built for clearer rent management
      </footer>
    </div>
  );
}

/** Shared input styles for forms */
export const inputClassName =
  'mt-1 w-full rounded-2xl border border-[#d9dce7] bg-[#f7f6fa]/90 px-4 py-2.5 text-[#24364b] placeholder:text-slate-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#2c5282] dark:border-slate-600 dark:bg-slate-900/70 dark:text-slate-100 dark:focus-visible:outline-[#a9c8ed]';

export const labelClassName =
  'block text-sm font-medium text-[#34445a] dark:text-slate-200';
