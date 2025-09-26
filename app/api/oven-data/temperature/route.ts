import { dbc } from '@/lib/mongo';
import { ObjectId } from 'mongodb';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Filter outliers using Interquartile Range (IQR) method
 * @param values - Array of numerical values to filter
 * @param multiplier - IQR multiplier for outlier detection (default 1.5)
 * @returns Filtered array excluding outliers
 */
function filterOutliersIQR(values: number[], multiplier: number = 1.5): number[] {
  if (values.length < 4) return values; // Need minimum data for IQR

  const sorted = [...values].sort((a, b) => a - b);
  const q1Index = Math.floor(sorted.length * 0.25);
  const q3Index = Math.floor(sorted.length * 0.75);

  const Q1 = sorted[q1Index];
  const Q3 = sorted[q3Index];
  const IQR = Q3 - Q1;

  const lowerBound = Q1 - multiplier * IQR;
  const upperBound = Q3 + multiplier * IQR;

  return values.filter(v => v >= lowerBound && v <= upperBound);
}

/**
 * Calculate mean of an array of numbers
 */
function calculateMean(values: number[]): number {
  return values.reduce((sum, val) => sum + val, 0) / values.length;
}

/**
 * Calculate median of an array of numbers
 */
function calculateMedian(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
}

/**
 * Calculate historical statistics (both median and average) for all time points
 * Uses only properly filtered data from cron job (avgTemp/medianTemp)
 * @param article - The article number to analyze
 * @param currentProcessStartTime - Start time of the current process
 * @param oven - The oven identifier for filtering (optional optimization)
 * @returns Object with maps for medians and averages by relative time
 */
async function calculateHistoricalStatistics(
  article: string,
  currentProcessStartTime: Date,
  oven?: string
): Promise<{
  medians: Map<number, number>;
  averages: Map<number, number>;
}> {
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
      return { medians: new Map(), averages: new Map() };
    }

    // SINGLE QUERY: Get all temperature logs for these historical processes
    const historicalProcessIds = historicalProcesses.map(p => new ObjectId(p._id.toString()));
    const historicalTempLogs = await tempCollection
      .find({
        processIds: { $in: historicalProcessIds }
      })
      .sort({ timestamp: 1 })
      .toArray();

    // IN-MEMORY PROCESSING: Group statistics by relative time in minutes
    // Only use properly filtered data from cron job (no fallback)
    const statsByMinute = new Map<number, { averages: number[]; medians: number[] }>();

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

      // Only use pre-filtered data from cron job - no fallback to raw sensors
      const avgTemperature = log.avgTemp;
      const medianTemperature = log.medianTemp;

      // Skip records that don't have properly filtered data
      if (avgTemperature && medianTemperature) {
        if (!statsByMinute.has(relativeTimeMinutes)) {
          statsByMinute.set(relativeTimeMinutes, { averages: [], medians: [] });
        }
        statsByMinute.get(relativeTimeMinutes)!.averages.push(avgTemperature);
        statsByMinute.get(relativeTimeMinutes)!.medians.push(medianTemperature);
      }
    }

    // Calculate clean statistics with IQR filtering to remove temporal outliers
    const mediansByMinute = new Map<number, number>();
    const averagesByMinute = new Map<number, number>();

    for (const [minute, stats] of statsByMinute) {
      if (stats.averages.length > 0 && stats.medians.length > 0) {
        // Apply IQR filtering to remove extreme values (temporal outliers)
        const filteredAverages = filterOutliersIQR(stats.averages);
        const filteredMedians = filterOutliersIQR(stats.medians);

        if (filteredAverages.length > 0) {
          const cleanAverage = calculateMean(filteredAverages);
          averagesByMinute.set(minute, Math.round(cleanAverage * 10) / 10);
        }

        if (filteredMedians.length > 0) {
          const cleanMedian = calculateMedian(filteredMedians);
          mediansByMinute.set(minute, Math.round(cleanMedian * 10) / 10);
        }
      }
    }

    return { medians: mediansByMinute, averages: averagesByMinute };
  } catch (error) {
    console.error('Error calculating historical statistics:', error);
    return { medians: new Map(), averages: new Map() };
  }
}

/**
 * Get historical statistics for a specific relative time from pre-calculated data
 * @param historicalStats - Pre-calculated statistics object
 * @param relativeTimeMinutes - Target relative time in minutes
 * @returns Object with median and average temperatures or nulls if no data
 */
function getHistoricalStatsAtTime(
  historicalStats: { medians: Map<number, number>; averages: Map<number, number> },
  relativeTimeMinutes: number
): { median: number | null; average: number | null } {
  const targetMinute = Math.floor(relativeTimeMinutes);
  return {
    median: historicalStats.medians.get(targetMinute) || null,
    average: historicalStats.averages.get(targetMinute) || null
  };
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

    // BATCH PROCESSING: Calculate all historical statistics once before processing temperature logs
    let historicalStats = { medians: new Map<number, number>(), averages: new Map<number, number>() };
    if (currentProcess && currentProcess.article) {
      historicalStats = await calculateHistoricalStatistics(
        currentProcess.article,
        currentProcess.startTime,
        currentProcess.oven
      );
    }

    // Process temperature data for charts with temporal outlier detection
    const chartData = temperatureLogs.map((log) => {
      // Only use properly filtered data from cron job (no fallback)
      const avgTemp = log.avgTemp;
      const medianTemp = log.medianTemp;

      // Get historical statistics for this specific time point
      let historicalMedian: number | null = null;
      let historicalAverage: number | null = null;
      let isTemporalOutlier = false;

      if (currentProcess && currentProcess.article && avgTemp && medianTemp) {
        // Calculate relative time in minutes from process start
        const relativeTimeMs = log.timestamp.getTime() - currentProcess.startTime.getTime();
        const relativeTimeMinutes = relativeTimeMs / (60 * 1000);

        if (relativeTimeMinutes >= 0) {
          const historicalData = getHistoricalStatsAtTime(
            historicalStats,
            relativeTimeMinutes
          );

          historicalMedian = historicalData.median;
          historicalAverage = historicalData.average;

          // Detect temporal outliers: both average and median must deviate significantly
          if (historicalAverage && historicalMedian) {
            const avgDeviation = Math.abs(avgTemp - historicalAverage) / historicalAverage;
            const medDeviation = Math.abs(medianTemp - historicalMedian) / historicalMedian;

            // Mark as temporal outlier if BOTH deviate > 30%
            isTemporalOutlier = avgDeviation > 0.30 && medDeviation > 0.30;
          }
        }
      }

      return {
        _id: log._id.toString(),
        processIds: log.processIds.map((id: any) => id.toString()),
        timestamp: log.timestamp,
        sensorData: log.sensorData || {},
        avgTemp, // Filtered average from cron job (excluding sensor outliers)
        medianTemp, // Median from cron job
        // Include sensor-level outlier detection data
        outlierSensors: log.outlierSensors || [],
        hasOutliers: log.hasOutliers || false,
        // Add historical statistics for comparison
        historicalMedian,
        historicalAverage, // NEW: Historical 30-day average
        isTemporalOutlier, // NEW: Flag for temporal deviation
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
