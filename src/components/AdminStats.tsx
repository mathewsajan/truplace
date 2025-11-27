import React from 'react';
import { Clock, CheckCircle, XCircle, FileText } from 'lucide-react';

interface AdminStatsProps {
  pendingCount: number;
  approvedToday: number;
  rejectedCount: number;
  totalCount: number;
}

const AdminStats: React.FC<AdminStatsProps> = ({
  pendingCount,
  approvedToday,
  rejectedCount,
  totalCount
}) => {
  const stats = [
    {
      label: 'Pending Requests',
      value: pendingCount,
      icon: Clock,
      color: 'yellow',
      bgColor: 'bg-yellow-100',
      iconColor: 'text-yellow-600',
      borderColor: 'border-yellow-200'
    },
    {
      label: 'Approved Today',
      value: approvedToday,
      icon: CheckCircle,
      color: 'green',
      bgColor: 'bg-green-100',
      iconColor: 'text-green-600',
      borderColor: 'border-green-200'
    },
    {
      label: 'Rejected',
      value: rejectedCount,
      icon: XCircle,
      color: 'red',
      bgColor: 'bg-red-100',
      iconColor: 'text-red-600',
      borderColor: 'border-red-200'
    },
    {
      label: 'Total Requests',
      value: totalCount,
      icon: FileText,
      color: 'blue',
      bgColor: 'bg-blue-100',
      iconColor: 'text-blue-600',
      borderColor: 'border-blue-200'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((stat, index) => (
        <div
          key={index}
          className={`bg-white rounded-lg p-4 border ${stat.borderColor} shadow-sm hover:shadow-md transition-shadow duration-200`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
              <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
            </div>
            <div className={`${stat.bgColor} rounded-full p-3`}>
              <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AdminStats;
