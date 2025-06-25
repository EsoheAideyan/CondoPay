// Main dashboard components
export { default as DashboardHeader } from './DashboardHeader';
export { default as TabNavigation } from './TabNavigation';
export { default as StatusBanner } from './StatusBanner';

// Admin tab components
export { default as AdminOverviewTab } from './admin/AdminOverviewTab';
export { default as AdminTenantsTab } from './admin/AdminTenantsTab';
export { default as AdminPaymentsTab } from './admin/AdminPaymentsTab';
export { default as AdminMaintenanceTab } from './admin/AdminMaintenanceTab';
export { default as AdminReportsTab } from './admin/AdminReportsTab';
export { default as AdminSettingsTab } from './admin/AdminSettingsTab';

// Tenant tab components
export { default as TenantOverviewTab } from './tenant/TenantOverviewTab';
export { default as TenantPaymentsTab } from './tenant/TenantPaymentsTab';
export { default as TenantMaintenanceTab } from './tenant/TenantMaintenanceTab';
export { default as TenantDocumentsTab } from './tenant/TenantDocumentsTab';
export { default as TenantSettingsTab } from './tenant/TenantSettingsTab';

// Configuration
export { adminTabs, tenantTabs } from './dashboardConfig'; 