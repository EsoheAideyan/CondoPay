import { useState, useEffect } from 'react';
import { createUserWithEmailAndPassword } from "firebase/auth"
import { doc, setDoc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from "../firebase/firebase";
import { useNavigate } from 'react-router-dom';
import { PasswordInput } from '../components/common/PasswordInput';

export default function Register() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [userName, setUserName] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [checkingUsername, setCheckingUsername] = useState(false);
    const navigate = useNavigate();

    // Auto-generate username when first name or last name changes
    useEffect(() => {
        if (firstName && lastName) {
            const baseUsername = `${firstName.toLowerCase()}.${lastName.toLowerCase()}`;
            setUserName(baseUsername);
        }
    }, [firstName, lastName]);

    // Check if username already exists
    const checkUsernameAvailability = async (username: string) => {
        if (!username) return true;
        
        setCheckingUsername(true);
        try {
            // Query Firestore to check if username exists
            const usersRef = collection(db, 'users');
            const q = query(usersRef, where('userName', '==', username));
            const querySnapshot = await getDocs(q);
            
            return querySnapshot.empty; // true if username is available
        } catch (error) {
            console.error('Error checking username:', error);
            return true; // Assume available if error
        } finally {
            setCheckingUsername(false);
        }
    };

    // Generate unique username
    const generateUniqueUsername = async (baseUsername: string) => {
        let username = baseUsername;
        let counter = 1;
        
        while (!(await checkUsernameAvailability(username))) {
            username = `${baseUsername}${counter}`;
            counter++;
        }
        
        return username;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Generate unique username
            const baseUsername = `${firstName.toLowerCase()}.${lastName.toLowerCase()}`;
            const uniqueUsername = await generateUniqueUsername(baseUsername);
            setUserName(uniqueUsername);

            // Store personal info in sessionStorage for next step
            const personalInfo = {
                email,
                password,
                firstName,
                lastName,
                phoneNumber,
                userName: uniqueUsername
            };
            sessionStorage.setItem('registration_personal_info', JSON.stringify(personalInfo));

            // Navigate to rental information step
            navigate('/registerRentalInfo');
            
        } catch (error: any) {
            console.error("Error in registration step 1:", error);
            setError('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 py-8">
            <div className="px-8 py-6 mt-4 text-left bg-white shadow-lg rounded-lg w-full max-w-md">
                <div className="mb-6">
                    <h3 className="text-2xl font-bold text-center mb-2">Register to CondoPay</h3>
                    <div className="flex justify-center items-center space-x-2">
                        <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                        <div className="text-gray-400">Personal Information</div>
                        <div className="w-8 h-8 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center text-sm font-bold">2</div>
                        <div className="text-gray-400">Rental Information</div>
                    </div>
                </div>
                
                {error && (
                    <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                        {error}
                    </div>
                )}
                
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                First Name *
                            </label>
                            <input
                                type="text"
                                placeholder="Enter your first name"
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                required
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Last Name *
                            </label>
                            <input
                                type="text"
                                placeholder="Enter your last name"
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                required
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Username *
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Auto-generated from name"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                                    value={userName}
                                    readOnly
                                />
                                {checkingUsername && (
                                    <div className="absolute right-3 top-2">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                    </div>
                                )}
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                                Username will be auto-generated as: {firstName && lastName ? `${firstName.toLowerCase()}.${lastName.toLowerCase()}` : 'firstname.lastname'}
                            </p>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Phone Number *
                            </label>
                            <input
                                type="tel"
                                placeholder="Enter your phone number"
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                required
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Email *
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
                        
                        <div>
                            <PasswordInput
                                value={password}
                                onChange={setPassword}
                                placeholder="Enter your password"
                                required
                            />
                        </div>
                    </div>
                    
                    <div className="flex items-center justify-between pt-6">
                        <button
                            type="submit"
                            disabled={loading || !firstName || !lastName || !email || !password || !phoneNumber}
                            className="w-full px-6 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {loading ? 'Processing ...' : 'Next'}
                        </button>
                    </div>
                    
                    <div className="text-center mt-4">
                        <a
                            href="/login"
                            className="text-sm text-blue-600 hover:underline"
                        >
                            Already have an account? Login here
                        </a>
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
