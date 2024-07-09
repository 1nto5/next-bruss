import { NextResponse, NextRequest } from 'next/server';
import { dbc } from '@/lib/mongo';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const collection = await dbc('articles_config');
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
