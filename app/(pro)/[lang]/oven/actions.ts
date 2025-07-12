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
    const operators: Array<{
      personalNumber: string;
      firstName: string;
      lastName: string;
    }> = [];

    const person1 = await collection.findOne({
      identifier: data.personalNumber1,
    });
    if (!person1) {
      return { error: 'wrong number 1' };
    }
    operators.push({
      personalNumber: person1.identifier,
      firstName: person1.firstName,
      lastName: person1.lastName,
    });

    if (data.personalNumber2) {
      const person2 = await collection.findOne({
        identifier: data.personalNumber2,
      });
      if (!person2) {
        return { error: 'wrong number 2' };
      }
      operators.push({
        personalNumber: person2.identifier,
        firstName: person2.firstName,
        lastName: person2.lastName,
      });
    }

    if (data.personalNumber3) {
      const person3 = await collection.findOne({
        identifier: data.personalNumber3,
      });
      if (!person3) {
        return { error: 'wrong number 3' };
      }
      operators.push({
        personalNumber: person3.identifier,
        firstName: person3.firstName,
        lastName: person3.lastName,
      });
    }

    return {
      success: true,
      operators,
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
      .sort({ createdAt: -1 })
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
) {
  try {
    const collection = await dbc('oven_processes');

    // Prevent duplicate batch for the same oven
    const duplicate = await collection.findOne({ oven, hydraBatch });
    if (duplicate) {
      return { error: 'duplicate batch' };
    }

    // Check if a process already exists for this oven and batch
    // (This block is now unreachable, but kept for clarity)
    // let process = await collection.findOne({
    //   oven,
    //   hydra_batch,
    //   status: { $in: ['pending', 'running'] },
    // });

    // let processId;
    // if (!process) {
    // Create the process if it doesn't exist
    const newProcess = {
      oven,
      hydraBatch,
      operator: operator,
      status: 'running',
      startTime: new Date(),
      endTime: null,
    };
    const result = await collection.insertOne(newProcess);
    if (!result.insertedId) {
      return { error: 'not created' };
    }
    const processId = result.insertedId;
    return { success: true, processId: processId.toString() };
    // } else {
    //   // If process exists, update it to running
    //   processId = process._id;
    //   const updateResult = await collection.updateOne(
    //     { _id: processId },
    //     {
    //       $set: {
    //         status: 'running',
    //         startTime: new Date(),
    //         updatedAt: new Date(),
    //       },
    //     },
    //   );
    //   if (updateResult.modifiedCount === 0) {
    //     return { error: 'not started' };
    //   }
    // }
    // return { success: true, processId: processId.toString() };
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
export async function completeOvenProcess(processId: string, notes?: string) {
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
