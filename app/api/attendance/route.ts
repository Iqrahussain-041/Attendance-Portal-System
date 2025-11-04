import { NextRequest, NextResponse } from 'next/server';
import { getAttendance, saveAttendance, getEmployeeById } from '@/lib/dataUtils';
import { formatDate, formatTime, isLate } from '@/lib/calculations';
import { Attendance } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employeeId');
    const date = searchParams.get('date');

    const data = getAttendance();

    let attendance = data.attendance;

    if (employeeId) {
      attendance = attendance.filter(att => att.employeeId === employeeId);
    }

    if (date) {
      attendance = attendance.filter(att => att.date === date);
    }

    return NextResponse.json({ attendance });
  } catch (error) {
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

    const employee = getEmployeeById(employeeId);
    if (!employee) {
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      );
    }

    const data = getAttendance();
    const today = formatDate(new Date());
    const currentTime = formatTime(new Date());

    let todayAttendance = data.attendance.find(
      att => att.employeeId === employeeId && att.date === today
    );

    if (action === 'clock-in') {
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
        data.attendance.push(todayAttendance);
      } else {
        todayAttendance.clockIn = currentTime;
        todayAttendance.isLate = late;
        todayAttendance.status = 'present';
      }
    } else if (action === 'clock-out') {
      if (!todayAttendance || !todayAttendance.clockIn) {
        return NextResponse.json(
          { error: 'Please clock in first' },
          { status: 400 }
        );
      }

      if (todayAttendance.clockOut) {
        return NextResponse.json(
          { error: 'Already clocked out today' },
          { status: 400 }
        );
      }

      todayAttendance.clockOut = currentTime;
      todayAttendance.status = 'present';
    } else {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      );
    }

    saveAttendance(data);
    return NextResponse.json(todayAttendance);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update attendance' },
      { status: 500 }
    );
  }
}
