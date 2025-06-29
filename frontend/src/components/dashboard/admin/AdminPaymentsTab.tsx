import { useState, useEffect } from 'react';
import { db } from '../../../firebase/firebase';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { User } from '../../../types/dashboard';
import { useAuth } from '../../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { LoadingSpinner } from '../../common/LoadingSpinner';


export default function AdminPaymentsTab() {
    const { user, loading } = useAuth();
    const [recentPayments, setRecentPayments] = useState<User[]>([]); 
    const [recentTenants, setRecentTenants] = useState<User[]>([]);  
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {

        const fetchRecentPayments = async () => {
            console.log('AdminPaymentsTab: Starting to fetch payments data');
            console.log('AdminPayments: User buildingId:', user?.buildingId);
            try{
                if(!user || !user.buildingId){
                    setError("User not found or building ID is missing.");
                    return;
                }
                console.log('AdminPaymentsTab: Fetching payments for buildingId:', user.buildingId);
                const paymentsRef = collection(db, 'payments');
                const paymentsQuery = query(
                    paymentsRef,    
                    where('buildingId', '==', user.buildingId),
                    orderBy('timestamp', 'desc') // Temporarily commented out until index is created
                );

                const paymentsSnapshot = await getDocs(paymentsQuery);
                console.log('AdminPaymentsTab: Payments data fetched successfully'); 
                console.log('AdminPaymentsTab: Number of payment documents found:', paymentsSnapshot.size);

                const paymentsData: User[] = [];
                paymentsSnapshot.forEach((doc) => {
                    const data = doc.data() as User;
                    console.log('AdminPaymentsTab: Processing payment document:', doc.id, data);
                    paymentsData.push({
                        ...data,
                        uid: doc.id, // Include the document ID
                    } as User);
                });

                console.log('AdminPaymentsTab: Final payments data:', paymentsData);
                setRecentPayments(paymentsData);
            }catch (err) {
                console.error("Error fetching recent payments:", err);
                setError("Failed to fetch recent payments.");
            }
        }
        fetchRecentPayments();
    }, [user]);

    if (!user || loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <LoadingSpinner />
            </div>
        );
    }   

    const getPaymentStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return 'bg-green-100 text-green-800';
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'failed': return 'bg-red-100 text-red-800';
            case 'disputed': return 'bg-orange-100 text-orange-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };


    return (
        <div>
            <div className="p-6">
                <h2 className="text-xl font-semibold mb-4">Payment Management</h2>
                <p className="text-gray-600">View all tenant payments, generate reports, and manage payment schedules.</p>
            </div>

            <div className="p-6">
                {loading ? (
                    <LoadingSpinner />
                ) : (
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Recent Payments</h3>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Tenant
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Unit
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Rent
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {recentPayments.map((payment) => (
                                        <tr key={payment.uid} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-8 w-8">
                                                        <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                                                            <span className="text-xs font-medium text-gray-700">
                                                                {payment.FirstName?.[0]}{payment.LastName?.[0]}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="ml-3">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {payment.FirstName} {payment.LastName}
                                                        </div>
                                                        <div className="text-sm text-gray-500">{payment.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {payment.unitNo || 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusColor(payment.status)}`}>
                                                    {payment.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {payment.monthlyRent ? `$${payment.monthlyRent.toFixed(2)}` : 'N/A'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                        </div>
                        {recentPayments.length > 0 ? (
                            <ul className="list-disc pl-5">
                                {recentPayments.map((payment) => (
                                    <li key={payment.uid} className="mb-2">
                                        {payment.FirstName} {payment.LastName} - ${payment.monthlyRent}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p>No recent payments found.</p>
                        )}

                        <div className="flex justify-end mb-4">
                                <button
                                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                                >
                                    Refresh Payments
                                </button>
                            </div>
                    </div>
                )}
            </div>
        </div>
    );
} 