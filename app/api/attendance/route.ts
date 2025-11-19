import { NextRequest, NextResponse } from 'next/server';
import { getAttendance, getAttendanceByEmployeeAndDate, upsertAttendance, getEmployeeById } from '@/lib/dataUtils';
import { formatDate, formatTime, isLate } from '@/lib/calculations';
import { Attendance } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employeeId');
    const date = searchParams.get('date');

    const data = await getAttendance();

    let attendance = data.attendance;

    if (employeeId) {
      attendance = attendance.filter(att => att.employeeId === employeeId);
    }

    if (date) {
      attendance = attendance.filter(att => att.date === date);
    }

    return NextResponse.json({ attendance });
  } catch (error) {
    console.error('Error in GET /api/attendance:', error);
    return NextResponse.json(
      { error: 'Failed to fetch attendance' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { employeeId, action } = body;

    if (!employeeId || !action) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const employee = await getEmployeeById(employeeId);
    if (!employee) {
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      );
    }

    const today = formatDate(new Date());
    const currentTime = formatTime(new Date());
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();

    let todayAttendance = await getAttendanceByEmployeeAndDate(employeeId, today);

    if (action === 'clock-in') {
      // RULE: Clock-in window is 21:00 to 22:00 only
      if (hours < 21 || hours > 22 || (hours === 22 && minutes > 0)) {
        const absentRecord: Attendance = {
          employeeId,
          date: today,
          clockIn: null,
          clockOut: null,
          status: 'absent',
          isLate: false,
          isHalfDay: false
        };
        await upsertAttendance(absentRecord);
        return NextResponse.json(
          { error: 'Clock-in window closed (21:00-22:00). Marked as absent for today.' },
          { status: 400 }
        );
      }

      if (todayAttendance && todayAttendance.clockIn) {
        return NextResponse.json(
          { error: 'Already clocked in today' },
          { status: 400 }
        );
      }

      const late = isLate(currentTime);

      if (!todayAttendance) {
        todayAttendance = {
          employeeId,
          date: today,
          clockIn: currentTime,
          clockOut: null,
          status: 'present',
          isLate: late,
          isHalfDay: false
        };
      } else {
        todayAttendance.clockIn = currentTime;
        todayAttendance.isLate = late;
        todayAttendance.status = 'present';
      }
    } else if (action === 'clock-out') {
      // Try to find today's record first
      let attendanceRecord = await getAttendanceByEmployeeAndDate(employeeId, today);
      // If not found today, check yesterday (for overnight shift)
      if (!attendanceRecord) {
        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const yesterdayDate = formatDate(yesterday);
        attendanceRecord = await getAttendanceByEmployeeAndDate(employeeId, yesterdayDate);
      }

      if (!attendanceRecord || !attendanceRecord.clockIn) {
        return NextResponse.json(
          { error: 'Please clock in first' },
          { status: 400 }
        );
      }

      if (attendanceRecord.clockOut) {
        return NextResponse.json(
          { error: 'Already clocked out' },
          { status: 400 }
        );
      }

      attendanceRecord.clockOut = currentTime;
      // RULE: If clock-out is before 09:00, mark as half-day
      const [outHours] = currentTime.split(':').map(Number);
      if (outHours < 9) {
        attendanceRecord.isHalfDay = true;
        attendanceRecord.status = 'half-day';
      } else {
        attendanceRecord.isHalfDay = false;
        attendanceRecord.status = 'present';
      }

      todayAttendance = attendanceRecord;
    } else {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      );
    }

    await upsertAttendance(todayAttendance);
    return NextResponse.json(todayAttendance);
  } catch (error) {
    console.error('Error in POST /api/attendance:', error);
    return NextResponse.json(
      { error: 'Failed to update attendance' },
      { status: 500 }
    );
  }
}
