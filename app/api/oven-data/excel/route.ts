import { dbc } from '@/lib/mongo';
import { ObjectId } from 'mongodb';
import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Build filter object based on search parameters (same as processes API)
    const filter: any = {};

    const oven = searchParams.get('oven');
    if (oven) {
      filter.oven = oven;
    }

    const hydraBatch = searchParams.get('hydra_batch');
    if (hydraBatch) {
      filter.hydraBatch = { $regex: hydraBatch, $options: 'i' };
    }

    const article = searchParams.get('article');
    if (article) {
      filter.article = { $regex: article, $options: 'i' };
    }

    const status = searchParams.get('status');
    if (status && (status === 'running' || status === 'finished')) {
      filter.status = status;
    }

    const from = searchParams.get('from');
    const to = searchParams.get('to');
    if (from || to) {
      filter.startTime = {};
      if (from) {
        filter.startTime.$gte = new Date(from);
      }
      if (to) {
        filter.startTime.$lte = new Date(to);
      }
    }

    const collection = await dbc('oven_processes');

    const processes = await collection
      .find(filter)
      .sort({ startTime: -1 })
      .limit(100) // Limit to 100 processes
      .toArray();

    // Process data for Excel export
    const excelData = await Promise.all(
      processes.map(async (doc) => {
        let lastAvgTemp = null;
        let duration = null;

        // Calculate duration for finished processes
        if (doc.status === 'finished' && doc.endTime) {
          duration = Math.round(
            (doc.endTime.getTime() - doc.startTime.getTime()) / 1000,
          );
        }

        // Get latest temperature
        try {
          const tempLogsCollection = await dbc('oven_temperature_logs');
          const lastTempLog = await tempLogsCollection
            .find({ processIds: new ObjectId(doc._id.toString()) })
            .sort({ timestamp: -1 })
            .limit(1)
            .next();

          if (lastTempLog && lastTempLog.sensorData) {
            const sensorValues = Object.values(lastTempLog.sensorData).filter(
              (value) => typeof value === 'number',
            );
            if (sensorValues.length > 0) {
              const sum = sensorValues.reduce((acc, val) => acc + val, 0);
              lastAvgTemp = Math.round((sum / sensorValues.length) * 10) / 10;
            }
          }
        } catch (tempError) {
          console.error('Error calculating lastAvgTemp:', tempError);
        }

        // Note: expectedCompletion is now calculated on the frontend to handle timezone correctly

        // Format duration for Excel
        const formatDuration = (seconds: number | null) => {
          if (!seconds) return '';
          const hours = Math.floor(seconds / 3600);
          const minutes = Math.floor((seconds % 3600) / 60);
          return `${hours}h ${minutes}m`;
        };

        return {
          'Oven': doc.oven,
          'Status': doc.status,
          'Article': doc.article || '',
          'Hydra Batch': doc.hydraBatch,
          'Operators': Array.isArray(doc.operator)
            ? doc.operator.join(', ')
            : '',
          'Start Time': doc.startTime.toLocaleString(),
          'End Time': doc.endTime ? doc.endTime.toLocaleString() : '',
          'Duration': formatDuration(duration),
          'Last Temperature (°C)': lastAvgTemp || '',
          'Target Temperature (°C)': doc.targetTemp || '',
          'Temperature Tolerance (°C)': doc.tempTolerance || '',
          'Expected Duration (s)': doc.targetDuration || '',
        };
      }),
    );

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(excelData);

    // Set column widths
    const colWidths = [
      { wch: 10 }, // Oven
      { wch: 10 }, // Status
      { wch: 15 }, // Article
      { wch: 20 }, // Hydra Batch
      { wch: 20 }, // Operators
      { wch: 20 }, // Start Time
      { wch: 20 }, // End Time
      { wch: 12 }, // Duration
      { wch: 18 }, // Last Temperature
      { wch: 18 }, // Target Temperature
      { wch: 20 }, // Temperature Tolerance
      { wch: 18 }, // Expected Duration
    ];
    worksheet['!cols'] = colWidths;

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Oven Data');

    // Generate Excel file
    const excelBuffer = XLSX.write(workbook, {
      type: 'buffer',
      bookType: 'xlsx',
    });

    // Create filename with timestamp
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    const filename = `oven-data-${timestamp}.xlsx`;

    // Return Excel file
    return new NextResponse(excelBuffer, {
      headers: {
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Oven data Excel export error:', error);
    return NextResponse.json(
      { error: 'Failed to export oven data to Excel' },
      { status: 500 },
    );
  }
}
