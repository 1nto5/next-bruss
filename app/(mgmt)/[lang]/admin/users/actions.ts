'use server';

import { auth } from '@/auth';
import { dbc } from '@/lib/mongo';
import { UserType } from '@/lib/types/user';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { ObjectId } from 'mongodb';
import { revalidateTag } from 'next/cache';
import { redirect } from 'next/navigation';

// export async function addUser(user: UserType) {
//   try {
//     const session = await auth();
//     if (!session || !(session.user?.roles ?? []).includes('admin')) {
//       redirect('/');
//     }

//     const collection = await dbc('users');

//     const exists = await collection.findOne({
//       email: user.email,
//     });

//     if (exists) {
//       return { error: 'exists' };
//     }

//     const email = session.user?.email;
//     if (!email) {
//       redirect('/auth');
//     }

//     user = { ...user };

//     const res = await collection.insertOne(user);
//     if (res) {
//       revalidateTag('users');
//       return { success: 'inserted' };
//     }
//   } catch (error) {
//     console.error(error);
//     throw new Error('An error occurred while saving the CAPA.');
//   }
// }

export async function saveUser(user: UserType) {
  try {
    const session = await auth();
    if (!session || !(session.user?.roles ?? []).includes('admin')) {
      redirect('/');
    }

    const collection = await dbc('users');

    const exists = await collection.findOne({
      _id: new ObjectId(user._id),
    });

    if (!exists) {
      return { error: 'not exists' };
    }

    const res = await collection.updateOne(
      { _id: new ObjectId(user._id) },
      { $set: { email: user.email, roles: user.roles } },
    );
    if (res) {
      revalidateTag('users');
      return { success: 'updated' };
    }
  } catch (error) {
    console.error(error);
    throw new Error('An error occurred while saving the user.');
  }
}

export async function getUser(userId: ObjectId): Promise<UserType | null> {
  try {
    const collection = await dbc('users');
    const user = await collection.findOne({
      _id: userId,
    });
    return user as UserType | null;
  } catch (error) {
    console.error(error);
    throw new Error('An error occurred while retrieving the user.');
  }
}

export async function deleteUser(userId: string) {
  try {
    const session = await auth();
    if (!session || !(session.user?.roles ?? []).includes('admin')) {
      redirect('/');
    }

    const collection = await dbc('users');

    const exists = await collection.findOne({ _id: new ObjectId(userId) });

    if (!exists) {
      return { error: 'not found' };
    }

    const res = await collection.deleteOne({ _id: new ObjectId(userId) });
    if (res) {
      revalidateTag('users');
      return { success: 'deleted' };
    }
  } catch (error) {
    console.error(error);
    throw new Error('An error occurred while deleting the user');
  }
}

export async function revalidateUsers() {
  revalidateTag('users');
}

export async function getResetPasswordLink(
  _id: string,
): Promise<{ status: string; resetUrl?: string; error?: any }> {
  try {
    const collection = await dbc('users');

    const existingUser = await collection.findOne({ _id: new ObjectId(_id) });
    if (!existingUser) {
      return { status: 'not exists' };
    }

    const resetToken = await crypto.randomBytes(32).toString('hex');
    const hashedToken = await bcrypt.hash(resetToken, 10);
    const tokenExpiry = Date.now() + 3600000 * 8;

    await collection.updateOne(
      { _id: new ObjectId(_id) },
      {
        $set: {
          passwordResetToken: hashedToken,
          passwordResetExpires: tokenExpiry,
        },
      },
    );

    const resetUrl = `${process.env.AUTH_URL}/auth/reset-password/${resetToken}`;

    return { status: 'success', resetUrl };
  } catch (error) {
    console.error(error);
    return { status: 'error', error };
  }
}
