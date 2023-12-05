'use client';
import { useSession } from 'next-auth/react';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { extractNameFromEmail } from '@/lib/utils/nameFormat';

export default function UserInfo() {
  const { data: session } = useSession();
  const router = useRouter();
  return (
    <>
      <div className='text-center'>
        <p className='mt-10'>
          Cześć! Cały czas pracuję nad rozwiązaniami, które tu znajdziesz.
          Proszę o cierpliwość!
        </p>

        <p className='mt-10'>
          Zalogowany:{' '}
          {extractNameFromEmail(
            session?.user?.email ?? 'Unknown.User@bruss-group.com',
          )}
        </p>
        <p className='mb-10 mt-2'>
          Grupy uprawnień: {session?.user?.roles?.join(', ')}
        </p>
      </div>
    </>
  );
}
