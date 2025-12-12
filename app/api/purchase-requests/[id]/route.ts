import { dbc } from '@/lib/db/mongo';
import { ObjectId } from 'mongodb';
import { NextResponse, type NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  if (!ObjectId.isValid(id)) {
    return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
  }

  try {
    const requestsColl = await dbc('purchase_requests');
    const itemsColl = await dbc('purchase_request_items');

    const request = await requestsColl.findOne({ _id: new ObjectId(id) });

    if (!request) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    // Fetch items for this request
    const items = await itemsColl
      .find({ requestId: id })
      .sort({ _id: 1 })
      .toArray();

    return new NextResponse(
      JSON.stringify({
        ...request,
        items,
      }),
    );
  } catch (error) {
    console.error('api/purchase-requests/[id]: ' + error);
    return NextResponse.json(
      { error: 'purchase-requests api' },
      { status: 503 },
    );
  }
}
