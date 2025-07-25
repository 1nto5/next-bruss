import { dbc } from '@/lib/mongo';
import { ObjectId } from 'mongodb';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Get process IDs or filter parameters
    const processId = searchParams.get('process_id');
    const oven = searchParams.get('oven');
    const hydraBatch = searchParams.get('hydra_batch');
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    let processIds: ObjectId[] = [];

    if (processId) {
      // Single process temperature data
      processIds = [new ObjectId(processId)];
    } else {
      // Find processes based on filters
      const processCollection = await dbc('oven_processes');
      const processFilter: any = {};

      if (oven) processFilter.oven = oven;
      if (hydraBatch) processFilter.hydraBatch = hydraBatch;
      if (from || to) {
        processFilter.startTime = {};
        if (from) processFilter.startTime.$gte = new Date(from);
        if (to) processFilter.startTime.$lte = new Date(to);
      }

      const processes = await processCollection
        .find(processFilter)
        .sort({ startTime: -1 })
        .limit(10) // Limit number of processes for temperature data (keep lower for performance)
        .toArray();

      processIds = processes.map((p: any) => new ObjectId(p._id.toString()));
    }

    if (processIds.length === 0) {
      return NextResponse.json([]);
    }

    // Get temperature logs
    const tempCollection = await dbc('oven_temperature_logs');
    const tempFilter: any = {
      processIds: { $in: processIds },
    };

    // Additional time filtering for temperature logs
    if (from || to) {
      tempFilter.timestamp = {};
      if (from) tempFilter.timestamp.$gte = new Date(from);
      if (to) tempFilter.timestamp.$lte = new Date(to);
    }

    const temperatureLogs = await tempCollection
      .find(tempFilter)
      .sort({ timestamp: 1 })
      .limit(1000) // Support for long processes: 12h@1min = 720 readings, with safety margin
      .toArray();

    // Process temperature data for charts
    const chartData = temperatureLogs.map((log) => {
      // Only use the four main sensors: z0, z1, z2, z3
      const sensorKeys = ['z0', 'z1', 'z2', 'z3'];
      const sensorValues = sensorKeys
        .map((key) => log.sensorData?.[key])
        .filter((value) => typeof value === 'number') as number[];

      // Calculate average and round to one decimal place
      // The division by 10 is for rounding: (avg * 10) rounded, then divided by 10 gives one decimal place
      const avgTemp =
        sensorValues.length > 0
          ? Math.round(
              (sensorValues.reduce((acc, val) => acc + val, 0) /
                sensorValues.length) *
                10,
            ) / 10
          : null;

      return {
        _id: log._id.toString(),
        processIds: log.processIds.map((id: any) => id.toString()),
        timestamp: log.timestamp,
        sensorData: log.sensorData || {},
        avgTemp,
      };
    });

    return NextResponse.json(chartData);
  } catch (error) {
    console.error('Oven temperature API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch oven temperature data' },
      { status: 500 },
    );
  }
}
