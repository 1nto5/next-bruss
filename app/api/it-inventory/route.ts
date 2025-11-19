import { dbc } from '@/lib/db/mongo';
import { NextResponse, type NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const query: any = {};

  // Multi-select filters
  if (searchParams.has('category')) {
    const categories = searchParams.getAll('category');
    query.category = categories.length === 1 ? categories[0] : { $in: categories };
  }

  if (searchParams.has('status')) {
    const statuses = searchParams.getAll('status');
    query.statuses = statuses.length === 1 ? statuses[0] : { $in: statuses };
  }

  // Assignment status filter
  if (searchParams.has('assignmentStatus')) {
    const assignmentStatus = searchParams.get('assignmentStatus');
    if (assignmentStatus === 'assigned') {
      query.currentAssignment = { $exists: true, $ne: null };
    } else if (assignmentStatus === 'unassigned') {
      query.$or = [
        { currentAssignment: { $exists: false } },
        { currentAssignment: null },
      ];
    }
  }

  // Purchase date range filter
  if (searchParams.has('purchaseDateFrom') || searchParams.has('purchaseDateTo')) {
    query.purchaseDate = {};
    if (searchParams.has('purchaseDateFrom')) {
      query.purchaseDate.$gte = new Date(searchParams.get('purchaseDateFrom')!);
    }
    if (searchParams.has('purchaseDateTo')) {
      query.purchaseDate.$lte = new Date(searchParams.get('purchaseDateTo')!);
    }
  }

  // Assignment date range filter
  if (searchParams.has('assignmentDateFrom') || searchParams.has('assignmentDateTo')) {
    query['currentAssignment.assignedAt'] = {};
    if (searchParams.has('assignmentDateFrom')) {
      query['currentAssignment.assignedAt'].$gte = new Date(
        searchParams.get('assignmentDateFrom')!,
      );
    }
    if (searchParams.has('assignmentDateTo')) {
      query['currentAssignment.assignedAt'].$lte = new Date(
        searchParams.get('assignmentDateTo')!,
      );
    }
  }

  // Text search filter
  if (searchParams.has('search')) {
    const search = searchParams.get('search')!;
    const searchRegex = new RegExp(search, 'i');
    query.$or = [
      { assetId: searchRegex },
      { serialNumber: searchRegex },
      { model: searchRegex },
      { manufacturer: searchRegex },
    ];
  }

  try {
    const coll = await dbc('it_inventory');
    const items = await coll
      .find(query)
      .sort({ _id: -1 })
      .limit(2000)
      .toArray();
    return new NextResponse(JSON.stringify(items));
  } catch (error) {
    console.error('api/it-inventory: ' + error);
    return NextResponse.json({ error: 'it-inventory api' }, { status: 503 });
  }
}
