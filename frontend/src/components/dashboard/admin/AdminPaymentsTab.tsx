import { useState, useEffect } from 'react';
import { db } from '../../../firebase/firebase';
import { collection, query, where, getDocs, orderBy, updateDoc, doc, addDoc, serverTimestamp } from 'firebase/firestore';
import { Payment, PaymentStats, OverdueTenant, User } from '../../../types/dashboard';
import { useAuth } from '../../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { LoadingSpinner } from '../../common/LoadingSpinner';

export default function AdminPaymentsTab() {
    const { user, loading } = useAuth();
    const [payments, setPayments] = useState<Payment[]>([]);
    const [tenants, setTenants] = useState<User[]>([]);
    const [overdueTenants, setOverdueTenants] = useState<OverdueTenant[]>([]);
    const [loadingPayments, setLoadingPayments] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
    const [showReceipt, setShowReceipt] = useState(false);
    const [showManualPaymentModal, setShowManualPaymentModal] = useState(false);
    const [showDiscountModal, setShowDiscountModal] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
    const [paymentStats, setPaymentStats] = useState<PaymentStats>({
        totalTenants: 0,
        totalCollected: 0,
        pendingPayments: 0,
        overduePayments: 0,
        overdueTenants: 0
    });
    const navigate = useNavigate();

    const fetchPayments = async () => {
        console.log('AdminPaymentsTab: Starting to fetch payments data');
        console.log('AdminPayments: User buildingId:', user?.buildingId);
        
        if (!user || !user.buildingId) {
            setError("User not found or building ID is missing.");
            return;
        }

        setLoadingPayments(true);
        setError(null);

        try {
            console.log('AdminPaymentsTab: Fetching payments for buildingId:', user.buildingId);
            const paymentsRef = collection(db, 'payments');
            const paymentsQuery = query(
                paymentsRef,    
                where('buildingId', '==', user.buildingId),
                orderBy('timestamp', 'desc')
            );

            const paymentsSnapshot = await getDocs(paymentsQuery);
            console.log('AdminPaymentsTab: Payments data fetched successfully'); 
            console.log('AdminPaymentsTab: Number of payment documents found:', paymentsSnapshot.size);

            const paymentsData: Payment[] = [];
            paymentsSnapshot.forEach((doc) => {
                const data = doc.data();
                console.log('AdminPaymentsTab: Processing payment document:', doc.id, data);
                
                // Convert Firestore timestamp to Date
                const timestamp = data.timestamp?.toDate?.() || new Date(data.timestamp) || new Date();
                const paymentDate = data.paymentDate?.toDate?.() || new Date(data.paymentDate) || undefined;
                
                paymentsData.push({
                    id: doc.id,
                    tenantId: data.tenantId || '',
                    tenantName: data.tenantName || `${data.FirstName || ''} ${data.LastName || ''}`.trim(),
                    tenantEmail: data.tenantEmail || data.email || '',
                    buildingId: data.buildingId || '',
                    unitNo: data.unitNo || '',
                    monthlyRent: data.monthlyRent || 0,
                    status: data.status || 'pending',
                    timestamp: timestamp,
                    paymentDate: paymentDate,
                    transactionId: data.transactionId || '',
                    notes: data.notes || ''
                });
            });

            console.log('AdminPaymentsTab: Final payments data:', paymentsData);
            setPayments(paymentsData);
        } catch (err) {
            console.error("Error fetching payments:", err);
            setError("Failed to fetch payments. Please try again.");
        } finally {
            setLoadingPayments(false);
        }
    };

    const fetchTenants = async () => {
        if (!user || !user.buildingId)  return;

        try{
            const tenantsRef = collection(db, 'users');
            const tenantsQuery = query(
                tenantsRef,
                where('buildingId', '==', user.buildingId),
                where('role', '==', 'tenant'),
                where('status', '==', 'active')
            );

            const tenantsSnapshot = await getDocs(tenantsQuery);
            const tenantsData: User[] = [];
            tenantsSnapshot.forEach((doc) => {
                const data = doc.data();
                tenantsData.push({
                    ...data,
                    uid: doc.id,
                    createdAt: data.createdAt?.toDate?.() || new Date(data.createdAt) || new Date(),
                    updatedAt: data.updatedAt?.toDate?.() || new Date(data.updatedAt) || new Date()
                } as User);
            });

            setTenants(tenantsData);
            calculateOverdueTenants(tenantsData, payments);
        } catch (err) {
            console.error("Error fetching tenants:", err);
            setError("Failed to fetch tenants. Please try again.");
        }
    };

    const calculateStats = (paymentsData : Payment[]) => {
        const now = new Date();
        const currentMonthPayments = paymentsData.filter(payment => 
            payment.timestamp.getMonth() === currentMonth && 
            payment.timestamp.getFullYear() === currentYear
        );

        const totalCollected = currentMonthPayments
            .filter(p => p.status === 'completed')
            .reduce((sum, p) => sum + p.monthlyRent, 0);

        const pendingPayments = currentMonthPayments
            .filter(p => p.status === 'pending')
            .reduce((sum, p) => sum + p.monthlyRent, 0);

        const overduePayments = calculateOverduePayment(tenants, paymentsData);

        setPaymentStats({
            totalCollected,
            pendingPayments,
            overduePayments,
            totalTenants: tenants.length,
            overdueTenants: overdueTenants.length
        });
    }

    const calculateOverduePayment = (tenantsData: User[], paymentsData: Payment[]) => {
        const now = new Date();
        let totalOverdue = 0;
        
        tenantsData.forEach(tenant => {
            const lastPayment = paymentsData
                .filter(p => p.tenantId === tenant.uid && p.status === 'completed')
                .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0];

            if (!lastPayment || isOverdue(lastPayment.timestamp, tenant.monthlyRent || 0)) {
                totalOverdue += tenant.monthlyRent || 0;
            }
        });

        return totalOverdue;
    }

    const calculateOverdueTenants = (tenantsData: User[], paymentsData: Payment[]) => {
        const now = new Date();
        const overdue: OverdueTenant[] = [];

        tenantsData.forEach(tenant => {
            const lastPayment = paymentsData
                .filter(p => p.tenantId === tenant.uid && p.status === 'completed')
                .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0];

            if (!lastPayment || isOverdue(lastPayment.timestamp, tenant.monthlyRent || 0)) {
                const daysOverdue = lastPayment 
                    ? Math.floor((now.getTime() - lastPayment.timestamp.getTime()) / (1000 * 60 * 60 * 24))
                    : 30; // Assume 30 days if no payment

                overdue.push({
                    uid: tenant.uid,
                    name: `${tenant.FirstName} ${tenant.LastName}`,
                    email: tenant.email,
                    unitNo: tenant.unitNo || '',
                    overdueAmount: tenant.monthlyRent || 0,
                    daysOverdue,
                    lastPaymentDate: lastPayment?.timestamp
                });
            }
        });

        setOverdueTenants(overdue);
    };

    const isOverdue = (lastPaymentDate: Date, monthlyRent: number): boolean => {
        const now = new Date();
        const daysSincePayment = Math.floor((now.getTime() - lastPaymentDate.getTime()) / (1000 * 60 * 60 * 24));
        return daysSincePayment > 30; // Consider overdue after 30 days
    };

        const markAsPaid = async (paymentId: string) => {
        try {
            const paymentRef = doc(db, 'payments', paymentId);
            await updateDoc(paymentRef, {
                status: 'completed',
                paymentDate: serverTimestamp(),
                notes: 'Marked as paid manually by admin'
            });

            // Refresh payments
            await fetchPayments();
        } catch (err) {
            console.error("Error marking payment as paid:", err);
            setError("Failed to mark payment as paid.");
        }
    };
    const applyDiscount = async (paymentId: string, discountAmount: number, reason: string) => {
        try {
            const paymentRef = doc(db, 'payments', paymentId);
            const payment = payments.find(p => p.id === paymentId);
            
            if (payment) {
                await updateDoc(paymentRef, {
                    monthlyRent: payment.monthlyRent - discountAmount,
                    notes: `${payment.notes || ''} Discount applied: $${discountAmount} - ${reason}`
                });

                // Add discount record
                await addDoc(collection(db, 'discounts'), {
                    paymentId,
                    amount: discountAmount,
                    reason,
                    appliedBy: user?.uid,
                    appliedAt: serverTimestamp()
                });

                await fetchPayments();
            }
        } catch (err) {
            console.error("Error applying discount:", err);
            setError("Failed to apply discount.");
        }
    };

     const sendReminder = async (tenantId: string) => {
        try {
            // Add reminder record
            await addDoc(collection(db, 'reminders'), {
                tenantId,
                buildingId: user?.buildingId,
                type: 'payment_reminder',
                sentAt: serverTimestamp(),
                sentBy: user?.uid
            });

            // In a real app, you'd integrate with email service here
            console.log('Reminder sent to tenant:', tenantId);
        } catch (err) {
            console.error("Error sending reminder:", err);
            setError("Failed to send reminder.");
        }
    };

    const generateReceipt = async (payment: Payment) => {
        try {
            const receiptData = {
                paymentId: payment.id,
                tenantName: payment.tenantName,
                tenantEmail: payment.tenantEmail,
                unitNo: payment.unitNo,
                amount: payment.monthlyRent,
                paymentDate: payment.paymentDate || payment.timestamp,
                transactionId: payment.transactionId,
                generatedBy: user?.uid,
                generatedAt: serverTimestamp()
            };

            await addDoc(collection(db, 'receipts'), receiptData);
            setSelectedPayment(payment);
            setShowReceipt(true);
        } catch (err) {
            console.error("Error generating receipt:", err);
            setError("Failed to generate receipt.");
        }
    };

        const exportCSV = () => {
        const headers = ['Tenant', 'Unit', 'Amount', 'Status', 'Date', 'Transaction ID'];
        const csvData = payments.map(p => [
            p.tenantName,
            p.unitNo,
            p.monthlyRent.toFixed(2),
            p.status,
            p.timestamp.toLocaleDateString(),
            p.transactionId || ''
        ]);

        const csvContent = [headers, ...csvData]
            .map(row => row.map(cell => `"${cell}"`).join(','))
            .join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `payments-${currentMonth + 1}-${currentYear}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    const generateMonthlyReport = () => {
        const monthName = new Date(currentYear, currentMonth).toLocaleDateString('en-US', { month: 'long' });
        const monthPayments = payments.filter(p => 
            p.timestamp.getMonth() === currentMonth && 
            p.timestamp.getFullYear() === currentYear
        );

        const report = {
            month: monthName,
            year: currentYear,
            totalPayments: monthPayments.length,
            totalCollected: monthPayments.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.monthlyRent, 0),
            pendingAmount: monthPayments.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.monthlyRent, 0),
            overdueAmount: paymentStats.overduePayments,
            totalTenants: paymentStats.totalTenants,
            overdueTenants: paymentStats.overdueTenants
        };

        console.log('Monthly Report:', report);
        // In a real app, you'd generate a PDF or send this to a reporting service
        return report;
    };

    useEffect(() => {
        if (user && user.buildingId) {
            fetchPayments();
            fetchTenants();
        }
    }, [user]);

    useEffect(() => {
       calculateStats(payments);
       calculateOverdueTenants(tenants, payments);
    }, [payments, tenants, currentMonth, currentYear]);

    const handleRefresh = () => {
        fetchPayments();
    };

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

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <div className="space-y-6">
            <div className="p-6 bg-white rounded-lg shadow">
                <h2 className="text-xl font-semibold mb-4">Payment Management</h2>
                <p className="text-gray-600">Manage all tenant payments, generate reports, and manage payment schedules.</p>
            </div>

            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-lg shadow">
                    <div className="flex items-center">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                            </svg>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-500">Total Collected</p>
                            <p className="text-2xl font-bold text-gray-900">${paymentStats.totalCollected.toFixed(2)}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                    <div className="flex items-center">
                        <div className="p-2 bg-yellow-100 rounded-lg">
                            <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-500">Pending Amount</p>
                            <p className="text-2xl font-bold text-gray-900">${paymentStats.pendingPayments.toFixed(2)}</p>
                        </div>
                    </div>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow">
                    <div className="flex items-center">
                        <div className="p-2 bg-red-100 rounded-lg">
                            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-500">Overdue Amount</p>
                            <p className="text-2xl font-bold text-gray-900">${paymentStats.overduePayments.toFixed(2)}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                    <div className="flex items-center">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-500">Total Tenants</p>
                            <p className="text-2xl font-bold text-gray-900">{paymentStats.totalTenants}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex flex-wrap gap-4">
                    <button
                        onClick={() => setShowManualPaymentModal(true)}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                        Mark Payment as Paid
                    </button>
                    <button
                        onClick={() => setShowDiscountModal(true)}
                        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                    >
                        Apply Discount
                    </button>
                    <button
                        onClick={exportCSV}
                        className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                    >
                        Export CSV
                    </button>
                    <button
                        onClick={generateMonthlyReport}
                        className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
                    >
                        Generate Monthly Report
                    </button>
                </div>
            </div>

               {/* Overdue Tenants */}
            {overdueTenants.length > 0 && (
                <div className="bg-white rounded-lg shadow">
                    <div className="p-6 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900">Overdue Tenants</h3>
                        <p className="text-sm text-gray-600">Tenants with outstanding balances</p>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tenant</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Overdue Amount</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Days Overdue</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {overdueTenants.map((tenant) => (
                                    <tr key={tenant.uid} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">{tenant.name}</div>
                                                <div className="text-sm text-gray-500">{tenant.email}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{tenant.unitNo}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-red-600">
                                            ${tenant.overdueAmount.toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{tenant.daysOverdue} days</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <button
                                                onClick={() => sendReminder(tenant.uid)}
                                                className="text-indigo-600 hover:text-indigo-900 mr-3"
                                            >
                                                Send Reminder
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* All Payments */}
            <div className="bg-white rounded-lg shadow">
                <div className="p-6 border-b border-gray-200">
                    <div className="flex justify-between items-center">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">All Payments</h3>
                            <p className="text-sm text-gray-600">Complete payment history for all tenants</p>
                        </div>
                        <button
                            onClick={fetchPayments}
                            disabled={loadingPayments}
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
                        >
                            {loadingPayments ? 'Refreshing...' : 'Refresh'}
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
                        <p className="text-red-800">{error}</p>
                    </div>
                )}

                {loadingPayments ? (
                    <div className="flex items-center justify-center p-8">
                        <LoadingSpinner />
                    </div>
                ) : (
                    <div>
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
                                            Amount
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Date
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {payments.map((payment) => (
                                        <tr key={payment.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-8 w-8">
                                                        <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                                                            <span className="text-xs font-medium text-gray-700">
                                                                {payment.tenantName.split(' ').map(n => n[0]).join('').toUpperCase()}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="ml-3">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {payment.tenantName}
                                                        </div>
                                                        <div className="text-sm text-gray-500">{payment.tenantEmail}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {payment.unitNo || 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                                                ${payment.monthlyRent.toFixed(2)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusColor(payment.status)}`}>
                                                    {payment.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {formatDate(payment.timestamp)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex space-x-2">
                                                {payment.status === 'pending' && (
                                                    <button
                                                        onClick={() => markAsPaid(payment.id)}
                                                        className="text-green-600 hover:text-green-900"
                                                    >
                                                        Mark Paid
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => generateReceipt(payment)}
                                                    className="text-blue-600 hover:text-blue-900"
                                                >
                                                    Receipt
                                                </button>
                                            </div>
                                        </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {payments.length === 0 && !loadingPayments && (
                    <div className="text-center py-8">
                        <p className="text-gray-500">No payments found for this building.</p>
                        <p className="text-sm text-gray-400 mt-2">Payments will appear here once tenants make payments.</p>
                    </div>
                )}
            </div>
        </div>
    );
} 