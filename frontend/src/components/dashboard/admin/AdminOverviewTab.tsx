import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { db } from '../../../firebase/firebase';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { User, DashboardStats } from '../../../types/dashboard';
import { LoadingSpinner } from '../../common/LoadingSpinner';

export default function AdminOverviewTab() {
    const { user } = useAuth();
    const [stats, setStats] = useState<DashboardStats>({
        totalTenants: 0,
        activePayments: 0,
        pendingApprovals: 0
    });
    const [recentTenants, setRecentTenants] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchOverviewData = async () => {
            console.log('AdminOverviewTab: Starting to fetch overview data');
            console.log('AdminOverviewTab: User buildingId:', user?.buildingId);
            
            // Wait for user data to be fully loaded
            if (!user) {
                console.log('AdminOverviewTab: User not loaded yet, waiting...');
                return;
            }
            
            if (!user.buildingId) {
                console.log('AdminOverviewTab: No building ID found for admin user');
                setError('No building ID found for admin user');
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null); // Clear any previous errors
                console.log('AdminOverviewTab: Creating Firestore query for building:', user.buildingId);
                
                // Fetch tenants for the building
                const usersRef = collection(db, 'users');
                const tenantsQuery = query(
                    usersRef,
                    where('buildingId', '==', user.buildingId),
                    where('role', '==', 'tenant')
                );
                
                console.log('AdminOverviewTab: Executing Firestore query...');
                const tenantsSnapshot = await getDocs(tenantsQuery);
                console.log('AdminOverviewTab: Query completed, found', tenantsSnapshot.size, 'documents');
                
                const tenantsData: User[] = [];
                
                tenantsSnapshot.forEach((doc) => {
                    const data = doc.data();
                    console.log('AdminOverviewTab: Processing tenant document:', doc.id, data);
                    tenantsData.push({
                        uid: doc.id,
                        ...data,
                        createdAt: data.createdAt?.toDate() || new Date(),
                        updatedAt: data.updatedAt?.toDate() || new Date(),
                    } as User);
                });

                // Calculate statistics
                const totalTenants = tenantsData.length;
                const activeTenants = tenantsData.filter(t => t.status === 'active').length;
                const pendingApprovals = tenantsData.filter(t => t.status === 'pending').length;

                // Get recent tenants (last 5)
                const recentTenantsData = tenantsData
                    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
                    .slice(0, 5);

                console.log('AdminOverviewTab: Calculated stats:', { totalTenants, activeTenants, pendingApprovals });
                console.log('AdminOverviewTab: Recent tenants:', recentTenantsData);

                setStats({
                    totalTenants,
                    activePayments: activeTenants, // Using active tenants as active payments for now
                    pendingApprovals
                });
                setRecentTenants(recentTenantsData);

            } catch (err) {
                console.error('AdminOverviewTab: Error fetching overview data:', err);
                setError('Failed to fetch overview data');
            } finally {
                setLoading(false);
            }
        };

        fetchOverviewData();
    }, [user]); // Changed dependency from user?.buildingId to user

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-green-100 text-green-800';
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'inactive': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const handleRowClick = (tenantId: string): void => {
        try{
            console.log('AdminOverviewTab: Tenant row clicked:', tenantId);
        // Navigate to tenant details page or perform any action
        // For example, you could use a router to navigate to a tenant details page
            //navigate(`components/dashboard/tenant/AdminTenantsTab/${tenantId}`);
            navigate(`components/dashboard/admin/AdminTenantsTab/${tenantId}   `);
        }
        catch (error) {
            console.error('AdminOverviewTab: Error navigating to tenant details:', error);
            setError('Failed to navigate to tenant details');
        }
    }

    // Show loading if user is not loaded yet or if we're fetching data
    if (!user || loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <LoadingSpinner />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6">
                <div className="text-center">
                    <h2 className="text-xl font-semibold text-red-600 mb-4">Error</h2>
                    <p className="text-gray-600">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <h2 className="text-xl font-semibold mb-6">Admin Overview</h2>
            
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                    <div className="flex items-center">
                        <div className="p-3 bg-blue-100 rounded-lg">
                            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </div>
                        <div className="ml-4">
                            <h3 className="text-lg font-medium text-blue-900">Total Tenants</h3>
                            <p className="text-3xl font-bold text-blue-600">{stats.totalTenants}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                    <div className="flex items-center">
                        <div className="p-3 bg-green-100 rounded-lg">
                            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div className="ml-4">
                            <h3 className="text-lg font-medium text-green-900">Active Tenants</h3>
                            <p className="text-3xl font-bold text-green-600">{stats.activePayments}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
                    <div className="flex items-center">
                        <div className="p-3 bg-yellow-100 rounded-lg">
                            <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div className="ml-4">
                            <h3 className="text-lg font-medium text-yellow-900">Pending Approvals</h3>
                            <p className="text-3xl font-bold text-yellow-600">{stats.pendingApprovals}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg border p-6 mb-8">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                        </div>
                        <div className="ml-3 text-left">
                            <p className="text-sm font-medium text-gray-900">Add New Tenant</p>
                            <p className="text-xs text-gray-500">Register a new tenant</p>
                        </div>
                    </button>

                    <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div className="ml-3 text-left">
                            <p className="text-sm font-medium text-gray-900">Review Pending</p>
                            <p className="text-xs text-gray-500">Approve new registrations</p>
                        </div>
                    </button>

                    <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="p-2 bg-purple-100 rounded-lg">
                            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                        </div>
                        <div className="ml-3 text-left">
                            <p className="text-sm font-medium text-gray-900">View Reports</p>
                            <p className="text-xs text-gray-500">Payment and occupancy reports</p>
                        </div>
                    </button>
                </div>
            </div>

            {/* Recent Tenants */}
            <div className="bg-white rounded-lg border">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">Recent Tenants</h3>
                    <p className="mt-1 text-sm text-gray-500">Latest tenant registrations</p>
                </div>
                
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
                                    Registered
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {recentTenants.map((tenant) => (
                                <tr key={tenant.uid} onClick={() => handleRowClick(tenant.uid)} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-8 w-8">
                                                <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                                                    <span className="text-xs font-medium text-gray-700">
                                                        {tenant.FirstName?.[0]}{tenant.LastName?.[0]}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="ml-3">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {tenant.FirstName} {tenant.LastName}
                                                </div>
                                                <div className="text-sm text-gray-500">{tenant.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {tenant.unitNo || 'N/A'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(tenant.status)}`}>
                                            {tenant.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {tenant.createdAt.toLocaleDateString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {recentTenants.length === 0 && (
                    <div className="text-center py-8">
                        <p className="text-gray-500">No tenants found</p>
                    </div>
                )}
            </div>
        </div>
    );
} 
