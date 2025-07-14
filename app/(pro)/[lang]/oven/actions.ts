'use server';

// Database connection import - using custom dbc wrapper for MongoDB
import { dbc } from '@/lib/mongo';

// Type definitions
import { OvenProcessType } from './lib/types';
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
 * Retrieves all oven processes for a specific oven
 * @param oven - The oven identifier (tem2, tem10, tem11, tem12, tem13, tem14, tem15, tem16, tem17)
 * @returns Array of processes or error message
 */
export async function fetchOvenProcesses(
  oven: string,
): Promise<{ success: OvenProcessType[] } | { error: string }> {
  try {
    const collection = await dbc('oven_processes');
    const processes = await collection
      .find({ oven })
      .sort({ startTime: -1 }) // Sort by startTime (existing field)
      .toArray();

    const sanitizedProcesses = processes.map((doc) => ({
      id: doc._id.toString(),
      oven: doc.oven ?? '',
      hydraBatch: doc.hydraBatch ?? '',
      operator: doc.operator ?? [],
      status: doc.status ?? 'running',
      startTime: doc.startTime ?? null,
      endTime: doc.endTime ?? null,
      temperatureLogs: doc.temperatureLogs ?? [],
    }));

    return { success: sanitizedProcesses };
  } catch (error) {
    console.error(error);
    return { error: 'fetchOvenProcesses server action error' };
  }
}

/**
 * Starts (creates if needed) an oven process
 * @param oven - The oven string (e.g., 'tem10')
 * @param hydraBatch - Batch number from scan
 * @param operator - Array of operator identifiers
 * @returns Success status or error message
 */
export async function startOvenProcess(
  oven: string,
  hydraBatch: string,
  operator: string[],
): Promise<{ error: string } | { success: boolean; processId: string }> {
  try {
    const collection = await dbc('oven_processes');

    // Option A: Atomic insert with unique index (recommended)
    // The unique index on {oven: 1, hydraBatch: 1} will prevent duplicates
    const newProcess = {
      oven,
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
    const { ObjectId } = await import('mongodb');

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
