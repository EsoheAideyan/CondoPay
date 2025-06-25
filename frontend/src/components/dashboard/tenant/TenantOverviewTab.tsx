import { TenantOverviewTabProps, UserStatus } from '../../../types/dashboard';

export default function TenantOverviewTab({ user }: TenantOverviewTabProps) {
    const getStatusConfig = (status: UserStatus) => {
        const statusConfig = {
            active: { label: 'Active', color: 'bg-green-100 text-green-800' },
            pending: { label: 'Pending Approval', color: 'bg-yellow-100 text-yellow-800' },
            inactive: { label: 'Inactive', color: 'bg-red-100 text-red-800' }
        };
        return statusConfig[status] || statusConfig.pending;
    };

    const statusConfig = getStatusConfig(user.status);

    return (
        <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Welcome, {user.FirstName}!</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white border border-gray-200 p-4 rounded-lg">
                    <h3 className="text-lg font-medium mb-2">Account Status</h3>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusConfig.color}`}>
                        {statusConfig.label}
                    </span>
                </div>
                
                <div className="bg-white border border-gray-200 p-4 rounded-lg">
                    <h3 className="text-lg font-medium mb-2">Rental Information</h3>
                    <p className="text-sm text-gray-600">Building: {user.buildingId || 'N/A'}</p>
                    <p className="text-sm text-gray-600">Unit: {user.unitNo || 'N/A'}</p>
                    <p className="text-sm text-gray-600">Rent: ${user.monthlyRent || 'N/A'}/month</p>
                </div>
            </div>
        </div>
    );
} 