import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { db } from '../../../firebase/firebase';
import { collection, query, where, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { User, UserStatus } from '../../../types/dashboard';
import { LoadingSpinner } from '../../common/LoadingSpinner';

export default function AdminTenantsTab() {
    const { user } = useAuth();
    const [tenants, setTenants] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedTenant, setSelectedTenant] = useState<User | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [filterStatus, setFilterStatus] = useState<UserStatus | 'all'>('all');

    // Fetch tenants for the same building
    useEffect(() => {
        const fetchTenants = async () => {
            console.log('AdminTenantsTab: Starting to fetch tenants');
            console.log('AdminTenantsTab: User buildingId:', user?.buildingId);
            
            // Wait for user data to be fully loaded
            if (!user) {
                console.log('AdminTenantsTab: User not loaded yet, waiting...');
                return;
            }
            
            if (!user.buildingId) {
                console.log('AdminTenantsTab: No building ID found for admin user');
                setError('No building ID found for admin user');
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null); // Clear any previous errors
                console.log('AdminTenantsTab: Creating Firestore query for building:', user.buildingId);
                
                const usersRef = collection(db, 'users');
                const q = query(
                    usersRef,
                    where('buildingId', '==', user.buildingId),
                    where('role', '==', 'tenant')
                );
                
                console.log('AdminTenantsTab: Executing Firestore query...');
                const querySnapshot = await getDocs(q);
                console.log('AdminTenantsTab: Query completed, found', querySnapshot.size, 'documents');
                
                const tenantsData: User[] = [];
                
                querySnapshot.forEach((doc) => {
                    const data = doc.data();
                    console.log('AdminTenantsTab: Processing tenant document:', doc.id, data);
                    tenantsData.push({
                        uid: doc.id,
                        ...data,
                        createdAt: data.createdAt?.toDate() || new Date(),
                        updatedAt: data.updatedAt?.toDate() || new Date(),
                    } as User);
                });

                console.log('AdminTenantsTab: Final tenants data:', tenantsData);
                setTenants(tenantsData);
            } catch (err) {
                console.error('AdminTenantsTab: Error fetching tenants:', err);
                setError('Failed to fetch tenants');
            } finally {
                setLoading(false);
            }
        };

        fetchTenants();
    }, [user]); // Changed dependency from user?.buildingId to user

    // Handle tenant status updates
    const handleStatusUpdate = async (tenantId: string, newStatus: UserStatus) => {
        try {
            setActionLoading(true);
            const userRef = doc(db, 'users', tenantId);
            await updateDoc(userRef, {
                status: newStatus,
                updatedAt: new Date()
            });

            // Update local state
            setTenants(prev => prev.map(tenant => 
                tenant.uid === tenantId 
                    ? { ...tenant, status: newStatus, updatedAt: new Date() }
                    : tenant
            ));

            setShowModal(false);
            setSelectedTenant(null);
        } catch (err) {
            console.error('Error updating tenant status:', err);
            setError('Failed to update tenant status');
        } finally {
            setActionLoading(false);
        }
    };

    // Handle tenant deletion
    const handleDeleteTenant = async (tenantId: string) => {
        if (!window.confirm('Are you sure you want to delete this tenant? This action cannot be undone.')) {
            return;
        }

        try {
            setActionLoading(true);
            await deleteDoc(doc(db, 'users', tenantId));
            
            // Update local state
            setTenants(prev => prev.filter(tenant => tenant.uid !== tenantId));
        } catch (err) {
            console.error('Error deleting tenant:', err);
            setError('Failed to delete tenant');
        } finally {
            setActionLoading(false);
        }
    };

    // Get status badge color
    const getStatusColor = (status: UserStatus) => {
        switch (status) {
            case 'active': return 'bg-green-100 text-green-800';
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'inactive': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    // Filter tenants based on status
    const filteredTenants = tenants.filter(tenant => 
        filterStatus === 'all' ? true : tenant.status === filterStatus
    );

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
            <div className="mb-6">
                <h2 className="text-xl font-semibold mb-2">Tenant Management</h2>
                <p className="text-gray-600">Manage tenant accounts, approve new registrations, and control access.</p>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex items-center">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-medium text-blue-600">Total Tenants</p>
                            <p className="text-lg font-semibold text-blue-900">{tenants.length}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-green-50 rounded-lg p-4">
                    <div className="flex items-center">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-medium text-green-600">Active</p>
                            <p className="text-lg font-semibold text-green-900">
                                {tenants.filter(t => t.status === 'active').length}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-yellow-50 rounded-lg p-4">
                    <div className="flex items-center">
                        <div className="p-2 bg-yellow-100 rounded-lg">
                            <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-medium text-yellow-600">Pending</p>
                            <p className="text-lg font-semibold text-yellow-900">
                                {tenants.filter(t => t.status === 'pending').length}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-red-50 rounded-lg p-4">
                    <div className="flex items-center">
                        <div className="p-2 bg-red-100 rounded-lg">
                            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-medium text-red-600">Inactive</p>
                            <p className="text-lg font-semibold text-red-900">
                                {tenants.filter(t => t.status === 'inactive').length}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filter Controls */}
            <div className="mb-6">
                <div className="flex items-center space-x-4">
                    <label className="text-sm font-medium text-gray-700">Filter by status:</label>
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value as UserStatus | 'all')}
                        className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="all">All Tenants</option>
                        <option value="active">Active</option>
                        <option value="pending">Pending Approval</option>
                        <option value="inactive">Inactive</option>
                    </select>
                </div>
            </div>

            {/* Tenants Table */}
            <div className="bg-white rounded-lg border">
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
                                    Contact
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Rent
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredTenants.map((tenant) => (
                                <tr key={tenant.uid} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10">
                                                <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                                    <span className="text-sm font-medium text-gray-700">
                                                        {tenant.FirstName?.[0]}{tenant.LastName?.[0]}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="ml-4">
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
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {tenant.phoneNumber || 'N/A'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(tenant.status)}`}>
                                            {tenant.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        ${tenant.monthlyRent?.toLocaleString() || 'N/A'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => {
                                                    setSelectedTenant(tenant);
                                                    setShowModal(true);
                                                }}
                                                className="text-indigo-600 hover:text-indigo-900 font-medium"
                                            >
                                                Manage
                                            </button>
                                            <button
                                                onClick={() => handleDeleteTenant(tenant.uid)}
                                                className="text-red-600 hover:text-red-900 font-medium"
                                                disabled={actionLoading}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredTenants.length === 0 && (
                    <div className="text-center py-12">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No tenants found</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            {filterStatus === 'all' 
                                ? 'Get started by having tenants register for your building.'
                                : `No tenants with ${filterStatus} status found.`
                            }
                        </p>
                    </div>
                )}
            </div>

            {/* Tenant Management Modal */}
            {showModal && selectedTenant && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                        <div className="mt-3">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">
                                Manage Tenant: {selectedTenant.FirstName} {selectedTenant.LastName}
                            </h3>
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Current Status</label>
                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedTenant.status)}`}>
                                        {selectedTenant.status}
                                    </span>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Unit Number</label>
                                    <p className="text-sm text-gray-900">{selectedTenant.unitNo || 'Not assigned'}</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Monthly Rent</label>
                                    <p className="text-sm text-gray-900">${selectedTenant.monthlyRent?.toLocaleString() || 'Not set'}</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Contact Information</label>
                                    <p className="text-sm text-gray-900">Email: {selectedTenant.email}</p>
                                    <p className="text-sm text-gray-900">Phone Number: {selectedTenant.phoneNumber || 'No phone number'}</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Actions</label>
                                    <div className="mt-2 space-y-2">
                                        {selectedTenant.status === 'pending' && (
                                            <button
                                                onClick={() => handleStatusUpdate(selectedTenant.uid, 'active')}
                                                disabled={actionLoading}
                                                className="w-full bg-green-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-green-700 disabled:opacity-50"
                                            >
                                                {actionLoading ? 'Approving...' : 'Approve & Activate'}
                                            </button>
                                        )}
                                        
                                        {selectedTenant.status === 'active' && (
                                            <button
                                                onClick={() => handleStatusUpdate(selectedTenant.uid, 'inactive')}
                                                disabled={actionLoading}
                                                className="w-full bg-red-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-red-700 disabled:opacity-50"
                                            >
                                                {actionLoading ? 'Deactivating...' : 'Deactivate Account'}
                                            </button>
                                        )}
                                        
                                        {selectedTenant.status === 'inactive' && (
                                            <button
                                                onClick={() => handleStatusUpdate(selectedTenant.uid, 'active')}
                                                disabled={actionLoading}
                                                className="w-full bg-green-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-green-700 disabled:opacity-50"
                                            >
                                                {actionLoading ? 'Activating...' : 'Reactivate Account'}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 flex justify-end">
                                <button
                                    onClick={() => {
                                        setShowModal(false);
                                        setSelectedTenant(null);
                                    }}
                                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-400"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
} 