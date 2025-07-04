'use server';

import { dbc } from '@/lib/mongo';
import { ObjectId } from 'mongodb';
import { processType } from './lib/types';
import { loginOvenType } from './lib/zod';

export async function operatorsLogin(data: loginOvenType) {
  try {
    const collection = await dbc('employees');
    const operator1 = await collection.findOne({
      identifier: data.code1,
    });
    if (!operator1) {
      return { error: 'wrong code 1' };
    }

    let operator2;
    if (data.code2) {
      operator2 = await collection.findOne({
        identifier: data.code2,
      });
      if (!operator2) {
        return { error: 'wrong code 2' };
      }
    }

    let operator3;
    if (data.code3) {
      operator3 = await collection.findOne({
        identifier: data.code3,
      });
      if (!operator3) {
        return { error: 'wrong code 3' };
      }
    }

    const result: any = {
      success: true,
      operator1: { code: data.code1, name: operator1.name },
    };

    if (operator2) {
      result.operator2 = { code: data.code2, name: operator2.name };
    }
    if (operator3) {
      result.operator3 = { code: data.code3, name: operator3.name };
    }

    return result;
  } catch (error) {
    console.error(error);
    return { error: 'login server action error' };
  }
}

export async function fetchOvenProcesses(): Promise<processType[]> {
  const collection = await dbc('oven_processes');
  const documents = await collection
    .find()
    .sort({ createdAt: -1 })
    .limit(50)
    .toArray();

  return documents.map((doc) => ({
    ...doc,
    _id: doc._id.toString(),
  })) as processType[];
}

export async function fetchOvenConfigs(configFiltr: string) {
  const collection = await dbc('oven_configs');
  const query = configFiltr
    ? {
        $or: [
          { articleNumber: { $regex: configFiltr, $options: 'i' } },
          { articleName: { $regex: configFiltr, $options: 'i' } },
        ],
      }
    : {};
  const configs = await collection.find(query).toArray();
  const sanitizedConfigs = configs.map(({ _id, ...rest }) => rest);
  return sanitizedConfigs;
}

export async function findOvenProcessConfig(search: string) {
  try {
    const coll = await dbc('oven_configs');
    const results = await coll
      .find({
        $or: [
          { articleNumber: { $regex: search, $options: 'i' } },
          { articleName: { $regex: search, $options: 'i' } },
        ],
      })
      .toArray();

    // Sprawdzenie liczby wyników
    if (results.length === 0) {
      return { error: 'no articles' };
    }

    if (results.length > 10) {
      return { error: 'too many articles' };
    }
    const sanitizedResults = results.map(({ _id, ...rest }) => rest);
    return { success: sanitizedResults };
  } catch (error) {
    console.error(error);
    return { error: 'findArticles server action error' };
  }
}

export async function insertOvenProcess(ovenProcessData: {
  articleNumber: string;
  articleName: string;
  temp: number;
  ovenTime: number;
  ovenNumber: number;
  operators: string[]; // TODO: add operators from state
}) {
  try {
    const collection = await dbc('oven_processes');
    const process = {
      ...ovenProcessData,
      plannedProcessEndTimeAt: new Date(
        new Date().getTime() + ovenProcessData.ovenTime * 1000,
      ),
      startProcessAt: new Date(),
      updatedAt: new Date(),
    };
    const res = await collection.insertOne(process);
    if (res) {
      return { success: 'inserted' };
    } else {
      return { error: 'not inserted' };
    }
  } catch (error) {
    console.error(error);
    return { error: 'insertDeviation server action error' };
  }
}

export async function terminateOvenProcess(processId: string) {
  try {
    const collection = await dbc('oven_processes');
    const res = await collection.updateOne(
      { _id: new ObjectId(processId) },
      {
        $set: {
          terminatedAt: new Date(),
          updatedAt: new Date(),
        },
      },
    );

    if (res.matchedCount > 0) {
      return { success: 'terminated' };
    }
    return { error: 'not found' };
  } catch (error) {
    console.error(error);
    return { error: 'terminateOvenProcess server action error' };
  }
}
