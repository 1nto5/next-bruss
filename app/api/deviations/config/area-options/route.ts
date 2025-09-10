import { dbc } from '@/lib/mongo';
import { NextResponse, type NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const coll = await dbc('deviations_config');
    const configDoc = await coll.findOne({ config: 'area_options' });
    return new NextResponse(JSON.stringify(configDoc?.options));
  } catch (error) {
    console.error('api/deviations/area-options: ' + error);
    return NextResponse.json({ error: 'area-options api' }, { status: 503 });
  }
}
