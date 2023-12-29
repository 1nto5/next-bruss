'use server';

import Auth from './components/Auth';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';

export default async function Page() {
  const session = await getServerSession();

  if (session) {
    redirect('/');
  }

  return (
    <main className='m-2 flex justify-center'>
      <Auth />
    </main>
  );
}
