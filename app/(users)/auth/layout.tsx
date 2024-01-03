import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';

export const metadata = {
  title: 'Logowanie / rejestracja (Next BRUSS)',
};

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();

  if (session) {
    redirect('/');
  }

  return <>{children}</>;
}
