'use client';

import type { MonthlyReport } from '@/lib/types';
import AttendanceTable from './AttendanceTable';

interface MonthlyReportProps {
  report: MonthlyReport;
}

export default function MonthlyReport({ report }: MonthlyReportProps) {
  const monthName = new Date(report.year, report.month - 1).toLocaleString('en-US', {
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Monthly Report - {report.employeeName}
        </h2>
        <p className="text-gray-600 mb-6">{monthName}</p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="text-sm text-green-600 font-medium mb-1">Total Present</div>
            <div className="text-3xl font-bold text-green-700">{report.totalPresent}</div>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="text-sm text-red-600 font-medium mb-1">Total Leaves</div>
            <div className="text-3xl font-bold text-red-700">{report.totalLeaves}</div>
          </div>
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="text-sm text-orange-600 font-medium mb-1">Half Days</div>
            <div className="text-3xl font-bold text-orange-700">{report.totalHalfDays}</div>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="text-sm text-yellow-600 font-medium mb-1">Late Arrivals</div>
            <div className="text-3xl font-bold text-yellow-700">{report.totalLateArrivals}</div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-xl font-bold text-gray-800 mb-4">Attendance Details</h3>
        <AttendanceTable attendance={report.attendanceDetails} />
      </div>
    </div>
  );
}
