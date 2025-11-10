import { dbc } from '@/lib/db/mongo';
import { NextResponse, type NextRequest } from 'next/server';

// https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config
// https://nextjs.org/docs/app/building-your-application/caching#on-demand-revalidation
// https://nextjs.org/docs/app/api-reference/functions/revalidateTag
export const dynamic = 'force-dynamic';
// 'auto' | 'force-dynamic' | 'error' | 'force-static'

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const query: any = {};

  // Card number filter - exact match
  if (searchParams.get('cardNumber')) {
    const cardNumber = parseInt(searchParams.get('cardNumber')!);
    if (!isNaN(cardNumber)) {
      query.cardNumber = cardNumber;
    }
  }

  // Creators filter - case-insensitive regex search
  if (searchParams.get('creators')) {
    query.creators = { $regex: searchParams.get('creators'), $options: 'i' };
  }

  // Warehouse filter - multi-select
  if (searchParams.get('warehouse')) {
    const warehouseValues = searchParams.get('warehouse')!.split(',');
    query.warehouse =
      warehouseValues.length === 1
        ? warehouseValues[0]
        : { $in: warehouseValues };
  }

  // Sector filter - multi-select
  if (searchParams.get('sector')) {
    const sectorValues = searchParams.get('sector')!.split(',');
    query.sector =
      sectorValues.length === 1 ? sectorValues[0] : { $in: sectorValues };
  }

  try {
    const coll = await dbc('inventory_cards');
    const cards = await coll.find(query).sort({ _id: -1 }).limit(10000).toArray();
    return new NextResponse(JSON.stringify(cards));
  } catch (error) {
    console.error('api/inventory/cards: ' + error);
    return NextResponse.json({ error: 'inventory/cards api' }, { status: 503 });
  }
}
