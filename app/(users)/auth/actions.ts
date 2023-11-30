'use server';

import clientPromise from '@/lib/mongo';
import bcrypt from 'bcryptjs';

const collectionName = 'users';

function isValidPassword(password: string): boolean {
  const hasMinLength = password.length >= 6;
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(
    password,
  );
  const hasNumber = /\d/.test(password);

  return hasMinLength && hasSpecialChar && hasNumber;
}

export async function Register(email: string, password: string) {
  try {
    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection(collectionName);

    // Checking if a user with the given email already exists
    const existingUser = await collection.findOne({ email });
    if (existingUser) {
      return { status: 'exists' };
    }

    if (!isValidPassword(password)) {
      return { status: 'wrong password' };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Saving the user in the database
    const result = await collection.insertOne({
      email,
      password: hashedPassword,
      roles: ['user'],
    });

    if (result.insertedId) {
      return { status: 'registered' };
    } else {
      return { status: 'error' };
      throw new Error('Failed to register the user.');
    }
  } catch (error) {
    console.error(error);
    throw new Error('An error occurred while registering.');
  }
}
