import { dbc } from '@/lib/mongo';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const coll = await dbc('overtime_departments');
    const departments = await coll
      .find({ isActive: true })
      .sort({ sortOrder: 1 })
      .toArray();
    
    return NextResponse.json(departments);
  } catch (error) {
    console.error('api/overtime-departments: ' + error);
    return NextResponse.json(
      { error: 'overtime-departments api error' },
      { status: 503 },
    );
  }
}