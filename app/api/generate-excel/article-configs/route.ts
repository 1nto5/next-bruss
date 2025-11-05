import { dbc } from '@/lib/db/mongo';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const collection = await dbc('dmcheck_configs');
    const configs = await collection.find().toArray();
    return new NextResponse(JSON.stringify(configs), { status: 200 });
  } catch (error) {
    console.error('Error retrieving article configs:', error);
    return new NextResponse(
      JSON.stringify({ message: 'Error retrieving article configs' }),
      { status: 500 },
    );
  }
}
