import type { NextRequest } from 'next/server';
import { Workbook } from 'exceljs';
import clientPromise from '@/lib/mongo';
import moment from 'moment';
import 'moment-timezone';

type RequestBody = {
  workplace?: string;
  article?: string;
  status?: string;
  timeFrom?: Date;
  timeTo?: Date;
  searchTerm?: string;
};

type TimeQuery = {
  $gte?: Date;
  $lte?: Date;
};

export async function POST(req: NextRequest) {
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ message: 'Only POST requests allowed' }),
      {
        status: 405,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }

  const body: RequestBody = await req.json();

  try {
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection('scans');

    // Build your query based on the request body
    const timeQuery: TimeQuery = {};
    if (body.timeFrom) timeQuery['$gte'] = body.timeFrom;
    if (body.timeTo) timeQuery['$lte'] = body.timeTo;

    const query = {
      ...(body.workplace && { workplace: body.workplace }),
      ...(body.article && { article: body.article }),
      ...(body.status && { status: body.status }),
      ...(Object.keys(timeQuery).length && { time: timeQuery }),
      ...(body.searchTerm && {
        $or: [
          { dmc: { $regex: body.searchTerm, $options: 'i' } },
          { hydra_batch: { $regex: body.searchTerm, $options: 'i' } },
          { pallet_batch: { $regex: body.searchTerm, $options: 'i' } },
        ],
      }),
    };

    const data = await collection.find(query).toArray();
    const workbook = new Workbook();
    const sheet = workbook.addWorksheet('Scans');

    sheet.columns = [
      { header: 'ID', key: '_id', width: 10, hidden: true },
      { header: 'Stanowisko', key: 'workplace', width: 10 },
      { header: 'Artykuł', key: 'article', width: 10 },
      { header: 'Status', key: 'status', width: 18 },
      { header: 'DMC', key: 'dmc', width: 30 },
      { header: 'Operator', key: 'operator', width: 12 }, // TODO: with name from db
      { header: 'Data', key: 'time', width: 12 },
      { header: 'Hydra Batch', key: 'hydra_batch', width: 15 },
      { header: 'Hydra Data', key: 'hydra_time', width: 12 },
      { header: 'Hydra Operator', key: 'hydra_operator', width: 12 },
      { header: 'Paleta Batch', key: 'pallet_batch', width: 15 },
      { header: 'Paleta Operator', key: 'pallet_operator', width: 12 },
      { header: 'Paleta Data', key: 'pallet_time', width: 12 },
    ];

    data.forEach((item) => {
      const convertToLocalTimeWithMoment = (date: Date) => {
        if (!date) return null;
        const offset = moment(date).tz('Europe/Warsaw').utcOffset();
        const localDate = new Date(date);
        localDate.setMinutes(localDate.getMinutes() + offset);
        return localDate;
      };

      const row = {
        ...item,
        _id: item._id.toString(),
        workplace: item.workplace.toUpperCase(),
        status:
          item.status === 'box'
            ? 'podczas pakowania'
            : item.status === 'pallet'
            ? 'na palecie'
            : 'na magazynie',
        time: item.time
          ? convertToLocalTimeWithMoment(new Date(item.time))
          : null,
        hydra_time: item.hydra_time
          ? convertToLocalTimeWithMoment(new Date(item.hydra_time))
          : null,
        pallet_time: item.pallet_time
          ? convertToLocalTimeWithMoment(new Date(item.pallet_time))
          : null,
      };

      sheet.addRow(row);
    });
    const buffer = await workbook.xlsx.writeBuffer();

    return new Response(buffer, {
      status: 200,
      headers: {
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename=data.xlsx',
      },
    });
  } catch (error) {
    console.error('Error generating Excel file:', error);
    return new Response(
      JSON.stringify({ message: 'Error generating Excel file' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }
}
