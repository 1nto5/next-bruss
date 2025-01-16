import { dbc } from '@/lib/mongo';
import { NextResponse, type NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const from = req.nextUrl.searchParams.get('from')?.replace(' ', '+');
    const to = req.nextUrl.searchParams.get('to')?.replace(' ', '+');
    const coll = await dbc('failures_lv');

    let query: any = {};

    if (from) query.from = { $gte: new Date(from) };
    if (to) {
      const toDate = new Date(to);
      toDate.setDate(toDate.getDate());
      query.$or = [{ to: { $lte: toDate } }, { to: { $exists: false } }];
    }

    const failures = await coll
      .find(query)
      .sort({ _id: -1 })
      .limit(1000)
      .toArray();
    return new NextResponse(JSON.stringify(failures));
  } catch (error) {
    console.error('api/failures/lv: ' + error);
    return NextResponse.json({ error: 'failures/lv api' }, { status: 503 });
  }
}
