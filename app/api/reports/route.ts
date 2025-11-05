import { NextRequest, NextResponse } from 'next/server';
import { generateMonthlyReport } from '@/lib/calculations';
import { getEmployees } from '@/lib/dataUtils';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employeeId');
    const month = searchParams.get('month');
    const year = searchParams.get('year');

    if (!month || !year) {
      return NextResponse.json(
        { error: 'Month and year are required' },
        { status: 400 }
      );
    }

    const monthNum = parseInt(month);
    const yearNum = parseInt(year);

    if (monthNum < 1 || monthNum > 12 || yearNum < 2000 || yearNum > 2100) {
      return NextResponse.json(
        { error: 'Invalid month or year' },
        { status: 400 }
      );
    }

    if (employeeId) {
      // Generate report for specific employee
      const report = await generateMonthlyReport(employeeId, monthNum, yearNum);
      return NextResponse.json(report);
    } else {
      // Generate reports for all employees
      const { employees } = await getEmployees();
      const reports = await Promise.all(
        employees.map(emp => 
          generateMonthlyReport(emp.id, monthNum, yearNum)
        )
      );
      return NextResponse.json({ reports });
    }
  } catch (error: any) {
    console.error('Error in GET /api/reports:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate report' },
      { status: 500 }
    );
  }
}
