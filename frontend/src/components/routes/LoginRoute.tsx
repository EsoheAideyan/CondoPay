import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { LoadingSpinner } from '../common/LoadingSpinner';

interface LoginRouteProps {
    children: ReactNode;
}

export const LoginRoute = ({ children }: LoginRouteProps) => {
    const { user, loading } = useAuth();

    if (loading) {
        return <LoadingSpinner message="Checking authentication..." />;
    }

    if (user) {
        return <Navigate to="/dashboard" />;
    }

    return <>{children}</>;
}; 