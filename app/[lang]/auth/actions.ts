'use server';

import { auth, signIn, signOut } from '@/lib/auth';

export async function logout() {
  await signOut();
}

export async function signOutAction(formData: FormData) {
  const lang = formData.get('lang') as string;
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
    // Check error type/name for CredentialsSignin (not message content)
    if (
      error instanceof Error &&
      (error.name === 'CredentialsSignin' ||
       (error as any).type === 'CredentialsSignin')
    ) {
      return { error: 'invalid credentials' };
    }

    // For any other type of error (LDAP, database, etc.)
    return { error: 'default error' };
  }
}


export async function getSession() {
  const session = await auth();
  return session;
}
