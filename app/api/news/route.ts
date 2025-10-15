import { dbc } from '@/lib/db/mongo';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '3');
    const skip = (page - 1) * limit;

    const collection = await dbc('news');

    const [news, totalCount] = await Promise.all([
      collection
        .find({})
        .sort({ isPinned: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray(),
      collection.countDocuments({}),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      news,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    });
  } catch (error) {
    console.error('GET /api/news error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch news' },
      { status: 500 },
    );
  }
}
