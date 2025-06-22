import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { LoadingSpinner } from '../common/LoadingSpinner';

interface AdminRouteProps {
    children: ReactNode;
}

export const AdminRoute = ({ children }: AdminRouteProps) => {
    const { user, isAdmin, loading } = useAuth();

    if (loading) {
        return <LoadingSpinner message="Checking admin privileges..." />;
    }

    if (!user || !isAdmin) {
        console.log("User not admin, redirecting to dashboard");
        return <Navigate to="/dashboard" />;
    }

    return <>{children}</>;
}; 