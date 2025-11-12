'use client';

import { Employee } from '@/lib/types';
import Link from 'next/link';

interface EmployeeCardProps {
  employee: Employee;
  currentStatus?: 'in' | 'out' | 'leave';
  onDelete?: (id: string) => void;
  showActions?: boolean;
}

export default function EmployeeCard({
  employee,
  currentStatus,
  onDelete,
  showActions = false
}: EmployeeCardProps) {
  const getStatusColor = () => {
    switch (currentStatus) {
      case 'in':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'out':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'leave':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = () => {
    switch (currentStatus) {
      case 'in':
        return 'Clocked In';
      case 'out':
        return 'Clocked Out';
      case 'leave':
        return 'On Leave';
      default:
        return 'Not Available';
    }
  };

  return (
  <div className="bg-gray-900 rounded-lg shadow-md p-6 hover:shadow-lg transition text-gray-100">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-100">{employee.name}</h3>
          <p className="text-gray-300">{employee.designation}</p>
          <p className="text-sm text-gray-400">{employee.email}</p>
        </div>
        {currentStatus && (
          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor()}`}>
            {getStatusText()}
          </span>
        )}
      </div>

      <div className="border-t pt-4 mt-4">
  <div className="text-sm text-gray-300 mb-2">
          <strong>Unique Link:</strong>
        </div>
  <div className="bg-gray-800 p-2 rounded text-xs font-mono break-all text-gray-200">
          /attendance/{employee.uniqueLink}
        </div>
      </div>

      {showActions && (
        <div className="flex gap-2 mt-4">
          <Link
            href={`/admin/employees/${employee.id}`}
            className="flex-1 bg-primary-600 hover:bg-primary-700 text-white text-center font-semibold py-2 px-4 rounded transition"
          >
            View Details
          </Link>
          {onDelete && (
            <button
              onClick={() => onDelete(employee.id)}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded transition"
            >
              Delete
            </button>
          )}
        </div>
      )}
    </div>
  );
}
