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

  const canClockIn = () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    
    // Allow clock-in from 21:00 to 22:00 inclusive
    if (hours === 21) return true;
    if (hours === 22 && minutes === 0) return true;
    return false;
  };

  const handleClockIn = async () => {
    // Client-side validation: clock-in only between 21:00 and 22:00
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    
    if (hours < 21 || hours > 22 || (hours === 22 && minutes > 0)) {
      setError('Clock-in allowed only between 21:00 and 22:00.');
      return;
    }

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

  const canClockOut = () => {
    const now = new Date();
    const hours = now.getHours();
    
    if (hours >= 21) return true;
    if (hours < 10) return true;
    if (hours === 10 && now.getMinutes() === 0) return true;
    return false;
  };

  const handleClockOut = async () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    
    // Check if clock-out is within allowed window (21:00 to 10:00 AM)
    const isWithinWindow = (hours >= 21) || (hours < 10) || (hours === 10 && minutes === 0);
    if (!isWithinWindow) {
      setError('Clock-out expired. Available only until 10:00 AM.');
      return;
    }
    
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

  useEffect(() => {
    const checkAutoLogout = async () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      
      if ((hours === 10 && minutes === 0) && isClockedIn) {
        try {
          await fetch('/api/attendance', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              employeeId: employee.id,
              action: 'clock-out'
            })
          });
          setIsClockedIn(false);
        } catch (err) {
          console.error('Auto logout failed:', err);
        }
      }
    };
    
    const timer = setInterval(checkAutoLogout, 60000);
    return () => clearInterval(timer);
  }, [isClockedIn, employee.id]);

  return (
    <div className="bg-gray-900 rounded-lg shadow-lg p-6 mb-6 text-gray-100">
      <h2 className="text-2xl font-bold text-gray-100 mb-4">Check In/Out</h2>
      
      <div className="text-center mb-6">
        <div className="text-4xl font-mono font-bold text-primary-600 mb-2">
          {currentTime.toLocaleTimeString()}
        </div>
        <div className="text-lg text-gray-300">
          {currentTime.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </div>
      </div>

      {error && (
        <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-700 p-4 rounded">
          <div className="text-sm text-gray-300 mb-1">Check In Time</div>
          <div className="text-xl font-semibold text-gray-100">
            {formatTime(clockInTime)}
          </div>
        </div>
        <div className="bg-gray-700 p-4 rounded">
          <div className="text-sm text-gray-300 mb-1">Check Out Time</div>
          <div className="text-xl font-semibold text-gray-100">
            {formatTime(clockOutTime)}
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        {!isClockedIn ? (
          <button
            onClick={handleClockIn}
            disabled={loading || !canClockIn()}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Processing...' : 'Check In'}
          </button>
        ) : (
          <button
            onClick={handleClockOut}
            disabled={loading || !canClockOut()}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Processing...' : 'Check Out'}
          </button>
        )}
      </div>

      {isClockedIn && (
        <div className="mt-4 text-center">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
            Currently Checked In
          </span>
        </div>
      )}
    </div>
  );
}
