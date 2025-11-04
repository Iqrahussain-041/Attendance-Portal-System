import fs from 'fs';
import path from 'path';
import { EmployeesData, AttendanceData, LeavesData, Employee, Attendance, Leave } from './types';

const dataDir = path.join(process.cwd(), 'data');

// Ensure data directory exists
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Read employees data
export function getEmployees(): EmployeesData {
  const filePath = path.join(dataDir, 'employees.json');
  if (!fs.existsSync(filePath)) {
    return { employees: [] };
  }
  const fileContents = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(fileContents);
}

// Write employees data
export function saveEmployees(data: EmployeesData): void {
  const filePath = path.join(dataDir, 'employees.json');
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

// Read attendance data
export function getAttendance(): AttendanceData {
  const filePath = path.join(dataDir, 'attendance.json');
  if (!fs.existsSync(filePath)) {
    return { attendance: [] };
  }
  const fileContents = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(fileContents);
}

// Write attendance data
export function saveAttendance(data: AttendanceData): void {
  const filePath = path.join(dataDir, 'attendance.json');
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

// Read leaves data
export function getLeaves(): LeavesData {
  const filePath = path.join(dataDir, 'leaves.json');
  if (!fs.existsSync(filePath)) {
    return { leaves: [] };
  }
  const fileContents = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(fileContents);
}

// Write leaves data
export function saveLeaves(data: LeavesData): void {
  const filePath = path.join(dataDir, 'leaves.json');
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

// Helper functions
export function getEmployeeByLink(uniqueLink: string): Employee | null {
  const { employees } = getEmployees();
  return employees.find(emp => emp.uniqueLink === uniqueLink) || null;
}

export function getEmployeeById(id: string): Employee | null {
  const { employees } = getEmployees();
  return employees.find(emp => emp.id === id) || null;
}

export function getAttendanceByEmployeeId(employeeId: string): Attendance[] {
  const { attendance } = getAttendance();
  return attendance.filter(att => att.employeeId === employeeId);
}

export function getAttendanceByDate(date: string): Attendance[] {
  const { attendance } = getAttendance();
  return attendance.filter(att => att.date === date);
}

export function getTodayAttendance(): Attendance[] {
  const today = new Date().toISOString().split('T')[0];
  return getAttendanceByDate(today);
}
