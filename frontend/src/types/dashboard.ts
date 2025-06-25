// Dashboard tab types
export type TabType = 'overview' | 'payments' | 'maintenance' | 'documents' | 'settings' | 'tenants' | 'reports';

// User status types
export type UserStatus = 'active' | 'pending' | 'inactive';

// User data interface
export interface User {
    uid: string;
    email: string;
    userName: string;
    FirstName: string;
    LastName: string;
    phoneNumber: string;
    buildingId?: string;
    unitNo?: string;
    leaseStartDate?: string;
    leaseEndDate?: string;
    monthlyRent?: number;
    role: 'admin' | 'tenant';
    status: UserStatus;
    createdAt: Date;
    updatedAt: Date;
}

// Tab configuration interface
export interface TabConfig {
    id: TabType;
    label: string;
    icon: string;
}

// Status configuration interface
export interface StatusConfig {
    label: string;
    color: string;
}

// Dashboard statistics interface
export interface DashboardStats {
    totalTenants: number;
    activePayments: number;
    pendingApprovals: number;
}

// Component props interfaces
export interface TenantOverviewTabProps {
    user: User;
}

export interface AdminOverviewTabProps {
    stats?: DashboardStats;
}