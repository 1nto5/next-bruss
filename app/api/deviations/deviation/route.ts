import { dbc } from '@/lib/mongo';
import { ObjectId } from 'mongodb';
import { NextResponse, type NextRequest } from 'next/server';

// https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config
// https://nextjs.org/docs/app/building-your-application/caching#on-demand-revalidation
// https://nextjs.org/docs/app/api-reference/functions/revalidateTag
export const dynamic = 'force-dynamic';
// 'auto' | 'force-dynamic' | 'error' | 'force-static'

export async function GET(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get('id');
    if (!id) {
      return NextResponse.json(
        { error: 'get-deviation api: missing id' },
        { status: 400 },
      );
    }

    // Check if ID is a valid MongoDB ObjectId (24 hex characters)
    const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(id);
    if (!isValidObjectId) {
      return NextResponse.json(
        { error: 'Invalid ObjectId format' },
        { status: 404 },
      );
    }
    const coll = await dbc('deviations');
    const deviation = await coll.findOne({
      _id: new ObjectId(id),
    });
    if (!deviation) {
      return NextResponse.json(
        { error: 'Deviation not found' },
        { status: 404 },
      );
    }
    // return new NextResponse(JSON.stringify(deviation));
    return NextResponse.json(deviation);
  } catch (error) {
    console.error('api/deviations/deviation: ' + error);
    return NextResponse.json({ error: 'get-deviation api' }, { status: 503 });
  }
}

// export async function GET(req: NextRequest) {
//   try {
//     const coll = await dbc('deviations');
//     const deviations = await coll.find({}).sort({ _id: -1 }).toArray();
//     return new Promise((resolve, reject) => {
//       setTimeout(() => {
//         resolve(new NextResponse(JSON.stringify(deviations)));
//       }, 2500); // 5 seconds timeout
//     });
//   } catch (error) {
//     console.error('api/deviations/get-reasons: ' + error);
//     return new NextResponse('get-deviations api error', { status: 503 });
//   }
// }
