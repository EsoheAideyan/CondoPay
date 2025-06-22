import { useAuth } from '../hooks/useAuth';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase/firebase';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
    const { user, isAdmin } = useAuth();
    const navigate = useNavigate();

    console.log('Dashboard rendered - user:', user, 'isAdmin:', isAdmin);

    const handleLogout = async () => {
        try {
            await signOut(auth);
            navigate('/');
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Dashboard</h1>
                <button
                    onClick={handleLogout}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                    Logout
                </button>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-semibold mb-4">Welcome!</h2>
                {user ? (
                    <div className="space-y-2">
                        <p><strong>Email:</strong> {user.email}</p>
                        <p><strong>Name:</strong> {user.userName || user.displayName || 'N/A'}</p>
                        <p><strong>Role:</strong> {isAdmin ? 'Admin' : 'Tenant'}</p>
                        <p><strong>UID:</strong> {user.uid}</p>
                        {user.buildingId && (
                            <p><strong>Building:</strong> {user.buildingId}</p>
                        )}
                    </div>
                ) : (
                    <p>No user data available</p>
                )}
            </div>
        </div>
    );
}