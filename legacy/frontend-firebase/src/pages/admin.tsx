import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

export default function Admin() {
    const { user, isAdmin } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (user && isAdmin) {
            // Redirect to dashboard which will show admin tabs
            navigate('/dashboard');
        } else if (user && !isAdmin) {
            // Redirect non-admin users away
            navigate('/dashboard');
        }
    }, [user, isAdmin, navigate]);

    if (!user) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <LoadingSpinner />
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="text-center">
                <LoadingSpinner />
                <p className="mt-4 text-gray-600">Redirecting to admin dashboard...</p>
            </div>
        </div>
    );
} 