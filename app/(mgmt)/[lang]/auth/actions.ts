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
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          // Since both user not found and wrong password return null from auth.ts,
          // NextAuth converts both to CredentialsSignin. For security and simplicity,
          // we'll return a generic "invalid credentials" error for both cases.
          return { error: 'invalid credentials' };
        case 'CallbackRouteError':
          // Handle other callback errors (database issues, etc.)
          if (error.cause?.err?.message?.includes('authorize')) {
            return { error: 'default error' };
          }
          return { error: 'default error' };
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
