'use client';

import { Attendance } from '@/lib/types';

interface AttendanceTableProps {
  attendance: Attendance[];
  employeeNames?: { [key: string]: string };
}

export default function AttendanceTable({
  attendance,
  employeeNames
}: AttendanceTableProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = (attendance: Attendance) => {
    if (attendance.status === 'absent') {
      return (
        <span className="px-2 py-1 rounded text-xs font-semibold bg-red-100 text-red-800">
          Absent
        </span>
      );
    }
    if (attendance.isHalfDay || attendance.status === 'half-day') {
      return (
        <span className="px-2 py-1 rounded text-xs font-semibold bg-orange-100 text-orange-800">
          Half Day
        </span>
      );
    }
    if (attendance.isLate) {
      return (
        <span className="px-2 py-1 rounded text-xs font-semibold bg-yellow-100 text-yellow-800">
          Late
        </span>
      );
    }
    return (
      <span className="px-2 py-1 rounded text-xs font-semibold bg-green-100 text-green-800">
        Present
      </span>
    );
  };

  if (attendance.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
        No attendance records found
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {employeeNames && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employee
                </th>
              )}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Clock In
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Clock Out
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {attendance.map((att, index) => (
              <tr key={index} className="hover:bg-gray-50">
                {employeeNames && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {employeeNames[att.employeeId] || att.employeeId}
                  </td>
                )}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatDate(att.date)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {att.clockIn || '--:--:--'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {att.clockOut || '--:--:--'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(att)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
