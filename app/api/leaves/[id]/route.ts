import { NextRequest, NextResponse } from 'next/server';
import { getLeaves, saveLeaves } from '@/lib/dataUtils';

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

    const data = getLeaves();
    
    // params.id contains the date in format YYYY-MM-DD
    const leaveIndex = data.leaves.findIndex(
      l => l.employeeId === employeeId && l.date === params.id
    );

    if (leaveIndex === -1) {
      return NextResponse.json(
        { error: 'Leave not found' },
        { status: 404 }
      );
    }

    data.leaves[leaveIndex].status = status;
    saveLeaves(data);

    return NextResponse.json(data.leaves[leaveIndex]);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update leave' },
      { status: 500 }
    );
  }
}
