import { dbc } from '@/lib/mongo';
import { ObjectId } from 'mongodb';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Calculate historical median temperatures for all time points in batch
 * @param article - The article number to analyze
 * @param currentProcessStartTime - Start time of the current process
 * @param oven - The oven identifier for filtering (optional optimization)
 * @returns Map of relative time (in minutes) to median temperature
 */
async function calculateAllHistoricalMedians(
  article: string,
  currentProcessStartTime: Date,
  oven?: string
): Promise<Map<number, number>> {
  try {
    const processCollection = await dbc('oven_processes');
    const tempCollection = await dbc('oven_temperature_logs');

    // Find all processes with the same article in the last 30 days (excluding current process)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const historicalProcessFilter: any = {
      article,
      startTime: {
        $gte: thirtyDaysAgo,
        $lt: currentProcessStartTime // Exclude current process
      },
      status: { $in: ['finished', 'running'] } // Only completed or active processes
    };

    // Optionally filter by oven for better performance and relevance
    if (oven) {
      historicalProcessFilter.oven = oven;
    }

    // SINGLE QUERY: Get all historical processes
    const historicalProcesses = await processCollection
      .find(historicalProcessFilter)
      .toArray();

    if (historicalProcesses.length === 0) {
      return new Map();
    }

    // SINGLE QUERY: Get all temperature logs for these historical processes
    const historicalProcessIds = historicalProcesses.map(p => new ObjectId(p._id.toString()));
    const historicalTempLogs = await tempCollection
      .find({
        processIds: { $in: historicalProcessIds }
      })
      .sort({ timestamp: 1 })
      .toArray();

    // IN-MEMORY PROCESSING: Group temperatures by relative time in minutes
    const temperaturesByMinute = new Map<number, number[]>();

    for (const log of historicalTempLogs) {
      // Find the process for this log to get start time
      const processId = log.processIds[0]; // Assuming single process per log
      const process = historicalProcesses.find(p =>
        p._id.toString() === processId.toString()
      );

      if (!process) continue;

      // Calculate relative time in minutes from process start
      const relativeTimeMs = log.timestamp.getTime() - process.startTime.getTime();
      const relativeTimeMinutes = Math.floor(relativeTimeMs / (60 * 1000)); // Round to nearest minute

      if (relativeTimeMinutes < 0) continue; // Skip invalid data

      // Use avgTemp if available, otherwise calculate from sensor data
      let temperature = log.avgTemp;
      if (!temperature && log.sensorData) {
        const sensorValues = Object.values(log.sensorData).filter(
          (value) => typeof value === 'number'
        ) as number[];
        if (sensorValues.length > 0) {
          temperature = sensorValues.reduce((acc, val) => acc + val, 0) / sensorValues.length;
        }
      }

      if (temperature) {
        if (!temperaturesByMinute.has(relativeTimeMinutes)) {
          temperaturesByMinute.set(relativeTimeMinutes, []);
        }
        temperaturesByMinute.get(relativeTimeMinutes)!.push(temperature);
      }
    }

    // Calculate medians for all time points
    const mediansByMinute = new Map<number, number>();
    for (const [minute, temperatures] of temperaturesByMinute) {
      if (temperatures.length > 0) {
        temperatures.sort((a, b) => a - b);
        const mid = Math.floor(temperatures.length / 2);
        const median = temperatures.length % 2 === 0
          ? (temperatures[mid - 1] + temperatures[mid]) / 2
          : temperatures[mid];

        mediansByMinute.set(minute, Math.round(median * 10) / 10); // Round to 1 decimal place
      }
    }

    return mediansByMinute;
  } catch (error) {
    console.error('Error calculating historical medians:', error);
    return new Map();
  }
}

/**
 * Get historical median for a specific relative time from pre-calculated data
 * @param historicalMedians - Pre-calculated medians map
 * @param relativeTimeMinutes - Target relative time in minutes
 * @returns Median temperature or null if no data
 */
function getHistoricalMedianAtTime(
  historicalMedians: Map<number, number>,
  relativeTimeMinutes: number
): number | null {
  const targetMinute = Math.floor(relativeTimeMinutes);
  return historicalMedians.get(targetMinute) || null;
}

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

    // Get current process information for historical median calculation
    let currentProcess = null;
    if (processId) {
      const processCollection = await dbc('oven_processes');
      currentProcess = await processCollection.findOne({
        _id: new ObjectId(processId)
      });
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

    // BATCH PROCESSING: Calculate all historical medians once before processing temperature logs
    let historicalMedians = new Map<number, number>();
    if (currentProcess && currentProcess.article) {
      historicalMedians = await calculateAllHistoricalMedians(
        currentProcess.article,
        currentProcess.startTime,
        currentProcess.oven
      );
    }

    // Process temperature data for charts (now without async operations)
    const chartData = temperatureLogs.map((log) => {
      // For backward compatibility with old data, calculate avgTemp if not present
      let avgTemp = log.avgTemp;

      if (!avgTemp) {
        // Fallback calculation for older records without outlier detection
        const sensorKeys = ['z0', 'z1', 'z2', 'z3'];
        const sensorValues = sensorKeys
          .map((key) => log.sensorData?.[key])
          .filter((value) => typeof value === 'number') as number[];

        avgTemp = sensorValues.length > 0
          ? Math.round(
              (sensorValues.reduce((acc, val) => acc + val, 0) /
                sensorValues.length) *
                10,
            ) / 10
          : null;
      }

      // Get pre-calculated historical median for this specific temperature point
      let historicalMedian: number | null = null;
      if (currentProcess && currentProcess.article) {
        // Calculate relative time in minutes from process start
        const relativeTimeMs = log.timestamp.getTime() - currentProcess.startTime.getTime();
        const relativeTimeMinutes = relativeTimeMs / (60 * 1000);

        if (relativeTimeMinutes >= 0) {
          historicalMedian = getHistoricalMedianAtTime(
            historicalMedians,
            relativeTimeMinutes
          );
        }
      }

      return {
        _id: log._id.toString(),
        processIds: log.processIds.map((id: any) => id.toString()),
        timestamp: log.timestamp,
        sensorData: log.sensorData || {},
        avgTemp, // This is now always the filtered average (excluding outliers)
        // Include outlier detection data if available
        outlierSensors: log.outlierSensors || [],
        medianTemp: log.medianTemp || null,
        hasOutliers: log.hasOutliers || false,
        // Add historical median for this specific time point
        historicalMedian,
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
