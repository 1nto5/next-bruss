import { NextResponse, type NextRequest } from 'next/server';
import { dbc } from '@/lib/mongo';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const collection = await dbc('articles_config');
  const configs = await collection.find().toArray();
  // console.log('pobieram configi', configs);
  if (!configs) {
    return new NextResponse(JSON.stringify({ message: 'configs not found' }));
  }
  return new NextResponse(JSON.stringify(configs));
}
