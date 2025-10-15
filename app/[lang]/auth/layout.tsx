import { auth } from '@/lib/auth';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Login (Next BRUSS)',
};

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (session) {
    redirect('/');
  }

  return <div className='flex justify-center'>{children}</div>;
}
