import { redirect } from 'next/navigation';
import { auth } from '@/auth';

export const metadata = {
  title: 'Logowanie / rejestracja (Next BRUSS)',
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

  return <>{children}</>;
}
