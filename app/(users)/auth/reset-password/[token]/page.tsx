'use server';

import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import Reset from '../../components/Reset';

export default async function Page() {
  const session = await getServerSession();

  if (session) {
    redirect('/');
  }

  return (
    <main className='m-2 flex justify-center'>
      <Reset />
    </main>
  );
}
