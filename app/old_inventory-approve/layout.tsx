import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import Status from './components/Status';
import Header from './components/Header';

export const metadata = {
  title: 'Inventory Approve (Next BRUSS)',
  // description: 'Company helper applications',
};

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect('/auth/login');
  }

  if (!session?.user?.roles?.includes('inventory')) {
    return (
      <div className='text-center'>
        <p className='mt-10'>No access to inventory application!</p>
      </div>
    );
  }
  return (
    <>
      <Header title='inventory approve' />
      <Status />
      {children}
    </>
  );
}
