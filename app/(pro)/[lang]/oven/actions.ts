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
 * Retrieves all oven processes for a specific oven
 * @param oven - The oven identifier (tem2, tem10, tem11, tem12, tem13, tem14, tem15, tem16, tem17)
 * @param includeConfig - This parameter is now deprecated - target values are saved directly in process
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

        // Calculate expected completion if we have target duration
        let expectedCompletion: Date | undefined;
        if (doc.targetDuration) {
          expectedCompletion = new Date(
            doc.startTime.getTime() + doc.targetDuration * 1000,
          );
        }

        return {
          id: doc._id.toString(),
          oven: doc.oven,
          article: doc.article || '',
          hydraBatch: doc.hydraBatch,
          operator: doc.operator,
          status: doc.status,
          startTime: doc.startTime,
          endTime: doc.endTime,
          lastAvgTemp,
          // Use saved target values from the process record
          targetTemp: doc.targetTemp,
          tempTolerance: doc.tempTolerance,
          targetDuration: doc.targetDuration,
          expectedCompletion,
        };
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

    // Fetch the configuration to save target values at time of creation
    let targetTemp: number | undefined;
    let tempTolerance: number | undefined;
    let targetDuration: number | undefined;

    try {
      const configResult = await fetchOvenProcessConfig(article);
      if ('success' in configResult && configResult.success) {
        const config = configResult.success;
        targetTemp = config.temp;
        tempTolerance = config.tempTolerance;
        targetDuration = config.duration;
      }
    } catch (configError) {
      console.error('Error fetching config for new process:', configError);
      // Continue without config - values will be undefined
    }

    // Create process with saved target values
    const newProcess = {
      oven,
      article,
      hydraBatch,
      operator: operator,
      status: 'running' as const,
      startTime: new Date(),
      endTime: null,
      // Save target values from config at time of creation
      targetTemp,
      tempTolerance,
      targetDuration,
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

    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    if (
      !lastTempLog ||
      !lastTempLog.sensorData ||
      lastTempLog.timestamp < fiveMinutesAgo
    ) {
      return { avgTemp: null };
    }
    // Only use the four main sensors: z0, z1, z2, z3
    const sensorKeys = ['z0', 'z1', 'z2', 'z3'];
    const sensorValues = sensorKeys
      .map((key) => lastTempLog.sensorData?.[key])
      .filter((value) => typeof value === 'number') as number[];
    if (sensorValues.length === 0) {
      return { avgTemp: null };
    }
    // Calculate average and round to one decimal place
    // The division by 10 is for rounding: (avg * 10) rounded, then divided by 10 gives one decimal place
    const sum = sensorValues.reduce((acc, val) => acc + val, 0);
    const avgTemp = Math.round((sum / sensorValues.length) * 10) / 10;
    return { avgTemp };
  } catch (error) {
    console.error('fetchOvenLastAvgTemp error:', error);
    return { error: 'fetchOvenLastAvgTemp server action error' };
  }
}
