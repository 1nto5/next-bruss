import { auth } from '@/auth';
import FormContainer from '@/components/ui/form-container';
import { redirect } from 'next/navigation';
import Info from '../../components/info';

export const metadata = {
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
      <FormContainer>
        <Info title='Brak uprawnień!' description={infoDescription} />
      </FormContainer>
    );
  }
  return <>{children}</>;
}
