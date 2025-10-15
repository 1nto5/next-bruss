import { dbc } from '@/lib/db/mongo';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const coll = await dbc('employees');
    const employees = await coll
      .find({ status: { $ne: 'inactive' } })
      .sort({ firstName: 1, lastName: 1 })
      .toArray();
    return new NextResponse(JSON.stringify(employees));
  } catch (error) {
    console.error('api/employees: ' + error);
    return NextResponse.json({ error: 'employees api' }, { status: 503 });
  }
}
