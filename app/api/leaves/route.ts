import { NextRequest, NextResponse } from 'next/server';
import { getLeaves, addLeave, getEmployeeById } from '@/lib/dataUtils';
import { Leave } from '@/lib/types';
import { getDb } from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employeeId');
    const status = searchParams.get('status');

    const data = await getLeaves();

    let leaves = data.leaves;

    if (employeeId) {
      leaves = leaves.filter(leave => leave.employeeId === employeeId);
    }

    if (status) {
      leaves = leaves.filter(leave => leave.status === status);
    }

    return NextResponse.json({ leaves });
  } catch (error) {
    console.error('Error in GET /api/leaves:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leaves' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { employeeId, date, type, reason } = body;

    if (!employeeId || !date || !type || !reason) {
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

    // Check if leave already exists for this date
    const db = await getDb();
    const existingLeave = await db.collection<Leave>('leaves').findOne({
      employeeId,
      date
    });

    if (existingLeave) {
      return NextResponse.json(
        { error: 'Leave already requested for this date' },
        { status: 400 }
      );
    }

    const newLeave: Leave = {
      employeeId,
      date,
      type,
      reason,
      status: 'pending',
      requestedAt: new Date().toISOString()
    };

    await addLeave(newLeave);

    return NextResponse.json(newLeave, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/leaves:', error);
    return NextResponse.json(
      { error: 'Failed to create leave request' },
      { status: 500 }
    );
  }
}
