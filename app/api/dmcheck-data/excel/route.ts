import { dbc } from '@/lib/mongo';
import { Workbook } from 'exceljs';
import moment from 'moment';
import { NextRequest, NextResponse } from 'next/server';

// Helper function to format operator(s) - handles both string and array
function formatOperators(operator: string | string[] | undefined): string {
  if (!operator) return '';
  if (Array.isArray(operator)) {
    return operator.join(', ');
  }
  return operator;
}

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

      if (values.length === 1) {
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
    const collScans = await dbc('scans');
    const collScansArchive = await dbc('scans_archive');
    let scans = await collScans
      .find(query)
      .sort({ _id: -1 })
      .limit(10000)
      .toArray();

    if (scans.length < 10000) {
      const remainingLimit = 10000 - scans.length;
      const scansArchive = await collScansArchive
        .find(query)
        .sort({ _id: -1 })
        .limit(remainingLimit)
        .toArray();
      scans = [...scans, ...scansArchive];
    }

    const workbook = new Workbook();
    const sheet = workbook.addWorksheet('dmc');

    sheet.columns = [
      { header: 'ID', key: '_id', width: 24, hidden: true },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'DMC', key: 'dmc', width: 36 },
      { header: 'Time', key: 'time', width: 18 },
      { header: 'Article', key: 'article', width: 10 },
      { header: 'Operator', key: 'operator', width: 20 },
      { header: 'Workplace', key: 'workplace', width: 15 },
      { header: 'Hydra batch', key: 'hydra_batch', width: 18 },
      { header: 'Hydra operator', key: 'hydra_operator', width: 20 },
      { header: 'Hydra time', key: 'hydra_time', width: 18 },
      { header: 'Pallet batch', key: 'pallet_batch', width: 18 },
      { header: 'Pallet operator', key: 'pallet_operator', width: 20 },
      { header: 'Pallet time', key: 'pallet_time', width: 18 },
      { header: 'Rework reason', key: 'rework_reason', width: 30 },
      { header: 'Rework user', key: 'rework_user', width: 20 },
      { header: 'Rework time', key: 'rework_time', width: 18 },
    ];

    const convertToLocalTimeWithMoment = (date: Date) => {
      if (!date) return null;
      const offset = moment(date).utcOffset();
      const localDate = new Date(date);
      localDate.setMinutes(localDate.getMinutes() + offset);
      return localDate;
    };

    scans.forEach((doc) => {
      const row = {
        _id: doc._id.toString(),
        status: doc.status,
        dmc: doc.dmc,
        workplace: doc.workplace.toUpperCase(),
        type: doc.type,
        article: doc.article,
        operator: formatOperators(doc.operator),
        time: convertToLocalTimeWithMoment(new Date(doc.time)),
        hydra_batch: doc.hydra_batch,
        hydra_operator: formatOperators(doc.hydra_operator),
        hydra_time: doc.hydra_time
          ? convertToLocalTimeWithMoment(new Date(doc.hydra_time))
          : '',
        pallet_batch: doc.pallet_batch,
        pallet_operator: formatOperators(doc.pallet_operator),
        pallet_time: doc.pallet_time
          ? convertToLocalTimeWithMoment(new Date(doc.pallet_time))
          : '',
        rework_reason: doc.rework_reason || '',
        rework_user: doc.rework_user || '',
        rework_time: doc.rework_time
          ? convertToLocalTimeWithMoment(new Date(doc.rework_time))
          : '',
      };
      sheet.addRow(row);
    });

    const buffer = await workbook.xlsx.writeBuffer();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="DMCheck-data.xlsx"',
      },
    });
  } catch (error) {
    console.error('Error generating Excel file:', error);
    return NextResponse.json({ error: 'scans/excel api' }, { status: 503 });
  }
}
