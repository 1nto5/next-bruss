import { dbc } from '@/lib/mongo';
import { NextResponse, type NextRequest } from 'next/server';

// https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config
// https://nextjs.org/docs/app/building-your-application/caching#on-demand-revalidation
// https://nextjs.org/docs/app/api-reference/functions/revalidateTag
export const dynamic = 'force-dynamic';
// 'auto' | 'force-dynamic' | 'error' | 'force-static'

export async function GET(req: NextRequest) {
  try {
    const coll = await dbc('inventory_cards');
    const deviations = await coll
      .find({})
      .sort({ _id: -1 })
      .limit(100)
      .toArray();
    return new NextResponse(JSON.stringify(deviations));
  } catch (error) {
    console.error('api/deviations/get-deviations: ' + error);
    return NextResponse.json({ error: 'get-deviations api' }, { status: 503 });
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
