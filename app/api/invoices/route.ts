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

    const status = searchParams.get('status');
    const receiver = searchParams.get('receiver');
    const sender = searchParams.get('sender');
    const mine = searchParams.get('mine');

    const coll = await dbc('invoices');

    const query: Record<string, unknown> = {};

    if (status) {
      query.status = status;
    }

    if (receiver) {
      query.receiver = receiver;
    }

    if (sender) {
      query.sender = sender;
    }

    if (mine === 'true') {
      query.receiver = session.user.email;
    }

    const invoices = await coll
      .find(query)
      .sort({ addedAt: -1 })
      .limit(200)
      .toArray();

    // Convert _id to string
    const result = invoices.map((inv) => ({
      ...inv,
      _id: inv._id.toString(),
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error('GET /api/invoices error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
