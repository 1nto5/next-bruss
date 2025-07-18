'use server';

// Database connection import - using custom dbc wrapper for MongoDB
import { dbc } from '@/lib/mongo';

// Type definitions
import { ObjectId } from 'mongodb';
import { OvenProcessConfigType, OvenProcessType } from './lib/types';
import { loginType } from './lib/zod';

/**
 * Authenticates users for inventory access
 * @param data - Login credentials including personal numbers only
 * @returns Success status with employee data or error message
 */
export async function login(data: loginType) {
  try {
    const collection = await dbc('employees');
    let operator1 = null;
    let operator2 = null;
    let operator3 = null;

    const person1 = await collection.findOne({
      identifier: data.identifier1,
    });
    if (!person1) {
      return { error: 'wrong number 1' };
    }
    operator1 = {
      identifier: person1.identifier,
      firstName: person1.firstName,
      lastName: person1.lastName,
    };

    if (data.identifier2) {
      const person2 = await collection.findOne({
        identifier: data.identifier2,
      });
      if (!person2) {
        return { error: 'wrong number 2' };
      }
      operator2 = {
        identifier: person2.identifier,
        firstName: person2.firstName,
        lastName: person2.lastName,
      };
    }

    if (data.identifier3) {
      const person3 = await collection.findOne({
        identifier: data.identifier3,
      });
      if (!person3) {
        return { error: 'wrong number 3' };
      }
      operator3 = {
        identifier: person3.identifier,
        firstName: person3.firstName,
        lastName: person3.lastName,
      };
    }

    return {
      success: true,
      operator1,
      operator2,
      operator3,
    };
  } catch (error) {
    console.error(error);
    return { error: 'login server action error' };
  }
}

/**
 * Fetches oven process configuration for a specific article
 * @param article - The article number to lookup
 * @returns Configuration data or null if not found
 */
export async function fetchOvenProcessConfig(
  article: string,
): Promise<
  { success: OvenProcessConfigType } | { error: string } | { success: null }
> {
  try {
    const collection = await dbc('oven_process_configs');
    const config = await collection.findOne({ article });

    if (!config) {
      return { success: null };
    }

    return {
      success: {
        id: config._id.toString(),
        article: config.article,
        temp: config.temp,
        tempTolerance: config.tempTolerance,
        duration: config.duration,
      },
    };
  } catch (error) {
    console.error(error);
    return { error: 'fetchOvenProcessConfig server action error' };
  }
}

/**
 * Retrieves all oven processes for a specific oven with optional config data
 * @param oven - The oven identifier (tem2, tem10, tem11, tem12, tem13, tem14, tem15, tem16, tem17)
 * @param includeConfig - Whether to include configuration data from oven_process_configs
 * @returns Array of processes or error message
 */
export async function fetchOvenProcesses(
  oven: string,
  includeConfig = false,
): Promise<{ success: OvenProcessType[] } | { error: string }> {
  try {
    const collection = await dbc('oven_processes');
    const processes = await collection
      .find({ oven })
      .sort({ startTime: -1 }) // Sort by startTime (existing field)
      .toArray();

    // Calculate lastAvgTemp for each process
    const sanitizedProcesses = await Promise.all(
      processes.map(async (doc) => {
        let lastAvgTemp = null;
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

        const baseProcess = {
          id: doc._id.toString(),
          oven: doc.oven,
          article: doc.article || '', // Add article to returned process
          hydraBatch: doc.hydraBatch,
          operator: doc.operator,
          status: doc.status,
          startTime: doc.startTime,
          endTime: doc.endTime,
          lastAvgTemp,
        };

        // Optionally fetch and include config data
        if (includeConfig && doc.article) {
          try {
            const configResult = await fetchOvenProcessConfig(doc.article);
            if ('success' in configResult && configResult.success) {
              const config = configResult.success;
              const expectedCompletion = new Date(
                doc.startTime.getTime() + config.duration * 1000,
              );

              return {
                ...baseProcess,
                config: {
                  temp: config.temp,
                  tempTolerance: config.tempTolerance,
                  duration: config.duration,
                  expectedCompletion,
                },
              };
            }
          } catch (configError) {
            console.error(
              'Error fetching config for article:',
              doc.article,
              configError,
            );
          }
        }

        return baseProcess;
      }),
    );
    return { success: sanitizedProcesses };
  } catch (error) {
    console.error(error);
    return { error: 'fetchOvenProcesses server action error' };
  }
}

/**
 * Starts (creates if needed) an oven process
 * @param oven - The oven string (e.g., 'tem10')
 * @param article - Article number from scan
 * @param hydraBatch - Batch number from scan
 * @param operator - Array of operator identifiers
 * @returns Success status or error message
 */
export async function startOvenProcess(
  oven: string,
  article: string,
  hydraBatch: string,
  operator: string[],
): Promise<{ error: string } | { success: boolean; processId: string }> {
  try {
    const collection = await dbc('oven_processes');

    // Option A: Atomic insert with unique index (recommended)
    // The unique index on {oven: 1, hydraBatch: 1} will prevent duplicates
    const newProcess = {
      oven,
      article, // Store article
      hydraBatch,
      operator: operator,
      status: 'running' as const,
      startTime: new Date(),
      endTime: null,
    };

    try {
      const result = await collection.insertOne(newProcess);
      if (!result.insertedId) {
        return { error: 'not created' };
      }
      return { success: true, processId: result.insertedId.toString() };
    } catch (error: any) {
      // MongoDB duplicate key error code
      if (error.code === 11000) {
        console.log('duplicate batch');
        return { error: 'duplicate batch' };
      }
      throw error; // Re-throw other errors
    }

    // Option B: Using upsert with specific conditions (alternative)
    // Uncomment this section if you prefer upsert approach:
    /*
    const result = await collection.updateOne(
      { 
        oven, 
        hydraBatch,
        status: { $ne: 'finished' } // Only upsert if no active process exists
      },
      {
                 $setOnInsert: {
           oven,
           hydraBatch,
           operator: operator,
           status: 'running',
           startTime: new Date(),
           endTime: null,
         }
      },
      { upsert: true }
    );

    if (result.upsertedId) {
      return { success: true, processId: result.upsertedId.toString() };
    } else if (result.matchedCount > 0) {
      return { error: 'duplicate batch' };
    } else {
      return { error: 'not created' };
    }
    */
  } catch (error) {
    console.error(error);
    return { error: 'startOvenProcess server action error' };
  }
}

/**
 * Completes an oven process
 * @param processId - The process ID to complete
 * @param notes - Optional completion notes
 * @returns Success status or error message
 */
export async function completeOvenProcess(
  processId: string,
  notes?: string,
): Promise<{ error: string } | { success: boolean }> {
  try {
    const collection = await dbc('oven_processes');

    const result = await collection.updateOne(
      { _id: new ObjectId(processId) },
      {
        $set: {
          status: 'finished', // match OvenProcessType
          endTime: new Date(),
          updatedAt: new Date(),
        },
      },
    );

    if (result.modifiedCount > 0) {
      return { success: true };
    }

    return { error: 'not completed' };
  } catch (error) {
    console.error(error);
    return { error: 'completeOvenProcess server action error' };
  }
}

/**
 * Fetches the latest average temperature for the currently running process in a given oven
 * @param oven - The oven identifier
 * @returns { avgTemp: number | null } or { error: string }
 */
export async function fetchOvenLastAvgTemp(
  oven: string,
): Promise<{ avgTemp: number | null } | { error: string }> {
  try {
    const processCollection = await dbc('oven_processes');
    // Find the latest running process for the oven
    const runningProcess = await processCollection
      .find({ oven, status: 'running' })
      .sort({ startTime: -1 })
      .limit(1)
      .next();
    if (!runningProcess) {
      return { avgTemp: null };
    }
    const tempLogsCollection = await dbc('oven_temperature_logs');
    // Find the latest temperature log for this process
    const lastTempLog = await tempLogsCollection
      .find({ processIds: new ObjectId(runningProcess._id.toString()) })
      .sort({ timestamp: -1 })
      .limit(1)
      .next();
    if (!lastTempLog || !lastTempLog.sensorData) {
      console.log('no last temp log');
      return { avgTemp: null };
    }
    const sensorValues = Object.values(lastTempLog.sensorData).filter(
      (value) => typeof value === 'number',
    );
    if (sensorValues.length === 0) {
      return { avgTemp: null };
    }
    const sum = sensorValues.reduce((acc, val) => acc + val, 0);
    const avgTemp = Math.round((sum / sensorValues.length) * 10) / 10;
    return { avgTemp };
  } catch (error) {
    console.error('fetchOvenLastAvgTemp error:', error);
    return { error: 'fetchOvenLastAvgTemp server action error' };
  }
}
