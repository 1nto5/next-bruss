import { dbc } from '@/lib/db/mongo';
import { NextResponse, type NextRequest } from 'next/server';

// https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config
// https://nextjs.org/docs/app/building-your-application/caching#on-demand-revalidation
// https://nextjs.org/docs/app/api-reference/functions/revalidateTag
export const dynamic = 'force-dynamic';
// 'auto' | 'force-dynamic' | 'error' | 'force-static'
export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;

  try {
    const coll = await dbc('inventory_cards');
    const cards = await coll.find({}).sort({ _id: -1 }).toArray();

    let positions = cards.flatMap((card) => card.positions || []);

    // Apply client-side filtering on the flattened positions
    if (searchParams.get('position')) {
      const positionValue = parseInt(searchParams.get('position')!);
      if (!isNaN(positionValue)) {
        positions = positions.filter((p: any) => p.position === positionValue);
      }
    }

    if (searchParams.get('articleName')) {
      const articleNameValue = searchParams.get('articleName')!.toLowerCase();
      positions = positions.filter((p: any) =>
        p.article?.toLowerCase().includes(articleNameValue),
      );
    }

    if (searchParams.get('articleNumber')) {
      const articleNumberValue = searchParams.get('articleNumber')!;
      positions = positions.filter((p: any) =>
        p.articleNumber?.toString().includes(articleNumberValue),
      );
    }

    if (searchParams.get('quantity')) {
      const quantityValue = parseInt(searchParams.get('quantity')!);
      if (!isNaN(quantityValue)) {
        positions = positions.filter((p: any) => p.quantity === quantityValue);
      }
    }

    return new NextResponse(
      JSON.stringify({
        positions,
      }),
    );
  } catch (error) {
    console.error('api/inventory/card-positions: ' + error);
    return NextResponse.json(
      { error: 'inventory/positions api' },
      { status: 503 },
    );
  }
}
