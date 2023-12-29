'use server';

import clientPromise from '@/lib/mongo';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

const collectionName = 'users';

export async function register(email: string, password: string) {
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

export async function resetPassword(email: string) {
  try {
    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection(collectionName);

    // Checking if a user with the given email already exists
    const existingUser = await collection.findOne({ email });
    if (!existingUser) {
      return { status: 'not exists' };
    }

    const resetToken = await crypto.randomBytes(32).toString('hex');
    const hashedToken = await bcrypt.hash(resetToken, 10);
    const tokenExpiry = Date.now() + 3600000;

    const resetUrl = `${process.env.URL}/${resetToken}`;
    console.log(resetUrl);

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.NODEMAILER_EMAIL,
        pass: process.env.NODEMAILER_PASSSWORD,
      },
    });
    try {
      const send = await transporter.sendMail({
        from: '"Message bot"<your@gmail.com>', // sender address
        to: email, // list of receivers
        subject: `Message from`, // Subject line
        text: resetUrl, // plain text body
        html: 'test', // html body
      });
      console.log(send);
      return { status: 'sent' };
    } catch (err) {
      console.log(err);
      return { status: 'error' };
    }
  } catch (error) {
    console.error(error);
    throw new Error('An error occurred while registering.');
  }
}
