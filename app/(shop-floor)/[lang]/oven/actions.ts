'use server';

// Database connection import - using custom dbc wrapper for MongoDB
import { dbc } from '@/lib/db/mongo';

// Type definitions
import { ObjectId } from 'mongodb';
import { OvenProcessType, OvenProgramConfigType } from './lib/types';
import {
  completeProcessSchema,
  loginType,
  startBatchSchemaServer,
} from './lib/zod';

/**
 * Authenticates users for inventory access
 * @param data - Login credentials including personal numbers only
 * @returns Success status with employee data or error message
 */
export async function login(data: loginType) {
  try {
    // Note: loginType is already validated by the client using zodResolver
    // but we could add server-side validation here as well if needed
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
    return { error: 'login error' };
  }
}

/**
 * Fetches oven process configuration for a specific article
 * First fetches the program number from oven_process_configs,
 * then fetches the actual program details from oven_program_configs
 * @param article - The article number to lookup
 * @returns Configuration data with program details or null if not found
 */
export async function fetchOvenProcessConfig(
  article: string,
): Promise<
  | { success: OvenProgramConfigType & { article: string } }
  | { error: string }
  | { success: null }
> {
  try {
    // First, get the program number for this article
    const processConfigCollection = await dbc('oven_process_configs');
    const processConfig = await processConfigCollection.findOne({ article });

    if (!processConfig) {
      return { success: null };
    }

    // Then, get the program details
    const programConfigCollection = await dbc('oven_program_configs');
    const programConfig = await programConfigCollection.findOne({
      program: processConfig.program,
    });

    if (!programConfig) {
      return { error: 'program not found' };
    }

    return {
      success: {
        id: programConfig._id.toString(),
        article: article,
        program: programConfig.program,
        temp: programConfig.temp,
        tempTolerance: programConfig.tempTolerance,
        duration: programConfig.duration,
        durationTolerance: programConfig.durationTolerance,
      },
    };
  } catch (error) {
    console.error(error);
    return { error: 'config error' };
  }
}

/**
 * Retrieves all oven processes for a specific oven
 * @param oven - The oven identifier (tem10, tem11, tem12, tem13, tem14, tem15, tem16, tem17)
 * @returns Array of processes or error message
 */
export async function fetchOvenProcesses(
  oven: string,
): Promise<{ success: OvenProcessType[] } | { error: string }> {
  try {
    const collection = await dbc('oven_processes');
    const processes = await collection
      .find({ oven, status: { $in: ['prepared', 'running'] } }) // Return prepared and running processes
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

        // Calculate isOverdue on server to avoid timezone issues
        let isOverdue = false;
        if (doc.startTime && doc.targetDuration) {
          const startTime = new Date(doc.startTime).getTime();
          const targetDurationMs = doc.targetDuration * 1000;
          const durationToleranceMs = (doc.durationTolerance || 0) * 1000;
          const overdueThreshold =
            startTime + targetDurationMs + durationToleranceMs;
          const currentTime = new Date().getTime();
          isOverdue = currentTime > overdueThreshold;
        }

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
          // Use saved target values from the process record
          targetTemp: doc.targetTemp,
          tempTolerance: doc.tempTolerance,
          targetDuration: doc.targetDuration,
          durationTolerance: doc.durationTolerance,
          isOverdue,
        };
      }),
    );
    return { success: sanitizedProcesses };
  } catch (error) {
    console.error(error);
    return { error: 'fetch error' };
  }
}

/**
 * Starts (creates if needed) an oven process
 * @param oven - The oven string (e.g., 'tem10')
 * @param article - Article number from scan (validated: exactly 5 digits)
 * @param hydraBatch - Batch number from scan (validated: exactly 10 characters)
 * @param operator - Array of operator identifiers (validated: at least one required)
 * @param selectedProgram - The program number selected for this oven
 * @returns Success status or error message (includes validation errors)
 */
export async function startOvenProcess(
  oven: string,
  article: string,
  hydraBatch: string,
  operator: string[],
  selectedProgram: number,
): Promise<{ error: string } | { success: boolean; processId: string }> {
  try {
    // Validate input data using ZOD schema
    const validationResult = startBatchSchemaServer.safeParse({
      scannedArticle: article,
      scannedBatch: hydraBatch,
    });

    if (!validationResult.success) {
      // Return generic validation error - if ZOD validation fails on server,
      // it indicates either malicious input or client-side validation bypass
      // All ZOD validation should be handled properly on the frontend
      return { error: 'validation failed' };
    }

    // Additional validation for operators array
    if (!operator || operator.length === 0) {
      return { error: 'no operator' };
    }

    // Validate article is configured for the selected program
    const processConfigCollection = await dbc('oven_process_configs');
    const processConfig = await processConfigCollection.findOne({ article });

    if (!processConfig) {
      return { error: 'article not configured' };
    }

    if (processConfig.program !== selectedProgram) {
      return { error: 'wrong program for article' };
    }

    const collection = await dbc('oven_processes');

    // Fetch the configuration to save target values at time of creation
    let targetTemp: number | undefined;
    let tempTolerance: number | undefined;
    let targetDuration: number | undefined;
    let durationTolerance: number | undefined;

    try {
      const configResult = await fetchOvenProcessConfig(article);
      if ('success' in configResult && configResult.success) {
        const config = configResult.success;
        targetTemp = config.temp;
        tempTolerance = config.tempTolerance;
        targetDuration = config.duration;
        durationTolerance = config.durationTolerance;
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
      startOperators: operator,
      endOperators: null,
      status: 'prepared' as const,
      startTime: new Date(),
      endTime: null,
      // Save target values from config at time of creation
      targetTemp,
      tempTolerance,
      targetDuration,
      durationTolerance,
    };

    try {
      const result = await collection.insertOne(newProcess);
      if (!result.insertedId) {
        return { error: 'not created' };
      }
      return { success: true, processId: result.insertedId.toString() };
    } catch (error) {
      // MongoDB duplicate key error code
      if ((error as { code?: number }).code === 11000) {
        return { error: 'duplicate batch' };
      }
      // Log error and return generic error message
      console.error('Database error:', error);
      return { error: 'database error' };
    }
  } catch (error) {
    console.error(error);
    return { error: 'start error' };
  }
}

/**
 * Deletes an oven process by changing status to 'deleted'
 * @param processId - The process ID to delete (validated: 24-character hex string)
 * @returns Success status or error message (includes validation errors)
 */
export async function deleteOvenProcess(
  processId: string,
): Promise<{ error: string } | { success: boolean }> {
  try {
    // Validate input data using ZOD schema
    const validationResult = completeProcessSchema.safeParse({
      processId,
      notes: undefined,
    });

    if (!validationResult.success) {
      // Return generic validation error - if ZOD validation fails on server,
      // it indicates either malicious input or client-side validation bypass
      // All ZOD validation should be handled properly on the frontend
      return { error: 'validation failed' };
    }

    const collection = await dbc('oven_processes');

    const result = await collection.updateOne(
      { _id: new ObjectId(processId) },
      {
        $set: {
          status: 'deleted',
          deletedAt: new Date(),
          updatedAt: new Date(),
        },
      },
    );

    if (result.modifiedCount > 0) {
      return { success: true };
    }

    return { error: 'not deleted' };
  } catch (error) {
    console.error(error);
    return { error: 'delete error' };
  }
}

/**
 * Completes an oven process
 * @param processId - The process ID to complete (validated: 24-character hex string)
 * @param endOperators - Array of operator identifiers who completed the process
 * @param notes - Optional completion notes
 * @returns Success status or error message (includes validation errors)
 */
export async function completeOvenProcess(
  processId: string,
  endOperators: string[],
  notes?: string,
): Promise<{ error: string } | { success: boolean }> {
  try {
    // Validate input data using ZOD schema
    const validationResult = completeProcessSchema.safeParse({
      processId,
      notes,
    });

    if (!validationResult.success) {
      // Return generic validation error - if ZOD validation fails on server,
      // it indicates either malicious input or client-side validation bypass
      // All ZOD validation should be handled properly on the frontend
      return { error: 'validation failed' };
    }

    // Additional validation for endOperators array
    if (!endOperators || endOperators.length === 0) {
      return { error: 'no operator' };
    }

    const collection = await dbc('oven_processes');

    const result = await collection.updateOne(
      { _id: new ObjectId(processId) },
      {
        $set: {
          status: 'finished', // match OvenProcessType
          endTime: new Date(),
          endOperators: endOperators,
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
    return { error: 'complete error' };
  }
}

/**
 * Fetches all available oven programs from the database
 * @returns Array of program numbers or error message
 */
export async function fetchOvenProgram(): Promise<
  { success: number[] } | { error: string }
> {
  try {
    const collection = await dbc('oven_program_configs');
    const programs = await collection
      .find({})
      .project({ program: 1 })
      .sort({ program: 1 })
      .toArray();

    const programNumbers = programs.map((p) => p.program);
    return { success: programNumbers };
  } catch (error) {
    console.error('fetchOvenProgram error:', error);
    return { error: 'programs fetch error' };
  }
}

/**
 * Fetches the active program for a given oven based on running processes
 * @param oven - The oven identifier
 * @returns { program: number | null } or { error: string }
 */
export async function fetchActiveOvenProgram(
  oven: string,
): Promise<{ program: number | null } | { error: string }> {
  try {
    const processCollection = await dbc('oven_processes');
    // Find running processes for this oven
    const runningProcess = await processCollection.findOne({
      oven,
      status: 'running',
    });

    if (!runningProcess || !runningProcess.article) {
      return { program: null };
    }

    // Get the program for this article
    const processConfigCollection = await dbc('oven_process_configs');
    const processConfig = await processConfigCollection.findOne({
      article: runningProcess.article,
    });

    if (!processConfig) {
      return { program: null };
    }

    return { program: processConfig.program };
  } catch (error) {
    console.error('fetchActiveOvenProgram error:', error);
    return { error: 'program fetch error' };
  }
}

/**
 * Completes all running oven processes for a specific oven
 * @param oven - The oven identifier
 * @param endOperators - Array of operator identifiers who completed the processes
 * @returns Success status with count or error message
 */
export async function completeAllOvenProcesses(
  oven: string,
  endOperators: string[],
): Promise<{
  success?: { count: number };
  error?: string;
}> {
  try {
    // Additional validation for endOperators array
    if (!endOperators || endOperators.length === 0) {
      return { error: 'no operator' };
    }

    const collection = await dbc('oven_processes');

    // Find all running processes for this oven
    const runningProcesses = await collection
      .find({ oven, status: 'running' })
      .toArray();

    if (runningProcesses.length === 0) {
      return { error: 'no running processes' };
    }

    // Complete all running processes
    const processIds = runningProcesses.map((p) => p._id);
    const result = await collection.updateMany(
      { _id: { $in: processIds } },
      {
        $set: {
          status: 'finished',
          endTime: new Date(),
          endOperators: endOperators,
          updatedAt: new Date(),
        },
      },
    );

    if (result.modifiedCount > 0) {
      return {
        success: {
          count: result.modifiedCount,
        },
      };
    }

    return { error: 'not completed' };
  } catch (error) {
    console.error('completeAllOvenProcesses error:', error);
    return { error: 'complete error' };
  }
}

/**
 * Fetches the latest average temperature for the currently running process in a given oven
 * Uses filtered average (excluding outlier sensors) when available, falls back to simple average for older data
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

    // Use filtered average if available (from outlier detection system)
    if (lastTempLog.avgTemp && typeof lastTempLog.avgTemp === 'number') {
      return { avgTemp: lastTempLog.avgTemp };
    }

    // Fallback to old calculation for backward compatibility with older data
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
    return { error: 'temp error' };
  }
}
