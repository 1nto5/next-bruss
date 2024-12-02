'use server';

import { dbc } from '@/lib/mongo';

type ArticleConfig = {
  firstName: string;
  lastName: string;
  loginCode: string;
  password?: string;
};

export async function savePersonConfig({
  firstName,
  lastName,
  loginCode,
  password,
}: ArticleConfig) {
  try {
    const collection = await dbc('persons');
    let exists;
    exists = await collection.findOne({
      personalNumber: loginCode,
    });
    if (exists) {
      return { error: 'exists' };
    }

    // Ensure the first letter of firstName and lastName is capitalized and the rest are lowercase
    const formattedFirstName =
      firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();
    const formattedLastName =
      lastName.charAt(0).toUpperCase() + lastName.slice(1).toLowerCase();

    const user: { name: string; personalNumber: string; password?: string } = {
      name: formattedFirstName + ' ' + formattedLastName,
      personalNumber: loginCode,
    };

    if (password) {
      user.password = password;
    }

    const res = await collection.insertOne(user);
    if (res) return { success: 'inserted' };
  } catch (error) {
    console.error(error);
    throw new Error('An error occurred while saving person config!');
  }
}
