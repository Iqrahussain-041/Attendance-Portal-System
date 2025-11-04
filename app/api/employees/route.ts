import { NextRequest, NextResponse } from 'next/server';
import { getEmployees, saveEmployees, getEmployeeByLink } from '@/lib/dataUtils';
import { Employee } from '@/lib/types';

export async function GET() {
  try {
    const data = getEmployees();
    return NextResponse.json(data);
  } catch (error) {
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

    const existing = getEmployeeByLink(uniqueLink);
    if (existing) {
      return NextResponse.json(
        { error: 'Employee with this link already exists' },
        { status: 400 }
      );
    }

    const data = getEmployees();
    const newEmployee: Employee = {
      id: `emp${String(data.employees.length + 1).padStart(3, '0')}`,
      name,
      uniqueLink,
      password,
      email,
      designation: designation || 'Employee'
    };

    data.employees.push(newEmployee);
    saveEmployees(data);

    return NextResponse.json(newEmployee, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create employee' },
      { status: 500 }
    );
  }
}
