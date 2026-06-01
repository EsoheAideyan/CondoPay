// Dashboard tab types
export type TabType = 'overview' | 'payments' | 'maintenance' | 'documents' | 'settings' | 'tenants' | 'reports';

// Payment status types
export type PaymentStatus = 'completed' | 'pending' | 'failed' | 'disputed';

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

export interface OverdueTenant {
    uid: string;
    name: string;
    email: string;
    unitNo: string;
    overdueAmount: number;
    daysOverdue: number;
    lastPaymentDate?: Date;
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

// Payment statistics interface
export interface PaymentStats {
    totalTenants: number;
    totalCollected: number;
    pendingPayments: number;
    overduePayments: number;
    overdueTenants: number;
}
