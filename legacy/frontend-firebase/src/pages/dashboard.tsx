import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { TabType, User } from '../types/dashboard';
import { adminTabs, tenantTabs } from '../components/dashboard';
// Importing the necessary components for the dashboard
import AdminOverviewTab from '../components/dashboard/admin/AdminOverviewTab';
import AdminTenantsTab from '../components/dashboard/admin/AdminTenantsTab';          
import AdminPaymentsTab from '../components/dashboard/admin/AdminPaymentsTab';
import AdminMaintenanceTab from '../components/dashboard/admin/AdminMaintenanceTab';
import AdminReportsTab from '../components/dashboard/admin/AdminReportsTab';
import AdminSettingsTab from '../components/dashboard/admin/AdminSettingsTab';

import TenantOverviewTab from '../components/dashboard/tenant/TenantOverviewTab';
import TenantPaymentsTab from '../components/dashboard/tenant/TenantPaymentsTab';  
import TenantMaintenanceTab from '../components/dashboard/tenant/TenantMaintenanceTab';
import TenantDocumentsTab from '../components/dashboard/tenant/TenantDocumentsTab';
import TenantSettingsTab from '../components/dashboard/tenant/TenantSettingsTab';

import DashboardHeader from '../components/dashboard/DashboardHeader';
import TabNavigation from '../components/dashboard/TabNavigation';
import StatusBanner from '../components/dashboard/StatusBanner';

export default function Dashboard() {
    const { user, isAdmin } = useAuth();
    const [activeTab, setActiveTab] = useState<TabType>('overview');

    console.log('Dashboard rendered - user:', user, 'isAdmin:', isAdmin);

    if (!user) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    const tabs = isAdmin ? adminTabs : tenantTabs;

    // Render tab content based on active tab and user role
    const renderTabContent = () => {
        if (isAdmin) {
            return renderAdminTabContent();
        } else {
            return renderTenantTabContent();
        }
    };

    const renderAdminTabContent = () => {
        console.log('Dashboard: Rendering admin tab content for activeTab:', activeTab);
        switch (activeTab) {
            case 'overview':
                console.log('Dashboard: Rendering AdminOverviewTab');
                return <AdminOverviewTab />;
            case 'tenants':
                console.log('Dashboard: Rendering AdminTenantsTab');
                return <AdminTenantsTab />;
            case 'payments':
                console.log('Dashboard: Rendering AdminPaymentsTab');
                return <AdminPaymentsTab />;
            case 'maintenance':
                console.log('Dashboard: Rendering AdminMaintenanceTab');
                return <AdminMaintenanceTab />;
            case 'reports':
                console.log('Dashboard: Rendering AdminReportsTab');
                return <AdminReportsTab />;
            case 'settings':
                console.log('Dashboard: Rendering AdminSettingsTab');
                return <AdminSettingsTab />;
            default:
                console.log('Dashboard: Rendering default AdminOverviewTab');
                return <AdminOverviewTab />;
        }
    };

    const renderTenantTabContent = () => {
        console.log('Dashboard: Rendering tenant tab content for activeTab:', activeTab);
        switch (activeTab) {
            case 'overview':
                return <TenantOverviewTab user={user as User} />;
            case 'payments':
                return <TenantPaymentsTab />;
            case 'maintenance':
                return <TenantMaintenanceTab />;
            case 'documents':
                return <TenantDocumentsTab />;
            case 'settings':
                return <TenantSettingsTab />;
            default:
                return <TenantOverviewTab user={user as User} />;
        }
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <DashboardHeader user={user as User} isAdmin={isAdmin} />

            {/* Main content area */}
            <div className="p-6">
                {!isAdmin && user.status === 'pending' && <StatusBanner />}

                <TabNavigation tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

                  {/* Tab Content */}
                <div className="bg-white rounded-lg shadow">
                    {renderTabContent()}
                </div>
            </div>
        </div>
    
    );
}