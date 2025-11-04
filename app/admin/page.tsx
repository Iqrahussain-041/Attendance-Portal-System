'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import EmployeeCard from '@/app/components/EmployeeCard';
import AttendanceTable from '@/app/components/AttendanceTable';
import { Employee, Attendance, Leave } from '@/lib/types';

export default function AdminDashboard() {
  const router = useRouter();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [todayAttendance, setTodayAttendance] = useState<Attendance[]>([]);
  const [pendingLeaves, setPendingLeaves] = useState<Leave[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [employeeForm, setEmployeeForm] = useState({
    name: '',
    uniqueLink: '',
    password: '',
    email: '',
    designation: ''
  });

  useEffect(() => {
    // Check authentication
    const isAuthenticated = localStorage.getItem('adminAuthenticated');
    if (!isAuthenticated) {
      router.push('/admin/login');
      return;
    }

    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [employeesRes, attendanceRes, leavesRes] = await Promise.all([
        fetch('/api/employees'),
        fetch(`/api/attendance?date=${new Date().toISOString().split('T')[0]}`),
        fetch('/api/leaves?status=pending')
      ]);

      const employeesData = await employeesRes.json();
      const attendanceData = await attendanceRes.json();
      const leavesData = await leavesRes.json();

      setEmployees(employeesData.employees || []);
      setTodayAttendance(attendanceData.attendance || []);
      setPendingLeaves(leavesData.leaves || []);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(employeeForm)
      });

      if (response.ok) {
        setEmployeeForm({
          name: '',
          uniqueLink: '',
          password: '',
          email: '',
          designation: ''
        });
        setShowAddForm(false);
        fetchData();
        alert('Employee added successfully');
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to add employee');
      }
    } catch (err) {
      alert('Network error. Please try again.');
    }
  };

  const handleDeleteEmployee = async (id: string) => {
    if (!confirm('Are you sure you want to delete this employee?')) return;

    try {
      const response = await fetch(`/api/employees/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        fetchData();
        alert('Employee deleted successfully');
      } else {
        alert('Failed to delete employee');
      }
    } catch (err) {
      alert('Network error. Please try again.');
    }
  };

  const getEmployeeStatus = (employeeId: string): 'in' | 'out' | 'leave' => {
    const today = todayAttendance.find(att => att.employeeId === employeeId);
    if (today) {
      if (today.clockIn && !today.clockOut) return 'in';
      if (today.clockIn && today.clockOut) return 'out';
    }
    const leave = pendingLeaves.find(l => l.employeeId === employeeId);
    if (leave) return 'leave';
    return 'out';
  };

  const handleLogout = () => {
    localStorage.removeItem('adminAuthenticated');
    router.push('/admin/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  const employeeNames: { [key: string]: string } = {};
  employees.forEach(emp => {
    employeeNames[emp.id] = emp.name;
  });

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-lg mb-6">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
            <div className="flex gap-4">
              <Link
                href="/admin/reports"
                className="bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2 px-4 rounded transition"
              >
                Monthly Reports
              </Link>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 pb-8">
        {/* Today's Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 font-medium mb-1">Total Employees</div>
            <div className="text-3xl font-bold text-gray-800">{employees.length}</div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg shadow p-6">
            <div className="text-sm text-green-600 font-medium mb-1">Clocked In Today</div>
            <div className="text-3xl font-bold text-green-700">
              {todayAttendance.filter(att => att.clockIn && !att.clockOut).length}
            </div>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg shadow p-6">
            <div className="text-sm text-yellow-600 font-medium mb-1">Pending Leaves</div>
            <div className="text-3xl font-bold text-yellow-700">{pendingLeaves.length}</div>
          </div>
        </div>

        {/* Pending Leaves */}
        {pendingLeaves.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Pending Leave Requests</h2>
            <div className="space-y-3">
              {pendingLeaves.map((leave, index) => {
                const employee = employees.find(e => e.id === leave.employeeId);
                return (
                  <div key={index} className="p-4 bg-gray-50 rounded-lg flex justify-between items-center">
                    <div>
                      <div className="font-semibold">{employee?.name || leave.employeeId}</div>
                      <div className="text-sm text-gray-600">
                        {new Date(leave.date).toLocaleDateString()} - {leave.type} - {leave.reason}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={async () => {
                          try {
                            const response = await fetch(`/api/leaves/${leave.date}`, {
                              method: 'PATCH',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({
                                employeeId: leave.employeeId,
                                status: 'approved'
                              })
                            });
                            if (response.ok) {
                              fetchData();
                            }
                          } catch (err) {
                            alert('Failed to update leave');
                          }
                        }}
                        className="bg-green-600 hover:bg-green-700 text-white font-semibold py-1 px-3 rounded text-sm transition"
                      >
                        Approve
                      </button>
                      <button
                        onClick={async () => {
                          try {
                            const response = await fetch(`/api/leaves/${leave.date}`, {
                              method: 'PATCH',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({
                                employeeId: leave.employeeId,
                                status: 'rejected'
                              })
                            });
                            if (response.ok) {
                              fetchData();
                            }
                          } catch (err) {
                            alert('Failed to update leave');
                          }
                        }}
                        className="bg-red-600 hover:bg-red-700 text-white font-semibold py-1 px-3 rounded text-sm transition"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Add Employee */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Employees</h2>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2 px-4 rounded transition"
            >
              {showAddForm ? 'Cancel' : 'Add Employee'}
            </button>
          </div>

          {showAddForm && (
            <form onSubmit={handleAddEmployee} className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">Name</label>
                  <input
                    type="text"
                    value={employeeForm.name}
                    onChange={(e) => setEmployeeForm({ ...employeeForm, name: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">Unique Link</label>
                  <input
                    type="text"
                    value={employeeForm.uniqueLink}
                    onChange={(e) => setEmployeeForm({ ...employeeForm, uniqueLink: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="e.g., john-doe"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">Email</label>
                  <input
                    type="email"
                    value={employeeForm.email}
                    onChange={(e) => setEmployeeForm({ ...employeeForm, email: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">Password</label>
                  <input
                    type="password"
                    value={employeeForm.password}
                    onChange={(e) => setEmployeeForm({ ...employeeForm, password: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-gray-700 text-sm font-bold mb-2">Designation</label>
                  <input
                    type="text"
                    value={employeeForm.designation}
                    onChange={(e) => setEmployeeForm({ ...employeeForm, designation: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="e.g., Developer, Designer"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="mt-4 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded transition"
              >
                Add Employee
              </button>
            </form>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {employees.map((employee) => (
              <EmployeeCard
                key={employee.id}
                employee={employee}
                currentStatus={getEmployeeStatus(employee.id)}
                onDelete={handleDeleteEmployee}
                showActions={true}
              />
            ))}
          </div>
        </div>

        {/* Today's Attendance */}
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Today's Attendance</h2>
          <AttendanceTable attendance={todayAttendance} employeeNames={employeeNames} />
        </div>
      </div>
    </div>
  );
}
