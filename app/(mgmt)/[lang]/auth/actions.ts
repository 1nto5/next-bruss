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
        case 'CallbackRouteError':
          // This might be thrown when credentials are invalid
          if (error.cause?.err?.message?.includes('authorize') || 
              error.cause?.err?.type === 'CredentialsSignin') {
            return { error: 'invalid credentials' };
          }
          return { error: 'default error' };
        default:
          return { error: 'default error' };
      }
    }

    // Check if it's a generic error that might indicate credential issues
    const errorMessage = (error as any)?.message || '';
    if (errorMessage.includes('authorize') || errorMessage.includes('credentials')) {
      return { error: 'invalid credentials' };
    }

    // For any other type of error
    return { error: 'default error' };
  }
}

export async function getSession() {
  const session = await auth();
  return session;
}
