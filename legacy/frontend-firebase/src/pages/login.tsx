import { useState } from 'react';
import { signInWithEmailAndPassword } from "firebase/auth"
import { auth } from "../firebase/firebase";
import {useNavigate } from 'react-router-dom';
import { PasswordInput } from '../components/common/PasswordInput';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            console.log('Attempting to sign in with:', email);
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            console.log('Sign in successful for:', email);
            console.log('User credential:', userCredential);
            console.log('Current auth state:', auth.currentUser);
            
            // Wait a moment for the auth state to update
            setTimeout(() => {
                console.log('Auth state after timeout:', auth.currentUser);
                navigate('/dashboard');
            }, 1000);
            
        } catch (error: any) {
            console.error("Error logging in:", error);
            let errorMessage = 'Failed to log in';
            
            // Handle specific Firebase auth errors
            switch (error.code) {
                case 'auth/user-not-found':
                    errorMessage = 'No account found with this email address';
                    break;
                case 'auth/wrong-password':
                    errorMessage = 'Incorrect password';
                    break;
                case 'auth/invalid-email':
                    errorMessage = 'Invalid email address';
                    break;
                case 'auth/too-many-requests':
                    errorMessage = 'Too many failed attempts. Please try again later';
                    break;
                default:
                    errorMessage = error.message || 'Failed to log in';
            }
            
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="px-8 py-6 mt-4 text-left bg-white shadow-lg rounded-lg w-full max-w-md">
                <h3 className="text-2xl font-bold text-center mb-6">Login to CondoPay</h3>
                {error && (
                    <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                        {error}
                    </div>
                )}
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Email
                            </label>
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        
                        <PasswordInput
                            value={password}
                            onChange={setPassword}
                            placeholder="Enter your password"
                            label="Password"
                            required
                        />
                        
                        <div className="flex items-center justify-between pt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full px-6 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {loading ? 'Logging in...' : 'Login'}
                            </button>
                        </div>
                        
                        <div className="text-center">
                            <a 
                                href="/register" 
                                className="text-sm text-blue-600 hover:underline"
                            >
                                Don't have an account? Register here
                            </a>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}

// return (
//  <div className="flex items-center justify-center min-h-screen bg-gray-100">
//      <h1 className="text-2xl font-bold">Login Page</h1>
//    </div>
    //   );
