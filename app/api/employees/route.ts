import { NextRequest, NextResponse } from 'next/server';
import { getEmployees, addEmployee, getEmployeeByLink } from '@/lib/dataUtils';
import { v4 as uuidv4 } from 'uuid';
import { Employee } from '@/lib/types';

export async function GET() {
  try {
    const data = await getEmployees();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in GET /api/employees:', error);
    return NextResponse.json(
      { error: 'Failed to fetch employees' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, uniqueLink, password, email, designation } = body;

    if (!name || !uniqueLink || !password || !email) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const existing = await getEmployeeByLink(uniqueLink);
    if (existing) {
      return NextResponse.json(
        { error: 'Employee with this link already exists' },
        { status: 400 }
      );
    }

    const newEmployee: Employee = {
      id: uuidv4(),
      name,
      uniqueLink,
      password,
      email,
      designation: designation || 'Employee'
    };

    await addEmployee(newEmployee);

    return NextResponse.json(newEmployee, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/employees:', error);
    return NextResponse.json(
      { error: 'Failed to create employee' },
      { status: 500 }
    );
  }
}
