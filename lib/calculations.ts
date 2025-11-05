import { Attendance, Leave, MonthlyReport } from './types';
import { getAttendance, getLeaves, getEmployeeById } from './dataUtils';

const STANDARD_START_TIME = '09:00:00';

// Check if time is late (after 9:00 AM)
export function isLate(clockInTime: string): boolean {
  const [hours, minutes] = clockInTime.split(':').map(Number);
  const [stdHours, stdMinutes] = STANDARD_START_TIME.split(':').map(Number);
  
  if (hours > stdHours) return true;
  if (hours === stdHours && minutes > stdMinutes) return true;
  return false;
}

// Format time from Date object
export function formatTime(date: Date): string {
  return date.toTimeString().split(' ')[0];
}

// Format date as YYYY-MM-DD
export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

// Calculate hours between two times
export function calculateHours(clockIn: string, clockOut: string): number {
  const [inHours, inMinutes] = clockIn.split(':').map(Number);
  const [outHours, outMinutes] = clockOut.split(':').map(Number);
  
  const inTotalMinutes = inHours * 60 + inMinutes;
  const outTotalMinutes = outHours * 60 + outMinutes;
  
  return (outTotalMinutes - inTotalMinutes) / 60;
}

// Generate monthly report for an employee
export async function generateMonthlyReport(employeeId: string, month: number, year: number): Promise<MonthlyReport> {
  const { attendance } = await getAttendance();
  const { leaves } = await getLeaves();
  const employee = await getEmployeeById(employeeId);
  
  if (!employee) {
    throw new Error('Employee not found');
  }
  
  // Filter attendance for the specified month and year
  const monthAttendance = attendance.filter(att => {
    if (att.employeeId !== employeeId) return false;
    const [attYear, attMonth] = att.date.split('-').map(Number);
    return attYear === year && attMonth === month;
  });
  
  // Filter leaves for the specified month and year
  const monthLeaves = leaves.filter(leave => {
    if (leave.employeeId !== employeeId) return false;
    if (leave.status !== 'approved') return false;
    const [leaveYear, leaveMonth] = leave.date.split('-').map(Number);
    return leaveYear === year && leaveMonth === month;
  });
  
  // Calculate statistics
  const totalPresent = monthAttendance.filter(att => 
    att.status === 'present' && att.clockIn && att.clockOut
  ).length;
  
  const totalHalfDays = monthAttendance.filter(att => 
    att.isHalfDay || att.status === 'half-day'
  ).length;
  
  const fullDayLeaves = monthLeaves.filter(leave => leave.type === 'full-day').length;
  const halfDayLeaves = monthLeaves.filter(leave => leave.type === 'half-day').length;
  
  const totalLeaves = fullDayLeaves;
  const totalHalfDaysWithLeaves = totalHalfDays + halfDayLeaves;
  
  const totalLateArrivals = monthAttendance.filter(att => att.isLate).length;
  
  return {
    employeeId,
    employeeName: employee.name,
    month,
    year,
    totalPresent,
    totalLeaves,
    totalHalfDays: totalHalfDaysWithLeaves,
    totalLateArrivals,
    attendanceDetails: monthAttendance.sort((a, b) => a.date.localeCompare(b.date))
  };
}

// Get current status of an employee (clocked in or out)
export async function getCurrentStatus(employeeId: string): Promise<{ isClockedIn: boolean; attendance: Attendance | null }> {
  const today = formatDate(new Date());
  const { attendance } = await getAttendance();
  
  const todayAttendance = attendance.find(att => 
    att.employeeId === employeeId && 
    att.date === today
  );
  
  if (!todayAttendance) {
    return { isClockedIn: false, attendance: null };
  }
  
  const isClockedIn = todayAttendance.clockIn !== null && todayAttendance.clockOut === null;
  return { isClockedIn, attendance: todayAttendance };
}
