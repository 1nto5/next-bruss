import { auth } from '@/auth';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import Info from '../../components/welcome-alert';

export const metadata: Metadata = {
  title: 'Inventory approve (Next BRUSS)',
  // description: 'Company helper applications',
};

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const infoDescription = (
    <>
      Nie posiadasz uprawnień do funkcji zatwierdzania pozycji inwentaryzacji.
      Kliknij by wysłać zgłoszenie w celu ich nadania:{' '}
      <a
        href={`mailto:support@bruss-group.com?subject=Next BRUSS: uprawnienia inventory approve`}
        className='text-blue-600 hover:text-blue-800'
      >
        support@bruss-group.com
      </a>
      .
    </>
  );
  const session = await auth();
  console.log('session: ', session);
  if (!session) {
    redirect('/auth');
  }

  if (!session?.user?.roles?.includes('inventory-approve')) {
    return (
      <div className='flex justify-center'>
        <Info title='Brak uprawnień!' description={infoDescription} />
      </div>
    );
  }
  return <>{children}</>;
}
