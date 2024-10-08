import { dbc } from '@/lib/mongo';
import { NextResponse, type NextRequest } from 'next/server';

// https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config
// https://nextjs.org/docs/app/building-your-application/caching#on-demand-revalidation
// https://nextjs.org/docs/app/api-reference/functions/revalidateTag
export const dynamic = 'force-dynamic';
// 'auto' | 'force-dynamic' | 'error' | 'force-static'

export async function GET(req: NextRequest) {
  const articleNumber = req.nextUrl.searchParams.get('articleNumber') ?? '';
  try {
    const capaHistoryCol = await dbc('capa_history');
    const capaCol = await dbc('capa');
    const capaHistory = await capaHistoryCol
      .find({ articleNumber: articleNumber })
      .toArray();
    const capa = await capaCol.findOne({ articleNumber: articleNumber });
    const combined = [...capaHistory, capa];
    return new NextResponse(JSON.stringify(combined));
  } catch (error) {
    console.error(error);
    return new NextResponse('capa-history api error', { status: 503 });
  }
}
