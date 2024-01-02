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
      return { error: 'user not added' };
    }
  } catch (error) {
    console.error(error);
    return { error: error };
  }
}

export async function sentResetPasswordEmail(email: string) {
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

    const resetUrl = `${process.env.URL}/auth/reset-password/${resetToken}`;
    console.log(resetUrl);

    const transporter = nodemailer.createTransport({
      service: process.env.NODEMAILER_SERVICE,
      host: process.env.NODEMAILER_HOST,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.NODEMAILER_EMAIL,
        pass: process.env.NODEMAILER_PASSSWORD,
      },
    });

    // const transporter = nodemailer.createTransport({
    //   host: process.env.NODEMAILER_HOST,
    //   port: 587,
    //   secure: false, // use TLS
    //   auth: {
    //     user: process.env.NODEMAILER_USER,
    //     pass: process.env.NODEMAILER_PASSSWORD,
    //   },
    //   tls: {
    //     ciphers: 'SSLv3',
    //     rejectUnauthorized: false, // do not fail on invalid certs
    //   },
    // });

    console.log(transporter);
    try {
      const send = await transporter.sendMail({
        from: '"Next BRUSS"<your@gmail.com>', // sender address
        to: email, // list of receivers
        subject: `Reset hasła dla konta: ${email}`, // Subject line
        text: resetUrl, // plain text body
        html: `
          <h1>Resetowanie hasła</h1>
          <p>Aby zresetować hasło, kliknij w poniższy link:</p>
          <a href="${resetUrl}">Resetuj hasło</a>
        `, // html body
      });
      return { status: 'sent' };
    } catch (err) {
      console.log(err);
      return { error: err };
    }
  } catch (error) {
    console.error(error);
    return { error: error };
  }
}
