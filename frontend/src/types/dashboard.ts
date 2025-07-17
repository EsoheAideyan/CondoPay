// Dashboard tab types
export type TabType = 'overview' | 'payments' | 'maintenance' | 'documents' | 'settings' | 'tenants' | 'reports';

// User status types
export type UserStatus = 'active' | 'pending' | 'inactive';

// Payment status types
export type PaymentStatus = 'completed' | 'pending' | 'failed' | 'disputed';

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

// Payment data interface
export interface Payment {
    id: string;
    tenantId: string;
    tenantName: string;
    tenantEmail: string;
    buildingId: string;
    unitNo: string;
    monthlyRent: number;
    status: PaymentStatus;
    timestamp: Date;
    paymentDate?: Date;
    transactionId?: string;
    notes?: string;
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

// Payment statistics interface
export interface PaymentStats {
    totalTenants: number;
    totalCollected: number;
    pendingPayments: number;
    overduePayments: number;
    overdueTenants: number;
}

// Overdue tenant interface
export interface OverdueTenant {
    uid: string;
    name: string;
    email: string;
    unitNo: string;
    overdueAmount: number;
    daysOverdue: number;
    lastPaymentDate?: Date;
}

// Component props interfaces
export interface TenantOverviewTabProps {
    user: User;
}

export interface AdminOverviewTabProps {
    stats?: DashboardStats;
}