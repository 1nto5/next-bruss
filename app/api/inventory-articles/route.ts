import { dbc } from '@/lib/mongo';
import { NextResponse, type NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const query = searchParams.get('query');

  if (!query || query.trim().length === 0) {
    return NextResponse.json(
      { error: 'Query parameter is required' },
      { status: 400 },
    );
  }

  try {
    const coll = await dbc('inventory_articles');

    // Search by both number and name using case-insensitive regex
    const articles = await coll
      .find({
        $or: [
          { number: { $regex: query, $options: 'i' } },
          { name: { $regex: query, $options: 'i' } },
        ],
      })
      .limit(20) // Limit results to prevent overwhelming the UI
      .toArray();

    return NextResponse.json(articles);
  } catch (error) {
    console.error('api/inventory-articles: ' + error);
    return NextResponse.json(
      { error: 'inventory-articles api error' },
      { status: 503 },
    );
  }
}
