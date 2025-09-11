import { dbc } from '@/lib/mongo';
import { ObjectId } from 'mongodb';
import { NextResponse, type NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;

  // Check if ID is provided
  if (!searchParams.has('id')) {
    return NextResponse.json(
      { error: 'ID parameter is required' },
      { status: 400 },
    );
  }
  console.log('api/overtime-orders/request: ' + searchParams.get('id'));

  try {
    const id = searchParams.get('id')!;
    const query = { _id: new ObjectId(id) };

    const coll = await dbc('overtime_orders');
    const document = await coll.findOne(query);

    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 },
      );
    }

    return NextResponse.json(document);
  } catch (error) {
    console.error('api/overtime-orders/request: ' + error);
    return NextResponse.json(
      { error: 'overtime-orders/request api' },
      { status: 400 },
    );
  }
}
