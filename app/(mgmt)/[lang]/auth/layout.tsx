import { auth } from '@/auth';
import { redirect } from 'next/navigation';

export const metadata = {
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
