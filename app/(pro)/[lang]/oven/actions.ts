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

export async function fetchOvenConfigs() {
  const collection = await dbc('oven_configs');
  const configs = await collection.find().toArray();
  return configs;
}
