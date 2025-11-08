export interface Employee {
  id: string;
  name: string;
  uniqueLink: string;
  password: string;
  email: string;
  designation: string;
  jobStartTime: string;
  jobEndTime: string;
}

export interface Attendance {
  employeeId: string;
  date: string;
  clockIn: string | null;
  clockOut: string | null;
  status: 'present' | 'absent' | 'half-day';
  isLate: boolean;
  isHalfDay: boolean;
}

export interface Leave {
  employeeId: string;
  date: string;
  type: 'full-day' | 'half-day';
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: string;
}

export interface MonthlyReport {
  employeeId: string;
  employeeName: string;
  month: number;
  year: number;
  totalPresent: number;
  totalLeaves: number;
  totalHalfDays: number;
  totalLateArrivals: number;
  attendanceDetails: Attendance[];
}

export interface EmployeesData {
  employees: Employee[];
}

export interface AttendanceData {
  attendance: Attendance[];
}

export interface LeavesData {
  leaves: Leave[];
}
