/** Types matching API JSON responses (camelCase from our routes). */

export type UserRole = 'tenant' | 'admin';
export type UserStatus = 'pending' | 'active' | 'inactive';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  firstName: string;
  lastName: string;
  phone: string | null;
}

export interface Invoice {
  id: string;
  amount: string;
  due_date: string;
  status: string;
  period_label: string;
  building_name?: string;
  unit_no?: string;
}

export type MaintenanceStatus = 'open' | 'in_progress' | 'resolved' | 'cancelled';
export type MaintenancePriority = 'low' | 'normal' | 'urgent';

export interface MaintenanceRequest {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: MaintenancePriority;
  status: MaintenanceStatus;
  createdAt: string;
  updatedAt: string;
  buildingName: string | null;
  unitNo: string | null;
  tenantId: string;
  tenantFirstName: string | null;
  tenantLastName: string | null;
  tenantEmail: string | null;
}

export interface TenantRow {
  id: string;
  email: string;
  status: UserStatus;
  firstName: string;
  lastName: string;
  phone: string | null;
  buildingName: string | null;
  unitNo: string | null;
  monthlyRent: string | null;
}
