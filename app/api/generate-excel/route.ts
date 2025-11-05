import clientPromise from '@/lib/db/mongo';
import { Workbook } from 'exceljs';
import moment from 'moment';
import 'moment-timezone';
import { NextRequest, NextResponse } from 'next/server';

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
    return new NextResponse(
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

    const timeQuery: TimeQuery = {};
    if (body.timeFrom) timeQuery['$gte'] = new Date(body.timeFrom);
    if (body.timeTo) timeQuery['$lte'] = new Date(body.timeTo);

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

    const collection = db.collection('dmcheck_scans');
    const archiveCollection = db.collection('dmcheck_scans_archive');

    let data = await collection.find(query).limit(100000).toArray();

    if (data.length < 100000) {
      const dataFromArchive = await archiveCollection
        .find(query)
        .limit(100000 - data.length)
        .toArray();
      data = [...data, ...dataFromArchive];
    }

    const workbook = new Workbook();
    const sheet = workbook.addWorksheet('Scans');

    sheet.columns = [
      { header: 'ID', key: '_id', width: 10, hidden: true },
      { header: 'Workplace', key: 'workplace', width: 10 },
      { header: 'Typ', key: 'type', width: 10 },
      { header: 'Article', key: 'article', width: 10 },
      { header: 'Status', key: 'status', width: 18 },
      { header: 'DMC', key: 'dmc', width: 30 },
      { header: 'Operator', key: 'operator', width: 12 },
      { header: 'Date', key: 'time', width: 12 },
      { header: 'Hydra batch', key: 'hydra_batch', width: 15 },
      { header: 'Hydra date', key: 'hydra_time', width: 12 },
      { header: 'Hydra operator', key: 'hydra_operator', width: 12 },
      { header: 'Paleta batch', key: 'pallet_batch', width: 15 },
      { header: 'Paleta operator', key: 'pallet_operator', width: 12 },
      { header: 'Paleta date', key: 'pallet_time', width: 12 },
      { header: 'Rework date', key: 'rework_time', width: 12 },
      { header: 'Rework reason', key: 'rework_reason', width: 30 },
      { header: 'Rework user', key: 'rework_user', width: 12 },
      { header: 'Archived', key: 'archive', width: 12 },
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
        type: item.type ? item.type.toUpperCase() : '',
        time: item.time
          ? convertToLocalTimeWithMoment(new Date(item.time))
          : '',
        hydra_time: item.hydra_time
          ? convertToLocalTimeWithMoment(new Date(item.hydra_time))
          : '',
        pallet_time: item.pallet_time
          ? convertToLocalTimeWithMoment(new Date(item.pallet_time))
          : '',
        rework_time: item.rework_time
          ? convertToLocalTimeWithMoment(new Date(item.rework_time))
          : '',
        archive: item.archive ? 'x' : '',
      };

      sheet.addRow(row);
    });
    const buffer = await workbook.xlsx.writeBuffer();

    return new NextResponse(buffer, {
      status: 200,
    });
  } catch (error) {
    console.error('Error generating Excel file:', error);
    return new NextResponse(
      JSON.stringify({ message: 'Error generating Excel file' }),
      {
        status: 500,
      },
    );
  }
}
