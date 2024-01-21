import { auth } from '@/auth';
import Info from '../../components/Info';

export const metadata = {
  title: 'rework (Next BRUSS)',
};

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const infoDescription = (
    <>
      Nie posiadasz uprawnień do funkcji oznaczania jako części rework. Kliknij
      by wysłać zgłoszenie w celu ich nadania:{' '}
      <a
        href={`mailto:support@bruss-group.com?subject=Next BRUSS: uprawnienia rework`}
        className='text-blue-600 hover:text-blue-800'
      >
        support@bruss-group.com
      </a>
      .
    </>
  );
  const session = await auth();
  if (!session?.user.roles?.includes('rework')) {
    return (
      <main className='m-2 flex justify-center'>
        <Info title='Brak uprawnień!' description={infoDescription} />
      </main>
    );
  }
  return <>{children}</>;
}
