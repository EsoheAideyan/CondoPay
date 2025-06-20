import {Routes, Route, Navigate} from 'react-router-dom';
import Login from '../pages/login';
import Dashboard from '../pages/dashboard';
import Register from '../pages/register';
import Admin from '../pages/admin';
import Payments from '../pages/payments';
import { useAuth} from '../hooks/useAuth';

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!user) {
        console.log("User not authenticated, redirecting to login");    
        return <Navigate to="/" />;
    }

    return <>{children}</>;
};

// Admin Route Component
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
    const { user, isAdmin, loading } = useAuth();

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!user || !isAdmin) {
        console.log("User not authenticated, redirecting to login");
        return <Navigate to="/dashboard" />;
    }

    return <>{children}</>;                                                                                                                                                                                                                                                                                                          
};

export default function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Protected Routes */}
            <Route path="/dashboard" element={
                <ProtectedRoute>
                    <Dashboard />
                </ProtectedRoute>
            } />
            
            <Route path="/payments" element={
                <ProtectedRoute>
                    <Payments />
                </ProtectedRoute>
            } />
            
            {/* Admin Routes */}
            <Route path="/admin" element={
                <AdminRoute>
                    <Admin />
                </AdminRoute>
            } />

            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/" />} />
        </Routes>
    );
}