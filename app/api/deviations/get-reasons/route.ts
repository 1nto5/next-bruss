import { NextResponse, type NextRequest } from 'next/server';
import { dbc } from '@/lib/mongo';

// https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config
// https://nextjs.org/docs/app/building-your-application/caching#on-demand-revalidation
// https://nextjs.org/docs/app/api-reference/functions/revalidateTag
export const dynamic = 'force-dynamic';
// 'auto' | 'force-dynamic' | 'error' | 'force-static'

export async function GET(req: NextRequest) {
  try {
    console.log('api/deviations/get-deviations');
    const coll = await dbc('deviations');
    const reasons = await coll.find({}).toArray();
    return new NextResponse(JSON.stringify(reasons));
  } catch (error) {
    console.error('api/deviations/get-reasons: ' + error);
    return new NextResponse('get-reasons api error', { status: 503 });
  }
}
