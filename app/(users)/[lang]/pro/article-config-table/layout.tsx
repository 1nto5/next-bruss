import { redirect } from 'next/navigation';
import { auth } from '@/auth';

export const metadata = {
  title: 'Users management (Next BRUSS)',
};

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) {
    redirect('/auth');
  }
  if (!session?.user.roles?.includes('admin')) {
    redirect('/');
  }
  return <>{children}</>;
}
