import { auth } from '@/auth';
import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Inventory approve (Next BRUSS)',
  // description: 'Company helper applications',
};

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  console.log('session: ', session);
  if (!session) {
    redirect('/auth/login');
  }

  if (!session?.user?.roles?.includes('inventory-approve')) {
    return (
      <div className='text-center'>
        <p className='mt-10'>No access to inventory approve application!</p>
      </div>
    );
  }
  return <>{children}</>;
}
