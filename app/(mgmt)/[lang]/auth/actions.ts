'use server';

import { auth, signIn, signOut } from '@/auth';
import { AuthError } from 'next-auth';

export async function logout() {
  await signOut();
}

export async function login(email: string, password: string) {
  try {
    await signIn('credentials', {
      email: email.toLowerCase(),
      password,
      redirect: false,
    });
    // If we get here, login was successful
    return { success: true };
  } catch (error) {
    console.error('Login error:', error);

    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return { error: 'invalid credentials' };
        default:
          return { error: 'default error' };
      }
    }

    // For any other type of error
    return { error: 'default error' };
  }
}

export async function getSession() {
  const session = await auth();
  return session;
}
