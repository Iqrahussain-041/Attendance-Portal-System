import { getDb } from './mongodb';
import { EmployeesData, AttendanceData, LeavesData, Employee, Attendance, Leave } from './types';

// Read employees data
export async function getEmployees(): Promise<EmployeesData> {
  try {
    const db = await getDb();
    const employees = await db.collection<Employee>('employees').find({}).toArray();
    return { employees };
  } catch (error) {
    console.error('Error fetching employees:', error);
    return { employees: [] };
  }
}

// Write employees data (save all employees)
export async function saveEmployees(data: EmployeesData): Promise<void> {
  const db = await getDb();
  const collection = db.collection<Employee>('employees');
  
  // Clear existing and insert all
  await collection.deleteMany({});
  if (data.employees.length > 0) {
    await collection.insertMany(data.employees);
  }
}

// Add a single employee
export async function addEmployee(employee: Employee): Promise<void> {
  const db = await getDb();
  await db.collection<Employee>('employees').insertOne(employee);
}

// Update a single employee
export async function updateEmployee(id: string, employee: Partial<Employee>): Promise<void> {
  const db = await getDb();
  await db.collection<Employee>('employees').updateOne(
    { id },
    { $set: employee }
  );
}

// Delete a single employee
export async function deleteEmployee(id: string): Promise<void> {
  const db = await getDb();
  await db.collection<Employee>('employees').deleteOne({ id });
}

// Read attendance data
export async function getAttendance(): Promise<AttendanceData> {
  try {
    const db = await getDb();
    const attendance = await db.collection<Attendance>('attendance').find({}).toArray();
    return { attendance };
  } catch (error) {
    console.error('Error fetching attendance:', error);
    return { attendance: [] };
  }
}

// Write attendance data (save all attendance)
export async function saveAttendance(data: AttendanceData): Promise<void> {
  const db = await getDb();
  const collection = db.collection<Attendance>('attendance');
  
  // Clear existing and insert all
  await collection.deleteMany({});
  if (data.attendance.length > 0) {
    await collection.insertMany(data.attendance);
  }
}

// Add or update a single attendance record
export async function upsertAttendance(attendance: Attendance): Promise<void> {
  const db = await getDb();
  await db.collection<Attendance>('attendance').updateOne(
    { employeeId: attendance.employeeId, date: attendance.date },
    { $set: attendance },
    { upsert: true }
  );
}

// Read leaves data
export async function getLeaves(): Promise<LeavesData> {
  try {
    const db = await getDb();
    const leaves = await db.collection<Leave>('leaves').find({}).toArray();
    return { leaves };
  } catch (error) {
    console.error('Error fetching leaves:', error);
    return { leaves: [] };
  }
}

// Write leaves data (save all leaves)
export async function saveLeaves(data: LeavesData): Promise<void> {
  const db = await getDb();
  const collection = db.collection<Leave>('leaves');
  
  // Clear existing and insert all
  await collection.deleteMany({});
  if (data.leaves.length > 0) {
    await collection.insertMany(data.leaves);
  }
}

// Add a single leave
export async function addLeave(leave: Leave): Promise<void> {
  const db = await getDb();
  await db.collection<Leave>('leaves').insertOne(leave);
}

// Update a single leave
export async function updateLeave(employeeId: string, date: string, leave: Partial<Leave>): Promise<void> {
  const db = await getDb();
  await db.collection<Leave>('leaves').updateOne(
    { employeeId, date },
    { $set: leave }
  );
}

// Helper functions
export async function getEmployeeByLink(uniqueLink: string): Promise<Employee | null> {
  try {
    const db = await getDb();
    return await db.collection<Employee>('employees').findOne({ uniqueLink });
  } catch (error) {
    console.error('Error fetching employee by link:', error);
    return null;
  }
}

export async function getEmployeeById(id: string): Promise<Employee | null> {
  try {
    const db = await getDb();
    return await db.collection<Employee>('employees').findOne({ id });
  } catch (error) {
    console.error('Error fetching employee by id:', error);
    return null;
  }
}

export async function getAttendanceByEmployeeId(employeeId: string): Promise<Attendance[]> {
  try {
    const db = await getDb();
    return await db.collection<Attendance>('attendance')
      .find({ employeeId })
      .toArray();
  } catch (error) {
    console.error('Error fetching attendance by employee id:', error);
    return [];
  }
}

export async function getAttendanceByDate(date: string): Promise<Attendance[]> {
  try {
    const db = await getDb();
    return await db.collection<Attendance>('attendance')
      .find({ date })
      .toArray();
  } catch (error) {
    console.error('Error fetching attendance by date:', error);
    return [];
  }
}

export async function getTodayAttendance(): Promise<Attendance[]> {
  const today = new Date().toISOString().split('T')[0];
  return getAttendanceByDate(today);
}

// Get attendance by employee and date
export async function getAttendanceByEmployeeAndDate(employeeId: string, date: string): Promise<Attendance | null> {
  try {
    const db = await getDb();
    return await db.collection<Attendance>('attendance').findOne({ employeeId, date });
  } catch (error) {
    console.error('Error fetching attendance by employee and date:', error);
    return null;
  }
}
