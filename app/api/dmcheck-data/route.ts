import { dbc } from '@/lib/mongo';
import { NextResponse, type NextRequest } from 'next/server';

// https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config
// https://nextjs.org/docs/app/building-your-application/caching#on-demand-revalidation
// https://nextjs.org/docs/app/api-reference/functions/revalidateTag
export const dynamic = 'force-dynamic';
// 'auto' | 'force-dynamic' | 'error' | 'force-static'

export async function GET(req: NextRequest) {
  try {
    const coll = await dbc('scans');
    const scans = await coll.find({}).sort({ _id: -1 }).limit(1000).toArray();
    return new NextResponse(JSON.stringify(scans));
  } catch (error) {
    console.error('api/dmcheck-data: ' + error);
    return NextResponse.json({ error: 'dmcheck-data api' }, { status: 503 });
  }
}
