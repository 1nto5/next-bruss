import { auth } from '@/lib/auth';
import { dbc } from '@/lib/db/mongo';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);

    const owner = searchParams.get('owner');
    const status = searchParams.get('status');
    const mine = searchParams.get('mine');

    const coll = await dbc('supplier_codes');

    const query: Record<string, unknown> = {};

    if (owner) {
      query.owner = owner;
    }

    if (status) {
      query.status = status;
    }

    if (mine === 'true') {
      query.owner = session.user.email;
    }

    const codes = await coll.find(query).sort({ code: 1 }).toArray();

    const result = codes.map((code) => ({
      ...code,
      _id: code._id.toString(),
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error('GET /api/invoices/supplier-codes error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
