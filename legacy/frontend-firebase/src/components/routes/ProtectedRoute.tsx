import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { LoadingSpinner } from '../common/LoadingSpinner';

interface ProtectedRouteProps {
    children: ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
    const { user, loading } = useAuth();

    console.log('ProtectedRoute - user:', user, 'loading:', loading, 'user type:', typeof user);

    // Show loading while authentication is being checked
    if (loading) {
        console.log('ProtectedRoute - showing loading spinner');
        return <LoadingSpinner message="Checking authentication..." />;
    }

    // Only redirect if user is explicitly null (not undefined or falsy)
    if (user === null) {
        console.log("User not authenticated, redirecting to login");
        return <Navigate to="/" />;
    }

    // If user exists, render the protected content
    if (user) {
        console.log('ProtectedRoute - user authenticated, rendering children');
        return <>{children}</>;
    }

    // Fallback loading state
    console.log('ProtectedRoute - fallback loading state');
    return <LoadingSpinner message="Loading..." />;
}; 