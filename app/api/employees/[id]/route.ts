import { NextRequest, NextResponse } from 'next/server';
import { getEmployeeById, deleteEmployee } from '@/lib/dataUtils';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const employee = await getEmployeeById(params.id);
    if (!employee) {
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(employee);
  } catch (error) {
    console.error('Error in GET /api/employees/[id]:', error);
    return NextResponse.json(
      { error: 'Failed to fetch employee' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const employee = await getEmployeeById(params.id);
    
    if (!employee) {
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      );
    }

    await deleteEmployee(params.id);

    return NextResponse.json({ message: 'Employee deleted successfully' });
  } catch (error) {
    console.error('Error in DELETE /api/employees/[id]:', error);
    return NextResponse.json(
      { error: 'Failed to delete employee' },
      { status: 500 }
    );
  }
}
