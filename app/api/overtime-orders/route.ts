import { dbc } from '@/lib/db/mongo';
import { NextResponse, type NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const query: any = {};
  const userEmail = searchParams.get('userEmail');

  // Exact match filters (for toggle switches "My Orders" and "I Am Responsible")
  if (searchParams.get('requestedBy')) {
    query.requestedBy = searchParams.get('requestedBy');
  }

  if (searchParams.get('responsibleEmployee')) {
    query.responsibleEmployee = searchParams.get('responsibleEmployee');
  }

  // Multi-select filters (for filter dropdowns)
  if (searchParams.get('createdBy')) {
    const createdByValues = searchParams.get('createdBy')!.split(',');
    query.requestedBy = createdByValues.length === 1 ? createdByValues[0] : { $in: createdByValues };
  }

  if (searchParams.get('responsiblePerson')) {
    const responsiblePersonValues = searchParams.get('responsiblePerson')!.split(',');
    query.responsibleEmployee = responsiblePersonValues.length === 1 ? responsiblePersonValues[0] : { $in: responsiblePersonValues };
  }

  if (searchParams.get('status')) {
    const statusValues = searchParams.get('status')!.split(',');
    query.status = statusValues.length === 1 ? statusValues[0] : { $in: statusValues };
  }

  if (searchParams.get('department')) {
    const departmentValues = searchParams.get('department')!.split(',');
    query.department = departmentValues.length === 1 ? departmentValues[0] : { $in: departmentValues };
  }

  searchParams.forEach((value, key) => {
    if (key === 'date') {
      // Create date objects for start and end of the specified date
      const dateValue = new Date(value);
      const startOfDay = new Date(dateValue.setHours(0, 0, 0, 0));
      const endOfDay = new Date(dateValue.setHours(23, 59, 59, 999));

      // Query where 'from' or 'to' falls within the specified date
      query.$or = [
        { from: { $gte: startOfDay, $lte: endOfDay } },
        { to: { $gte: startOfDay, $lte: endOfDay } },
      ];
    }

    if (key === 'id') {
      // Search for internalId that contains the search term (case insensitive)
      query.internalId = { $regex: value, $options: 'i' };
    }
  });

  if (searchParams.has('requestedAt')) {
    const requestedAtValue = new Date(searchParams.get('requestedAt')!);
    const startOfDay = new Date(requestedAtValue);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(requestedAtValue);
    endOfDay.setHours(23, 59, 59, 999);

    // Query where requestedAt falls within the specified date
    query.requestedAt = { $gte: startOfDay, $lte: endOfDay };
  }

  // Add condition to only show draft documents that belong to the current user
  if (userEmail) {
    // Either status is not draft OR (status is draft AND requestedBy equals userEmail)
    query.$and = query.$and || [];
    query.$and.push({
      $or: [
        { status: { $ne: 'draft' } },
        { $and: [{ status: 'draft' }, { requestedBy: userEmail }] },
      ],
    });
  }

  try {
    const coll = await dbc('overtime_orders');
    const failures = await coll
      .find(query)
      .sort({ _id: -1 })
      .limit(1000)
      .toArray();
    return new NextResponse(JSON.stringify(failures));
  } catch (error) {
    console.error('api/overtime-orders: ' + error);
    return NextResponse.json(
      { error: 'overtime-orders api' },
      { status: 503 },
    );
  }
}
