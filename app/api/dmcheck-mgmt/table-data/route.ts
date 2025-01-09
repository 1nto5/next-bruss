import { dbc } from '@/lib/mongo';
import { NextResponse, type NextRequest } from 'next/server';

// https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config
// https://nextjs.org/docs/app/building-your-application/caching#on-demand-revalidation
// https://nextjs.org/docs/app/api-reference/functions/revalidateTag
export const dynamic = 'force-dynamic';
// 'auto' | 'force-dynamic' | 'error' | 'force-static'

export async function GET(req: NextRequest) {
  const dmc = req.nextUrl.searchParams.get('dmc');
  const workplace = req.nextUrl.searchParams.get('workplace');
  const operator = req.nextUrl.searchParams.get('operator');
  try {
    const coll = await dbc('scans');
    const query: any = {};
    if (dmc) query.dmc = dmc;
    if (workplace) query.workplace = workplace;
    if (operator) query.operator = operator;
    const scans = await coll
      .find(query)
      .sort({ _id: -1 })
      .limit(1000)
      .toArray();
    return new NextResponse(JSON.stringify(scans));
  } catch (error) {
    console.error('api/dmcheck-mgmt/table-data: ' + error);
    return NextResponse.json(
      { error: 'dmcheck-mgmt/table-data api' },
      { status: 503 },
    );
  }
}
