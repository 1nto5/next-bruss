import { dbc } from '@/lib/mongo';
import { Workbook } from 'exceljs';
import moment from 'moment-timezone';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const coll = await dbc('failures_lv');
    const failures = await coll
      .find({})
      .sort({ _id: -1 })
      .limit(1000)
      .toArray();

    const workbook = new Workbook();
    const sheet = workbook.addWorksheet('Failures LV');

    sheet.columns = [
      { header: 'ID', key: '_id', width: 24, hidden: true },
      { header: 'Line', key: 'line', width: 10 },
      { header: 'Station', key: 'station', width: 15 },
      { header: 'Failure', key: 'failure', width: 30 },
      { header: 'From', key: 'from', width: 12 },
      { header: 'To', key: 'to', width: 12 },
      { header: 'Supervisor', key: 'supervisor', width: 15 },
      { header: 'Responsible', key: 'responsible', width: 15 },
      { header: 'Solution', key: 'solution', width: 30 },
      { header: 'Comment', key: 'comment', width: 30 },
      { header: 'Created At', key: 'createdAt', width: 12 },
      { header: 'Updated At', key: 'updatedAt', width: 12 },
    ];

    const convertToLocalTimeWithMoment = (date: Date) => {
      if (!date) return null;
      const offset = moment(date).tz('Europe/Warsaw').utcOffset();
      const localDate = new Date(date);
      localDate.setMinutes(localDate.getMinutes() + offset);
      return localDate;
    };

    failures.forEach((failure) => {
      const row = {
        _id: failure._id.toString(),
        line: failure.line,
        station: failure.station,
        failure: failure.failure,
        from: failure.from
          ? convertToLocalTimeWithMoment(new Date(failure.from))
          : '',
        to: failure.to
          ? convertToLocalTimeWithMoment(new Date(failure.to))
          : '',
        supervisor: failure.supervisor,
        responsible: failure.responsible,
        solution: failure.solution,
        comment: failure.comment,
        createdAt: failure.createdAt
          ? convertToLocalTimeWithMoment(new Date(failure.createdAt))
          : '',
        updatedAt: failure.updatedAt
          ? convertToLocalTimeWithMoment(new Date(failure.updatedAt))
          : '',
      };
      sheet.addRow(row);
    });

    // Tworzenie pliku Excel w pamięci
    const buffer = await workbook.xlsx.writeBuffer();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="failures-lv.xlsx"',
      },
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
