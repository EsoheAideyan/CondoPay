/**
 * Route guards — mirror the idea of ProtectedRoute / AdminRoute from the legacy Firebase app,
 * but now we check JWT + user.role from our API.
 */

import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { SereneBackground } from './SereneBackground';

function LoadingScreen() {
  return (
    <div className="relative flex min-h-svh items-center justify-center overflow-hidden bg-[#f8f7fb] dark:bg-[#101827]">
      <SereneBackground />
      <p className="relative z-10 rounded-full border border-[#e7e4e8] bg-white/85 px-5 py-2.5 font-medium text-[#2c5282] shadow-sm backdrop-blur-md dark:border-slate-700 dark:bg-slate-800/85 dark:text-[#a9c8ed]">
        Loading…
      </p>
    </div>
  );
}

/** Must be logged in */
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

/** Must be logged in as admin */
export function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}
