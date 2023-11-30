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
        {!session ? (
          <button
            onClick={() => router.push('/auth/login')}
            className='mt-4 rounded bg-slate-200 p-2 text-center text-lg font-extralight text-slate-900 shadow-sm hover:bg-bruss dark:bg-slate-700 dark:text-slate-100'
          >
            login
          </button>
        ) : (
          <>
            <p className='mt-10'>Niedługo powstanie tu panel dostępu...</p>
            <button
              className='mt-2 w-20 rounded bg-red-600 p-2 text-center text-lg font-extralight text-slate-100 shadow-sm hover:bg-red-500 dark:bg-red-900 dark:text-slate-50 dark:hover:bg-red-700'
              onClick={() => signOut()}
            >
              logout
            </button>
            <p className='mt-10'>
              Name:{' '}
              {extractNameFromEmail(
                session?.user?.email ?? 'Unknown.User@bruss-group.com',
              )}
            </p>
            <p className='mb-10 mt-2'>
              Roles: {session?.user?.roles?.join(', ')}
            </p>

            <Link href={'/inventory-approve'}>
              <button className='m-2 rounded bg-slate-200 p-2 text-center text-lg font-extralight text-slate-900 shadow-sm hover:bg-bruss dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-bruss'>
                inventory approve app
              </button>
            </Link>

            <Link href={'/pro/export-data'}>
              <button className='m-3 rounded bg-slate-200 p-2 text-center text-lg font-extralight text-slate-900 shadow-sm hover:bg-bruss dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-bruss'>
                export data
              </button>
            </Link>
          </>
        )}
      </div>
    </>
  );
}