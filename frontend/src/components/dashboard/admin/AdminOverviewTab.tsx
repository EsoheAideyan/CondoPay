import { AdminOverviewTabProps } from '../../../types/dashboard';

export default function AdminOverviewTab({ stats }: AdminOverviewTabProps) {
    const defaultStats = {
        totalTenants: 24,
        activePayments: 18,
        pendingApprovals: 4
    };

    const displayStats = stats || defaultStats;

    return (
        <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Admin Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="text-lg font-medium text-blue-900">Total Tenants</h3>
                    <p className="text-3xl font-bold text-blue-600">{displayStats.totalTenants}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                    <h3 className="text-lg font-medium text-green-900">Active Payments</h3>
                    <p className="text-3xl font-bold text-green-600">{displayStats.activePayments}</p>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                    <h3 className="text-lg font-medium text-yellow-900">Pending Approvals</h3>
                    <p className="text-3xl font-bold text-yellow-600">{displayStats.pendingApprovals}</p>
                </div>
            </div>
        </div>
    );
} 
