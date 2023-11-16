import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import authOptions from '@/lib/auth/authOptions';

export const metadata = {
  title: 'Inventory approve (Next BRUSS)',
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

  if (!session?.user?.roles?.includes('inventory-approve')) {
    return (
      <div className='text-center'>
        <p className='mt-10'>No access to inventory approve application!</p>
      </div>
    );
  }
  return <>{children}</>;
}
