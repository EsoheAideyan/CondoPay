import { useEffect, useState } from 'react';
import { createUserWithEmailAndPassword } from "firebase/auth"
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from "../firebase/firebase";
import {useNavigate } from 'react-router-dom';

export default function RegisterRentalInfo() {
    const [buildingId, setBuildingId] = useState('');
    const [unitNo, setUnitNo] = useState('');
    const [leaseStartDate, setLeaseStartDate] = useState('');
    const [leaseEndDate, setLeaseEndDate] = useState('');
    const [monthlyRent, setMonthlyRent] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [personalInfo, setPersonalInfo] = useState<any>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const storedInfo = sessionStorage.getItem('registration_personal_info');
        if(storedInfo){
            setPersonalInfo(JSON.parse(storedInfo));
            console.log('Loaded personal info from session storage:', JSON.parse(storedInfo));
        }else{
            console.error('No personal info found in session storage');
            navigate('/register'); // Redirect to registration page if no info found
        }
    }, [navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            if (!personalInfo) {
                throw new Error('Personal information is missing');
            }
            console.log('Registering with personal info:', personalInfo.email);
            const userCredential = await createUserWithEmailAndPassword(auth, personalInfo.email, personalInfo.password);
            console.log('Registration successful for:', personalInfo.email);
            console.log('User credential:', userCredential);
            console.log('Current auth state:', auth.currentUser);
            
            // Create user document in Firestore - always set as tenant
            if (userCredential.user) {
                const userData = {
                    uid: userCredential.user.uid,
                    email: userCredential.user.email,
                    userName: personalInfo.userName || userCredential.user.displayName || 'New User',
                    role: 'tenant', // tenant, admin
                    firstName: personalInfo.firstName,
                    lastName: personalInfo.lastName,
                    phone: personalInfo.phone,
                    buildingId: buildingId,
                    unitNo: unitNo,
                    leaseStartDate: leaseStartDate,
                    leaseEndDate: leaseEndDate,
                    monthlyRent: parseFloat(monthlyRent) || 0,
                    status: 'active', // active, inactive, pending
                    createdAt: new Date(),
                    updatedAt: new Date()
                };
                
                console.log('Creating user document in Firestore:', userData);
                await setDoc(doc(db, 'users', userCredential.user.uid), userData);
                console.log('User document created successfully');
            }

            // Clear session storage
            sessionStorage.removeItem('registration_personal_info');
            
            // Wait a moment for the auth state to update
            setTimeout(() => {
                console.log('Auth state after timeout:', auth.currentUser);
                navigate('/dashboard');
            }, 1000);
            
        } catch (error: any) {
            console.error("Error registering:", error);
            let errorMessage = 'Failed to register';
            
            // Handle specific Firebase auth errors
            switch (error.code) {
                case 'auth/email-already-in-use':
                    errorMessage = 'An account already exists with this email address';
                    break;
                case 'auth/username-already-in-use':
                    errorMessage = 'An account already exists with this username';
                    break;
                case 'auth/weak-password':
                    errorMessage = 'Password is too weak';
                    break;
                case 'auth/invalid-email':
                    errorMessage = 'Invalid email address';
                    break;
                case 'auth/too-many-requests':
                    errorMessage = 'Too many failed attempts. Please try again later';
                    break;
                default:
                    errorMessage = error.message || 'Failed to register';
            }
            
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        navigate('/register');
    };

    if (!personalInfo) {    
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <h1 className="text-2xl font-bold">Loading ...</h1>
            </div>
        );

    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 py-8">
            <div className="px-8 py-6 mt-4 text-left bg-white shadow-lg rounded-lg w-full max-w-2xl">
                <h3 className="text-2xl font-bold text-center mb-6">Register to CondoPay</h3>
                {error && (
                    <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                        {error}
                    </div>
                )}
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">                        
                        
                        {/* Rental Information */}
                        <div className="md:col-span-2">
                            <h4 className="text-lg font-semibold mb-3 text-gray-700 mt-4">Rental Information</h4>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Building Name *
                            </label>
                            <input
                                type="text"
                                placeholder="e.g., Classic, Modern, etc."
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={buildingId}
                                onChange={(e) => setBuildingId(e.target.value)}
                                required
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Unit Number *
                            </label>
                            <input
                                type="text"
                                placeholder="e.g., 407, 2B, etc."
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={unitNo}
                                onChange={(e) => setUnitNo(e.target.value)}
                                required
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Lease Start Date *
                            </label>
                            <input
                                type="date"
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={leaseStartDate}
                                onChange={(e) => setLeaseStartDate(e.target.value)}
                                required
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Lease End Date *
                            </label>
                            <input
                                type="date"
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={leaseEndDate}
                                onChange={(e) => setLeaseEndDate(e.target.value)}
                                required
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Monthly Rent ($) *
                            </label>
                            <input
                                type="number"
                                placeholder="0.00"
                                step="0.01"
                                min="0"
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={monthlyRent}
                                onChange={(e) => setMonthlyRent(e.target.value)}
                                required
                            />
                        </div>
                    </div>
                    
                    <div className="flex items-center justify-between pt-6 space-x-4">
                        <button
                            type="button"
                            onClick={handleBack}
                            className="flex-1 px-6 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                        >
                            Back
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !buildingId || !unitNo || !leaseStartDate || !leaseEndDate || !monthlyRent}
                            className="flex-1 px-6 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {loading ? 'Registering ...' : 'Complete Registration'}
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
