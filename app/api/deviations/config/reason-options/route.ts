import { dbc } from '@/lib/db/mongo';
import { NextResponse, type NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const coll = await dbc('deviations_configs');
    const configDoc = await coll.findOne({ config: 'reason_options' });
    return new NextResponse(JSON.stringify(configDoc?.options));
  } catch (error) {
    console.error('api/deviations/reason-options: ' + error);
    return NextResponse.json({ error: 'reason-options api' }, { status: 503 });
  }
}
