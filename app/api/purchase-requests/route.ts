import { dbc } from '@/lib/db/mongo';
import { NextResponse, type NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const query: any = {};

  // Filter by status
  if (searchParams.get('status')) {
    query.status = searchParams.get('status');
  }

  // Filter by requestedBy (user's own requests)
  if (searchParams.get('requestedBy')) {
    query.requestedBy = searchParams.get('requestedBy');
  }

  // Filter by manager (requests assigned to this manager)
  if (searchParams.get('manager')) {
    query.manager = searchParams.get('manager');
  }

  // Filter by supplier
  if (searchParams.get('supplier')) {
    query.supplier = { $regex: searchParams.get('supplier'), $options: 'i' };
  }

  // Filter by date range
  if (searchParams.get('fromDate')) {
    const fromDate = new Date(searchParams.get('fromDate')!);
    fromDate.setHours(0, 0, 0, 0);
    query.requestedAt = { ...query.requestedAt, $gte: fromDate };
  }

  if (searchParams.get('toDate')) {
    const toDate = new Date(searchParams.get('toDate')!);
    toDate.setHours(23, 59, 59, 999);
    query.requestedAt = { ...query.requestedAt, $lte: toDate };
  }

  // Filter for approvers - show requests waiting for their approval
  if (searchParams.get('toPreApprove') === 'true') {
    query.status = 'pending';
  }

  if (searchParams.get('toFinalApprove') === 'true') {
    query.status = 'pre-approved';
  }

  try {
    const coll = await dbc('purchase_requests');
    const requests = await coll
      .find(query)
      .sort({ _id: -1 })
      .limit(1000)
      .toArray();
    return new NextResponse(JSON.stringify(requests));
  } catch (error) {
    console.error('api/purchase-requests: ' + error);
    return NextResponse.json(
      { error: 'purchase-requests api' },
      { status: 503 },
    );
  }
}
