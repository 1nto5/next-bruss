import { dbc } from '@/lib/mongo';
import { Workbook } from 'exceljs';
import moment from 'moment';
import { NextRequest, NextResponse } from 'next/server';

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
      { header: 'Operator', key: 'operator', width: 8 },
      { header: 'Workplace', key: 'workplace', width: 15 },
      { header: 'Hydra batch', key: 'hydra_batch', width: 18 },
      { header: 'Hydra time', key: 'hydra_time', width: 18 },
      { header: 'Pallet batch', key: 'pallet_batch', width: 18 },
      { header: 'Pallet time', key: 'pallet_time', width: 18 },
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
        operator: doc.operator,
        time: convertToLocalTimeWithMoment(new Date(doc.time)),
        hydra_batch: doc.hydra_batch,
        hydra_time: doc.hydra_time
          ? convertToLocalTimeWithMoment(new Date(doc.hydra_time))
          : '',
        pallet_batch: doc.pallet_batch,
        pallet_time: doc.pallet_time
          ? convertToLocalTimeWithMoment(new Date(doc.pallet_time))
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
