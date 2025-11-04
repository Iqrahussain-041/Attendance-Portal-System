'use client';

import { useState, useEffect } from 'react';
import { Employee } from '@/lib/types';

interface ClockInOutProps {
  employee: Employee;
  onUpdate: () => void;
}

export default function ClockInOut({ employee, onUpdate }: ClockInOutProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [clockInTime, setClockInTime] = useState<string | null>(null);
  const [clockOutTime, setClockOutTime] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    fetchTodayAttendance();
    return () => clearInterval(timer);
  }, []);

  const fetchTodayAttendance = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await fetch(
        `/api/attendance?employeeId=${employee.id}&date=${today}`
      );
      const data = await response.json();
      
      if (data.attendance && data.attendance.length > 0) {
        const todayAtt = data.attendance[0];
        setIsClockedIn(todayAtt.clockIn !== null && todayAtt.clockOut === null);
        setClockInTime(todayAtt.clockIn);
        setClockOutTime(todayAtt.clockOut);
      }
    } catch (err) {
      console.error('Error fetching attendance:', err);
    }
  };

  const handleClockIn = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: employee.id,
          action: 'clock-in'
        })
      });

      const data = await response.json();
      if (response.ok) {
        setIsClockedIn(true);
        setClockInTime(data.clockIn);
        onUpdate();
      } else {
        setError(data.error || 'Failed to clock in');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClockOut = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: employee.id,
          action: 'clock-out'
        })
      });

      const data = await response.json();
      if (response.ok) {
        setIsClockedIn(false);
        setClockOutTime(data.clockOut);
        onUpdate();
      } else {
        setError(data.error || 'Failed to clock out');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (time: string | null) => {
    if (!time) return '--:--:--';
    return time;
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Clock In/Out</h2>
      
      <div className="text-center mb-6">
        <div className="text-4xl font-mono font-bold text-primary-600 mb-2">
          {currentTime.toLocaleTimeString()}
        </div>
        <div className="text-lg text-gray-600">
          {currentTime.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-50 p-4 rounded">
          <div className="text-sm text-gray-600 mb-1">Clock In Time</div>
          <div className="text-xl font-semibold text-gray-800">
            {formatTime(clockInTime)}
          </div>
        </div>
        <div className="bg-gray-50 p-4 rounded">
          <div className="text-sm text-gray-600 mb-1">Clock Out Time</div>
          <div className="text-xl font-semibold text-gray-800">
            {formatTime(clockOutTime)}
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        {!isClockedIn ? (
          <button
            onClick={handleClockIn}
            disabled={loading}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Processing...' : 'Clock In'}
          </button>
        ) : (
          <button
            onClick={handleClockOut}
            disabled={loading}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Processing...' : 'Clock Out'}
          </button>
        )}
      </div>

      {isClockedIn && (
        <div className="mt-4 text-center">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
            Currently Clocked In
          </span>
        </div>
      )}
    </div>
  );
}
