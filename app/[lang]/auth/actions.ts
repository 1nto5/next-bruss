'use server';

import { auth, signIn, signOut } from '@/lib/auth';

export async function logout() {
  await signOut();
}

export async function signOutAction(lang: string) {
  await signOut({ redirectTo: `/${lang}` });
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
    const errorMessage = error instanceof Error ? error.message : 'default error';

    if (errorMessage.includes('CredentialsSignin') || errorMessage.includes('Invalid credentials')) {
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
