import { signOut } from 'firebase/auth';
import { auth } from '../../firebase/firebase';
import { useNavigate } from 'react-router-dom';
import { User } from '../../types/dashboard';

interface DashboardHeaderProps {
    user: User;
    isAdmin: boolean;
}

export default function DashboardHeader({ user, isAdmin }: DashboardHeaderProps) {
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await signOut(auth);
            navigate('/');
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    return (
        <header className="bg-white shadow-sm border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <div className="flex items-center">
                        <h1 className="text-2xl font-bold text-gray-900">CondoPay</h1>
                        <span className="ml-4 px-3 py-1 text-sm font-medium rounded-full bg-blue-100 text-blue-800">
                            {isAdmin ? 'Admin Dashboard' : 'Tenant Dashboard'}
                        </span>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                        <div className="text-right">
                            <p className="text-sm font-medium text-purple-900">
                                {user.FirstName} {user.LastName}
                            </p>
                            <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
} 