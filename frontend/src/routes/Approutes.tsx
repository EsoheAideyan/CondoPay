import {Routes, Route, Navigate} from 'react-router-dom';
import { ProtectedRoute, AdminRoute, LoginRoute } from '../components/routes';
import Login from '../pages/login';
import Dashboard from '../pages/dashboard';
import Register from '../pages/register';
import Admin from '../pages/admin';
import Payments from '../pages/payments';

export default function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={
                <LoginRoute>
                    <Login />
                </LoginRoute>
            } />
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