'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import ClockInOut from '@/app/components/ClockInOut';
import AttendanceTable from '@/app/components/AttendanceTable';
import { Employee, Attendance, Leave } from '@/lib/types';

export default function EmployeeAttendancePage() {
  const params = useParams();
  const employeeLink = params.employeeLink as string;
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [showLeaveForm, setShowLeaveForm] = useState(false);
  const [leaveForm, setLeaveForm] = useState({
    date: '',
    type: 'full-day' as 'full-day' | 'half-day',
    reason: ''
  });

  useEffect(() => {
    fetchEmployee();
  }, [employeeLink]);

  useEffect(() => {
    if (authenticated && employee) {
      fetchAttendance();
      fetchLeaves();
    }
  }, [authenticated, employee]);

  const fetchEmployee = async () => {
    try {
      const response = await fetch('/api/employees');
      const data = await response.json();
      const emp = data.employees.find((e: Employee) => e.uniqueLink === employeeLink);
      if (emp) {
        setEmployee(emp);
      } else {
        setError('Employee not found');
      }
    } catch (err) {
      setError('Failed to load employee data');
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendance = async () => {
    if (!employee) return;
    try {
      const response = await fetch(`/api/attendance?employeeId=${employee.id}`);
      const data = await response.json();
      setAttendance(data.attendance || []);
    } catch (err) {
      console.error('Error fetching attendance:', err);
    }
  };

  const fetchLeaves = async () => {
    if (!employee) return;
    try {
      const response = await fetch(`/api/leaves?employeeId=${employee.id}`);
      const data = await response.json();
      setLeaves(data.leaves || []);
    } catch (err) {
      console.error('Error fetching leaves:', err);
    }
  };

  const handleLogin = () => {
    if (!employee) {
      setError('Employee not found. Please check your link.');
      return;
    }
    if (password === employee.password) {
      setAuthenticated(true);
      setError(null);
    } else {
      setError('Invalid password');
    }
  };

  const handleLeaveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employee) return;

    try {
      const response = await fetch('/api/leaves', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: employee.id,
          ...leaveForm
        })
      });

      if (response.ok) {
        setShowLeaveForm(false);
        setLeaveForm({ date: '', type: 'full-day', reason: '' });
        fetchLeaves();
        alert('Leave request submitted successfully');
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to submit leave request');
      }
    } catch (err) {
      alert('Network error. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-xl text-gray-300">Loading...</div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="bg-gray-800 rounded-lg shadow-lg p-8 max-w-md w-full">
          <h2 className="text-2xl font-bold text-red-400 mb-4">Employee Not Found</h2>
          <p className="text-gray-300 mb-4">
            The employee link you're trying to access doesn't exist.
          </p>
          <a href="/" className="text-primary-400 hover:underline">
            ← Back to Home
          </a>
        </div>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="bg-gray-800 rounded-lg shadow-lg p-8 max-w-md w-full">
          <h2 className="text-2xl font-bold text-gray-100 mb-4">
            Employee Login - {employee.name}
          </h2>
          {error && (
            <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          <div className="mb-4">
            <label className="block text-gray-300 text-sm font-bold mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
              className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-700 text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Enter your password"
            />
          </div>
          <button
            onClick={handleLogin}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-4 rounded-lg transition"
          >
            Login
          </button>
          <a href="/" className="block text-center mt-4 text-primary-400 hover:underline">
            ← Back to Home
          </a>
        </div>
      </div>
    );
  }

  const stats = {
    totalPresent: attendance.filter(a => a.status === 'present' && a.clockIn && a.clockOut).length,
    totalLeaves: leaves.filter(l => l.status === 'approved' && l.type === 'full-day').length,
    totalHalfDays: attendance.filter(a => a.isHalfDay || a.status === 'half-day').length +
                   leaves.filter(l => l.status === 'approved' && l.type === 'half-day').length,
    totalLate: attendance.filter(a => a.isLate).length
  };

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-100">{employee.name}</h1>
              <p className="text-gray-300">{employee.designation}</p>
            </div>
            <button
              onClick={() => setAuthenticated(false)}
              className="text-gray-400 hover:text-gray-200"
            >
              Logout
            </button>
          </div>
        </div>

        <ClockInOut employee={employee} onUpdate={fetchAttendance} />

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="text-sm text-green-600 font-medium mb-1">Total Present</div>
            <div className="text-2xl font-bold text-green-700">{stats.totalPresent}</div>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="text-sm text-red-600 font-medium mb-1">Total Leaves</div>
            <div className="text-2xl font-bold text-red-700">{stats.totalLeaves}</div>
          </div>
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="text-sm text-orange-600 font-medium mb-1">Half Days</div>
            <div className="text-2xl font-bold text-orange-700">{stats.totalHalfDays}</div>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="text-sm text-yellow-600 font-medium mb-1">Late Arrivals</div>
            <div className="text-2xl font-bold text-yellow-700">{stats.totalLate}</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Leave Requests</h2>
            <button
              onClick={() => setShowLeaveForm(!showLeaveForm)}
              className="bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2 px-4 rounded transition"
            >
              {showLeaveForm ? 'Cancel' : 'Request Leave'}
            </button>
          </div>

          {showLeaveForm && (
            <form onSubmit={handleLeaveSubmit} className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">Date</label>
                  <input
                    type="date"
                    value={leaveForm.date}
                    onChange={(e) => setLeaveForm({ ...leaveForm, date: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">Type</label>
                  <select
                    value={leaveForm.type}
                    onChange={(e) => setLeaveForm({ ...leaveForm, type: e.target.value as 'full-day' | 'half-day' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="full-day">Full Day</option>
                    <option value="half-day">Half Day</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">Reason</label>
                  <input
                    type="text"
                    value={leaveForm.reason}
                    onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Enter reason"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="mt-4 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded transition"
              >
                Submit Request
              </button>
            </form>
          )}

          <div className="space-y-2">
            {leaves.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No leave requests</p>
            ) : (
              leaves.map((leave, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg flex justify-between items-center">
                  <div>
                    <div className="font-semibold">{new Date(leave.date).toLocaleDateString()}</div>
                    <div className="text-sm text-gray-600">{leave.type} - {leave.reason}</div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    leave.status === 'approved' ? 'bg-green-100 text-green-800' :
                    leave.status === 'rejected' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {leave.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Attendance History</h2>
          <AttendanceTable attendance={attendance.slice().reverse().slice(0, 30)} />
        </div>
      </div>
    </div>
  );
}
