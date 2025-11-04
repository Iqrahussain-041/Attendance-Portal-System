'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import MonthlyReport from '@/app/components/MonthlyReport';
import { MonthlyReport as MonthlyReportType } from '@/lib/types';

export default function ReportsPage() {
  const router = useRouter();
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [reports, setReports] = useState<MonthlyReportType[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const isAuthenticated = localStorage.getItem('adminAuthenticated');
    if (!isAuthenticated) {
      router.push('/admin/login');
      return;
    }

    fetchReports();
  }, [selectedMonth, selectedYear]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/reports?month=${selectedMonth}&year=${selectedYear}`
      );
      if (response.ok) {
        const data = await response.json();
        setReports(data.reports || []);
      }
    } catch (err) {
      console.error('Error fetching reports:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-lg mb-6">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-800">Monthly Reports</h1>
            <div className="flex gap-4">
              <button
                onClick={() => router.push('/admin')}
                className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded transition"
              >
                ← Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 pb-8">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Select Month and Year</h2>
          <div className="flex gap-4">
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
        </div>

        {loading ? (
          <div className="text-center py-8 text-gray-600">Loading reports...</div>
        ) : reports.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No reports available for this month</div>
        ) : (
          <div className="space-y-6">
            {reports.map((report) => (
              <MonthlyReport key={report.employeeId} report={report} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
