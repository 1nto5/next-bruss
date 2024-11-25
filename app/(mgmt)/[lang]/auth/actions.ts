'use server';

import { auth, signIn, signOut } from '@/auth';
import clientPromise from '@/lib/mongo';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
// import { AuthError } from 'next-auth';

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

    await collection.updateOne(
      { email },
      {
        $set: {
          passwordResetToken: hashedToken,
          passwordResetExpires: tokenExpiry,
        },
      },
    );

    const resetUrl = `${process.env.URL}/auth/reset-password/${resetToken}`;
    console.log(resetUrl);

    //TODO: change to bruss exchange

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

export async function setNewPassword(
  resetToken: string,
  password: string,
  confirmPassword: string,
) {
  try {
    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection(collectionName);

    // Find the user with the reset token and check if it's still valid
    const user = await collection.findOne({
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return { status: 'token expired or not found' };
    }

    // Compare the provided token with the hashed token in the database
    const isMatch = await bcrypt.compare(resetToken, user.passwordResetToken);

    if (!isMatch) {
      return { status: 'token does not match' };
    }

    // Check if the passwords match
    if (password !== confirmPassword) {
      return { status: 'passwords do not match' };
    }

    // Hash the new password and update the user document
    const hashedPassword = await bcrypt.hash(password, 10);
    await collection.updateOne(
      { _id: user._id },
      {
        $set: {
          password: hashedPassword,
          passwordResetToken: undefined,
          passwordResetExpires: undefined,
        },
      },
    );

    return { status: 'password updated' };
  } catch (error) {
    console.error(error);
    return { error: error };
  }
}

export async function findToken(token: string) {
  try {
    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection(collectionName);

    // Find the user with the reset token and check if it's still valid
    const user = await collection.findOne({
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return { status: 'token expired or not found' };
    }

    // Compare the provided token with the hashed token in the database
    const isMatch = await bcrypt.compare(token, user.passwordResetToken);

    if (!isMatch) {
      return { status: 'not match' };
    }

    return { status: 'found' };
  } catch (error) {
    console.error(error);
    return { error: error };
  }
}

export async function logout() {
  await signOut();
}

// 500 internal server error while wrong credientials, fallowing function helps but login doesn't work properly (first time gives error)
// export async function login(email: string, password: string) {
//   try {
//     const success = await signIn('credentials', { email, password });
//     return undefined;
//   } catch (error) {
//     if (error instanceof Error) {
//       const { type, cause } = error as AuthError;
//       switch (type) {
//         case 'CredentialsSignin':
//           return 'invalid';
//         case 'CallbackRouteError':
//           return cause?.err?.toString();
//         default:
//           return 'Something went wrong.';
//       }
//     }

//     throw error;
//   }
// }

export async function login(email: string, password: string) {
  const res = await signIn('credentials', {
    email,
    password,
    // redirect: false,
  });
  console.log('res: ', res);
}

export async function getSession() {
  const session = await auth();
  return session;
}
