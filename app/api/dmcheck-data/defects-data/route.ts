import { dbc } from '@/lib/db/mongo';
import moment from 'moment';
import { NextResponse, type NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

// Query parameters and response times are in Poland local time
// Uses same conversion as excel/route.ts for consistency

// Helper function to format operator(s) - handles both string and array
function formatOperators(operator: string | string[] | undefined): string {
  if (!operator) return '';
  if (Array.isArray(operator)) {
    return operator.join(', ');
  }
  return operator;
}

// Convert UTC to Poland local time (same as excel/route.ts)
function convertToLocalTimeWithMoment(date: Date) {
  if (!date) return null;
  const offset = moment(date).utcOffset();
  const localDate = new Date(date);
  localDate.setMinutes(localDate.getMinutes() + offset);
  return localDate;
}

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const query: any = {};
  const andConditions: any[] = [];

  searchParams.forEach((value, key) => {
    if (key === 'from' || key === 'to') {
      // Date filters - convert Poland local time to UTC for MongoDB query
      if (!query.time) query.time = {};
      if (key === 'from') {
        const localDate = new Date(value);
        const offset = moment(localDate).utcOffset();
        const utcDate = new Date(localDate);
        utcDate.setMinutes(utcDate.getMinutes() - offset);
        query.time.$gte = utcDate;
      }
      if (key === 'to') {
        const localDate = new Date(value);
        const offset = moment(localDate).utcOffset();
        const utcDate = new Date(localDate);
        utcDate.setMinutes(utcDate.getMinutes() - offset);
        query.time.$lte = utcDate;
      }
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
          statusConditions.push({ status: 'defect' });
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

  // Add filter for defectKeys existence - only return scans with defects
  andConditions.push({
    defectKeys: { $exists: true, $ne: [], $nin: [null] },
  });

  // Add $and conditions if any exist
  if (andConditions.length > 0) {
    query.$and = andConditions;
  }

  try {
    const collScans = await dbc('dmcheck_scans');
    const collScansArchive = await dbc('dmcheck_scans_archive');
    const collDefects = await dbc('dmcheck_defects');

    // Fetch defects for translation
    const defects = await collDefects.find().toArray();
    const defectsMap = new Map(defects.map((d: any) => [d.key, d]));

    // Query main collection first
    let scans = await collScans
      .find(query)
      .sort({ _id: -1 })
      .limit(10000)
      .toArray();

    // If less than 10k, query archive to fill remaining
    if (scans.length < 10000) {
      const remainingLimit = 10000 - scans.length;
      const scansArchive = await collScansArchive
        .find(query)
        .sort({ _id: -1 })
        .limit(remainingLimit)
        .toArray();
      scans = [...scans, ...scansArchive];
    }

    // Flatten: one row per defect occurrence
    const flattenedDefects: any[] = [];

    scans.forEach((doc) => {
      if (!doc.defectKeys || doc.defectKeys.length === 0) return;

      doc.defectKeys.forEach((defectKey: string) => {
        const defect = defectsMap.get(defectKey);

        flattenedDefects.push({
          dmc: doc.dmc,
          time: convertToLocalTimeWithMoment(doc.time),
          workplace: doc.workplace?.toUpperCase() || '',
          article: doc.article,
          operator: formatOperators(doc.operator),
          status: doc.status,
          defect_key: defectKey,
          defect_pl: defect?.translations?.pl || defectKey,
          defect_de: defect?.translations?.de || defectKey,
          defect_en: defect?.translations?.en || defectKey,
        });
      });
    });

    return NextResponse.json(flattenedDefects, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('api/dmcheck-data/defects-data: ' + error);
    return NextResponse.json(
      { error: 'dmcheck-data/defects-data api' },
      { status: 503 },
    );
  }
}
