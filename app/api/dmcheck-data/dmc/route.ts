import { dbc } from '@/lib/mongo';
import { NextResponse, type NextRequest } from 'next/server';

// https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config
// https://nextjs.org/docs/app/building-your-application/caching#on-demand-revalidation
// https://nextjs.org/docs/app/api-reference/functions/revalidateTag
export const dynamic = 'force-dynamic';
// 'auto' | 'force-dynamic' | 'error' | 'force-static'

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const query: any = {};

  searchParams.forEach((value, key) => {
    if (key === 'from' || key === 'to') {
      if (!query.time) query.time = {};
      if (key === 'from') query.time.$gte = new Date(value);
      if (key === 'to') query.time.$lte = new Date(value);
    } else if (
      key === 'dmc' ||
      key === 'hydra_batch' ||
      key === 'pallet_batch'
    ) {
      query[key] = { $regex: new RegExp(value, 'i') };
    } else {
      query[key] = value;
    }
  });

  try {
    const coll = await dbc('scans');
    let scans = await coll.find(query).sort({ _id: -1 }).limit(1000).toArray();

    if (scans.length < 1000) {
      const archiveColl = await dbc('scans_archive');
      const archiveScans = await archiveColl
        .find(query)
        .sort({ _id: -1 })
        .limit(1000 - scans.length)
        .toArray();
      scans = scans.concat(archiveScans).slice(0, 1000);
    }

    return new NextResponse(JSON.stringify(scans));
  } catch (error) {
    console.error('api/dmcheck-data/dmc: ' + error);
    return NextResponse.json(
      { error: 'dmcheck-data/dmc api' },
      { status: 503 },
    );
  }
}
