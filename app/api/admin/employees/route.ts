import { dbc } from '@/lib/db/mongo';
import { NextResponse, type NextRequest } from 'next/server';

// https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config
// https://nextjs.org/docs/app/building-your-application/caching#on-demand-revalidation
// https://nextjs.org/docs/app/api-reference/functions/revalidateTag
export const dynamic = 'force-dynamic';
// 'auto' | 'force-dynamic' | 'error' | 'force-static'

export async function GET(req: NextRequest) {
  try {
    const coll = await dbc('employees');
    const persons = await coll
      .find({})
      .sort({ firstName: 1, lastName: 1 })
      .toArray();
    return new NextResponse(JSON.stringify(persons));
  } catch (error) {
    console.error('api/admin/employees: ' + error);
    return NextResponse.json({ error: 'admin/employees api' }, { status: 503 });
  }
}
