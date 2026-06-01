import { TabConfig } from '../../types/dashboard';

// Admin tab configuration
export const adminTabs: TabConfig[] = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'tenants', label: 'Tenants', icon: '👥' },
    { id: 'payments', label: 'Payments', icon: '💰' },
    { id: 'maintenance', label: 'Maintenance', icon: '🔧' },
    { id: 'reports', label: 'Reports', icon: '📈' },
    { id: 'settings', label: 'Settings', icon: '⚙️' }
];

// Tenant tab configuration
export const tenantTabs: TabConfig[] = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'payments', label: 'My Payments', icon: '💰' },
    { id: 'maintenance', label: 'Maintenance', icon: '🔧' },
    { id: 'documents', label: 'Documents', icon: '📄' },
    { id: 'settings', label: 'Settings', icon: '⚙️' }
]; 