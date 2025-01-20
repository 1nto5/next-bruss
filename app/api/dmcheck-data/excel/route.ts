import { dbc } from '@/lib/mongo';
import { formatInTimeZone } from 'date-fns-tz';
import { Workbook } from 'exceljs';
import { NextRequest, NextResponse } from 'next/server';
export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const query: any = {};

  const lang = searchParams.get('lang');
  searchParams.delete('lang');

  searchParams.forEach((value, key) => {
    if (key === 'from' || key === 'to') {
      if (!query.time) query.time = {};
      if (key === 'from') query.time.$gte = new Date(value);
      if (key === 'to') query.time.$lte = new Date(value);
    } else {
      query[key] = value;
    }
  });

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
      { header: 'Time (UTC)', key: 'time', width: 18 },
      { header: 'Article', key: 'article', width: 10 },
      { header: 'Operator', key: 'operator', width: 8 },
      { header: 'Workplace', key: 'workplace', width: 15 },
      { header: 'Hydra batch', key: 'hydra_batch', width: 18 },
      { header: 'Hydra time (UTC)', key: 'hydra_time', width: 18 },
      { header: 'Pallet batch', key: 'pallet_batch', width: 18 },
      { header: 'Pallet time (UTC)', key: 'pallet_time', width: 18 },
    ];

    scans.forEach((doc) => {
      const row = {
        _id: doc._id.toString(),
        status: doc.status,
        dmc: doc.dmc,
        workplace: doc.workplace.toUpperCase(),
        type: doc.type,
        article: doc.article,
        operator: doc.operator,
        time: new Date(doc.time),
        hydra_batch: doc.hydra_batch,
        hydra_time: doc.hydra_time ? new Date(doc.hydra_time) : '',
        pallet_batch: doc.pallet_batch,
        pallet_time: doc.pallet_time ? new Date(doc.pallet_time) : '',
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
