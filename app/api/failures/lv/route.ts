import { dbc } from '@/lib/mongo';
import { NextResponse, type NextRequest } from 'next/server';

// https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config
// https://nextjs.org/docs/app/building-your-application/caching#on-demand-revalidation
// https://nextjs.org/docs/app/api-reference/functions/revalidateTag
export const dynamic = 'force-dynamic';
// 'auto' | 'force-dynamic' | 'error' | 'force-static'

export async function GET(req: NextRequest) {
  try {
    const from = req.nextUrl.searchParams.get('from');
    const to = req.nextUrl.searchParams.get('to');
    const coll = await dbc('failures_lv');

    let query: any = {};

    if (from) query.from = { $gte: new Date(from) };
    if (to) {
      const toDate = new Date(to);
      toDate.setDate(toDate.getDate());
      query.to = { $lte: toDate };
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
