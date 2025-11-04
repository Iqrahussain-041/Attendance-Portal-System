'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AttendanceTable from '@/app/components/AttendanceTable';
import MonthlyReport from '@/app/components/MonthlyReport';
import { Employee, Attendance, MonthlyReport as MonthlyReportType } from '@/lib/types';

export default function EmployeeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const employeeId = params.id as string;
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [monthlyReport, setMonthlyReport] = useState<MonthlyReportType | null>(null);
  const [loadingReport, setLoadingReport] = useState(false);

  useEffect(() => {
    const isAuthenticated = localStorage.getItem('adminAuthenticated');
    if (!isAuthenticated) {
      router.push('/admin/login');
      return;
    }

    fetchEmployee();
    fetchAttendance();
  }, [employeeId]);

  useEffect(() => {
    if (employee) {
      fetchMonthlyReport();
    }
  }, [selectedMonth, selectedYear, employee]);

  const fetchEmployee = async () => {
    try {
      const response = await fetch(`/api/employees/${employeeId}`);
      if (response.ok) {
        const data = await response.json();
        setEmployee(data);
      }
    } catch (err) {
      console.error('Error fetching employee:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendance = async () => {
    try {
      const response = await fetch(`/api/attendance?employeeId=${employeeId}`);
      const data = await response.json();
      setAttendance(data.attendance || []);
    } catch (err) {
      console.error('Error fetching attendance:', err);
    }
  };

  const fetchMonthlyReport = async () => {
    if (!employee) return;
    setLoadingReport(true);
    try {
      const response = await fetch(
        `/api/reports?employeeId=${employeeId}&month=${selectedMonth}&year=${selectedYear}`
      );
      if (response.ok) {
        const data = await response.json();
        setMonthlyReport(data);
      }
    } catch (err) {
      console.error('Error fetching report:', err);
    } finally {
      setLoadingReport(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-red-600">Employee not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-lg mb-6">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-800">{employee.name} - Details</h1>
            <button
              onClick={() => router.back()}
              className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded transition"
            >
              ← Back
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 pb-8">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-2">{employee.name}</h2>
          <p className="text-gray-600">{employee.designation}</p>
          <p className="text-sm text-gray-500 mt-1">{employee.email}</p>
          <div className="mt-4">
            <div className="text-sm text-gray-600 mb-1">
              <strong>Unique Link:</strong>
            </div>
            <div className="bg-gray-50 p-2 rounded text-xs font-mono">
              /attendance/{employee.uniqueLink}
            </div>
          </div>
        </div>

        {/* Monthly Report Selector */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Monthly Report</h2>
          <div className="flex gap-4 mb-4">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">Month</label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                  <option key={month} value={month}>
                    {new Date(2024, month - 1).toLocaleString('en-US', { month: 'long' })}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">Year</label>
              <input
                type="number"
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                min="2000"
                max="2100"
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          {loadingReport ? (
            <div className="text-center py-8 text-gray-600">Loading report...</div>
          ) : monthlyReport ? (
            <MonthlyReport report={monthlyReport} />
          ) : (
            <div className="text-center py-8 text-gray-500">No data available for this month</div>
          )}
        </div>

        {/* Full Attendance History */}
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Full Attendance History</h2>
          <AttendanceTable attendance={attendance.slice().reverse()} />
        </div>
      </div>
    </div>
  );
}
