'use server';

import { dbc } from '@/lib/mongo';
import { loginOvenType } from './lib/zod';

export async function login(data: loginOvenType) {
  try {
    const collection = await dbc('persons');
    console.log(data);
    const person1 = await collection.findOne({
      personalNumber: data.code1,
    });
    if (!person1) {
      return { error: 'wrong code 1' };
    }

    if (data.code2) {
      const person2 = await collection.findOne({
        personalNumber: data.code2,
      });
      if (!person2) {
        return { error: 'wrong code 2' };
      }
    }

    if (data.code3) {
      const person3 = await collection.findOne({
        personalNumber: data.code3,
      });
      if (!person3) {
        return { error: 'wrong code 3' };
      }
    }
    return {
      success: true,
    };
  } catch (error) {
    console.error(error);
    return { error: 'login server action error' };
  }
}

export async function fetchOvenProcesses() {
  const collection = await dbc('oven_processes');
  const processes = await collection
    .find()
    .sort({ createdAt: -1 })
    .limit(50)
    .toArray();
  return processes;
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

    if (results.length > 5) {
      return { error: 'too many articles' };
    }
    const sanitizedResults = results.map(({ _id, ...rest }) => rest);
    return { success: sanitizedResults };
  } catch (error) {
    console.error(error);
    return { error: 'findArticles server action error' };
  }
}

// TODO: add type
export async function insertOvenProcess(ovenProcessSelectedArticle: {
  articleNumber: string;
  articleName: string;
  temp: number;
  ovenTime: number;
}) {
  try {
    const collection = await dbc('oven_processes');
    const process = {
      ...ovenProcessSelectedArticle,
      endTime: new Date(
        new Date().getTime() + ovenProcessSelectedArticle.ovenTime,
      ),
      createdAt: new Date(),
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
