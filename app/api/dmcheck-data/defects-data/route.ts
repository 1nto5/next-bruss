import { dbc } from '@/lib/db/mongo';
import moment from 'moment';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// TODO: TEMPORARY OPTIMIZATION - Remove after ~6 months (mid-2026)
// Defect reporting started November 2025. This date clamp prevents
// unnecessary archive queries while defect data is still new.
// Once sufficient defect history exists, remove this logic entirely.
const DEFECT_REPORTING_START = new Date('2025-11-01T00:00:00.000Z');
const ARCHIVE_DAYS = 90; // 3 * 30 days, matches archive-scans.js in bruss-cron

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

export async function GET() {
  const query = {
    time: { $gte: DEFECT_REPORTING_START },
  };

  // Skip archive if query date is within archive threshold
  const archiveThreshold = new Date(Date.now() - ARCHIVE_DAYS * 24 * 60 * 60 * 1000);
  const skipArchive = DEFECT_REPORTING_START >= archiveThreshold;

  try {
    const collScans = await dbc('dmcheck_scans');
    const collDefects = await dbc('dmcheck_defects');

    // Fetch defects for translation
    const defects = await collDefects.find().toArray();
    const defectsMap = new Map(defects.map((d: any) => [d.key, d]));

    // Query main collection
    let scans = await collScans.find(query).sort({ _id: -1 }).toArray();

    // Query archive if not skipped
    if (!skipArchive) {
      const collScansArchive = await dbc('dmcheck_scans_archive');
      const scansArchive = await collScansArchive
        .find(query)
        .sort({ _id: -1 })
        .toArray();
      scans = [...scans, ...scansArchive];
    }

    // Flatten: one row per defect occurrence, or single row if no defects
    const flattenedDefects: any[] = [];

    scans.forEach((doc) => {
      const defectKeysList = doc.defectKeys?.length ? doc.defectKeys : [null];

      defectKeysList.forEach((defectKey: string | null) => {
        const defect = defectKey ? defectsMap.get(defectKey) : null;

        flattenedDefects.push({
          dmc: doc.dmc,
          time: convertToLocalTimeWithMoment(doc.time),
          workplace: doc.workplace?.toUpperCase() || '',
          article: doc.article,
          operator: formatOperators(doc.operator),
          status: doc.status,
          defect_key: defectKey || '',
          defect_pl: defect?.translations?.pl || '',
          defect_de: defect?.translations?.de || '',
          defect_en: defect?.translations?.en || '',
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
