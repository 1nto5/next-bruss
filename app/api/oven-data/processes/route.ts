import { dbc } from '@/lib/mongo';
import { ObjectId } from 'mongodb';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Build filter object based on search parameters
    const filter: any = {};

    // Filter by oven
    const oven = searchParams.get('oven');
    if (oven) {
      filter.oven = oven;
    }

    // Filter by Hydra batch
    const hydraBatch = searchParams.get('hydra_batch');
    if (hydraBatch) {
      filter.hydraBatch = { $regex: hydraBatch, $options: 'i' };
    }

    // Filter by article
    const article = searchParams.get('article');
    if (article) {
      filter.article = { $regex: article, $options: 'i' };
    }

    // Filter by status
    const status = searchParams.get('status');
    if (status && (status === 'running' || status === 'finished')) {
      filter.status = status;
    }

    // Filter by time range
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

    // Get processes with sorting
    const processes = await collection
      .find(filter)
      .sort({ startTime: -1 })
      .limit(100) // Limit to 100 processes
      .toArray();

    // Calculate lastAvgTemp and duration for each process
    const enrichedProcesses = await Promise.all(
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

        return {
          id: doc._id.toString(),
          oven: doc.oven,
          article: doc.article || '',
          hydraBatch: doc.hydraBatch,
          startOperators: doc.startOperators || doc.operator || [], // Handle legacy data
          endOperators: doc.endOperators || undefined,
          status: doc.status,
          startTime: doc.startTime,
          endTime: doc.endTime,
          lastAvgTemp,
          duration,
          // Use saved target values from the process record
          targetTemp: doc.targetTemp,
          tempTolerance: doc.tempTolerance,
          targetDuration: doc.targetDuration,
        };
      }),
    );

    return NextResponse.json(enrichedProcesses);
  } catch (error) {
    console.error('Oven processes API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch oven processes' },
      { status: 500 },
    );
  }
}
