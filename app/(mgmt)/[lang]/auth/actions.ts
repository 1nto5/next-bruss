'use server';

import { auth, signIn, signOut } from '@/auth';
import { AuthError } from 'next-auth';

export async function logout() {
  await signOut();
}

export async function login(email: string, password: string) {
  try {
    await signIn('credentials', {
      email,
      password,
      // redirect: false,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return { error: 'invalid credentials' };
        default:
          return { error: 'default error' };
      }
    }
    throw error;
  }
}

export async function getSession() {
  const session = await auth();
  return session;
}
