import { dbc } from '@/lib/db/mongo';
import { NextResponse, type NextRequest } from 'next/server';

// https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config
// https://nextjs.org/docs/app/building-your-application/caching#on-demand-revalidation
// https://nextjs.org/docs/app/api-reference/functions/revalidateTag
export const dynamic = 'force-dynamic';
// 'auto' | 'force-dynamic' | 'error' | 'force-static'

export async function GET(req: NextRequest) {
  try {
    const coll = await dbc('inventory_cards');
    const cards = await coll.find({}).sort({ _id: -1 }).limit(10000).toArray();
    return new NextResponse(JSON.stringify(cards));
  } catch (error) {
    console.error('api/inventory/cards: ' + error);
    return NextResponse.json({ error: 'inventory/cards api' }, { status: 503 });
  }
}
