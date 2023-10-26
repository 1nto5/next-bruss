'use client';
import { useSession } from 'next-auth/react';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import formatEmailToName from '@/lib/utils/inventory/formatEmailToName';

export default function UserInfo() {
  const { data: session } = useSession();
  const router = useRouter();
  return (
    <>
      <div className='text-center'>
        <p className='mt-10'>
          One day there will be something beautiful here, for now you can log
          out:
        </p>
        <button
          className='mt-2 w-20 rounded bg-red-600 p-2 text-center text-lg font-extralight text-slate-100 shadow-sm hover:bg-red-500 dark:bg-red-900 dark:text-slate-50 dark:hover:bg-red-700'
          onClick={() => signOut()}
        >
          logout
        </button>
        <p className='mt-10'>
          Name:{' '}
          {formatEmailToName(
            session?.user?.email ?? 'Unknown.User@bruss-group.com',
          )}
        </p>
        <p className='mb-10 mt-2'>Roles: {session?.user?.roles?.join(', ')}</p>

        <Link href={'/inventory'}>
          <button className='rounded bg-slate-200 p-2 text-center text-lg font-extralight text-slate-900 shadow-sm hover:bg-bruss dark:bg-slate-700 dark:text-slate-100'>
            inventory app
          </button>
        </Link>
      </div>
    </>
  );
}
