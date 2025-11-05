import { NextRequest, NextResponse } from 'next/server';
import { updateLeave, getLeaves } from '@/lib/dataUtils';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { status, employeeId } = body;

    if (!status || !['approved', 'rejected', 'pending'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    if (!employeeId) {
      return NextResponse.json(
        { error: 'Employee ID is required' },
        { status: 400 }
      );
    }

    // params.id contains the date in format YYYY-MM-DD
    const data = await getLeaves();
    const leave = data.leaves.find(
      l => l.employeeId === employeeId && l.date === params.id
    );

    if (!leave) {
      return NextResponse.json(
        { error: 'Leave not found' },
        { status: 404 }
      );
    }

    await updateLeave(employeeId, params.id, { status });

    return NextResponse.json({ ...leave, status });
  } catch (error) {
    console.error('Error in PATCH /api/leaves/[id]:', error);
    return NextResponse.json(
      { error: 'Failed to update leave' },
      { status: 500 }
    );
  }
}
