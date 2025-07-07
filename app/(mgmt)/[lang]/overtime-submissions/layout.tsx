import { auth } from '@/auth';
import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Zgłoszenia nadgodzin (BRUSS)',
};

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user?.email) {
    redirect('/auth?callbackUrl=/overtime-submissions');
  }
  return <>{children}</>;
}
