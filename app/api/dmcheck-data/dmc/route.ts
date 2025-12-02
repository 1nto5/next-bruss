import { dbc } from '@/lib/db/mongo';
import { NextResponse, type NextRequest } from 'next/server';

// https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config
// https://nextjs.org/docs/app/building-your-application/caching#on-demand-revalidation
// https://nextjs.org/docs/app/api-reference/functions/revalidateTag
export const dynamic = 'force-dynamic';
// 'auto' | 'force-dynamic' | 'error' | 'force-static'

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const query: any = {};
  const andConditions: any[] = [];

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
      // Handle multiple values separated by commas - OR within field, AND between fields
      const values = value
        .split(',')
        .map((v) => v.trim())
        .filter((v) => v.length > 0);

      if (values.length > 0) {
        // Ensure field exists and is not empty
        andConditions.push({
          [key]: { $exists: true, $nin: [null, ''] },
        });

        if (values.length === 1) {
          // Single value - use exact match
          andConditions.push({
            [key]: values[0],
          });
        } else {
          // Multiple values - use $in for exact matches
          andConditions.push({
            [key]: { $in: values },
          });
        }
      }
    } else if (key === 'status' || key === 'workplace' || key === 'article') {
      // Handle multi-select filters - OR within field, AND between fields
      const values = value
        .split(',')
        .map((v) => v.trim())
        .filter((v) => v.length > 0);

      if (key === 'status' && (values.includes('rework') || values.includes('defect'))) {
        // Handle rework and defect special cases
        const otherStatuses = values.filter((v) => v !== 'rework' && v !== 'defect');
        const statusConditions = [];

        if (otherStatuses.length > 0) {
          statusConditions.push({ status: { $in: otherStatuses } });
        }

        if (values.includes('rework')) {
          statusConditions.push({ status: { $regex: /^rework\d*$/ } });
        }

        if (values.includes('defect')) {
          statusConditions.push({ status: { $regex: /^defect\d*$/ } });
        }

        if (statusConditions.length === 1) {
          Object.assign(query, statusConditions[0]);
        } else {
          query.$or = statusConditions;
        }
      } else if (values.length === 1) {
        // Single value
        query[key] = values[0];
      } else if (values.length > 1) {
        // Multiple values - use $in for OR within field
        query[key] = { $in: values };
      }
    }
  });

  // Add $and conditions if any exist
  if (andConditions.length > 0) {
    query.$and = andConditions;
  }

  try {
    const coll = await dbc('dmcheck_scans');
    let scans = await coll.find(query).sort({ _id: -1 }).limit(1000).toArray();

    if (scans.length < 1000) {
      const archiveColl = await dbc('dmcheck_scans_archive');
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
