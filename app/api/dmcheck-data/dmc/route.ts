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
  const orConditions: any[] = [];

  searchParams.forEach((value, key) => {
    if (key === 'from' || key === 'to') {
      // Date filters remain as AND conditions (time range)
      if (!query.time) query.time = {};
      if (key === 'from') query.time.$gte = new Date(value);
      if (key === 'to') query.time.$lte = new Date(value);
    } else if (
      key === 'dmc' ||
      key === 'hydra_batch' ||
      key === 'pallet_batch'
    ) {
      // Handle multiple values separated by commas - each value becomes a separate OR condition
      const values = value
        .split(',')
        .map((v) => v.trim())
        .filter((v) => v.length > 0);
      
      // Add each individual value as a separate OR condition
      values.forEach((val) => {
        orConditions.push({ [key]: { $regex: new RegExp(val, 'i') } });
      });
    } else if (key === 'status' || key === 'workplace' || key === 'article') {
      // Handle multi-select filters - each value becomes a separate OR condition
      const values = value
        .split(',')
        .map((v) => v.trim())
        .filter((v) => v.length > 0);
      
      // Add each individual value as a separate OR condition
      values.forEach((val) => {
        orConditions.push({ [key]: val });
      });
    }
  });

  // Build final query with OR logic for filter conditions
  if (orConditions.length > 0) {
    if (orConditions.length === 1) {
      // Single condition - add directly to query
      Object.assign(query, orConditions[0]);
    } else {
      // Multiple conditions - use $or
      query.$or = orConditions;
    }
  }

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
