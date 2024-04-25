import { NextResponse, type NextRequest } from 'next/server';
import { dbc } from '@/lib/mongo';

// https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config
// https://nextjs.org/docs/app/building-your-application/caching#on-demand-revalidation
// https://nextjs.org/docs/app/api-reference/functions/revalidateTag
export const dynamic = 'force-dynamic';
// 'auto' | 'force-dynamic' | 'error' | 'force-static'

export async function GET(req: NextRequest) {
  // console.log('getAllCapa:', new Date().toLocaleString('pl'));
  const capaCol = await dbc('capa');
  const allCapa = await capaCol.find({}).toArray();
  return new NextResponse(JSON.stringify(allCapa));
}
