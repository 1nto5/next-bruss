import { auth } from '@/auth';
import { Locale } from '@/i18n.config';
import { redirect } from 'next/navigation';

export const metadata = {
  title:
    'Zlecenia wykonania pracy w godzinach nadliczbowych - produkcja (BRUSS)',
};

export default async function Layout(props: {
  children: React.ReactNode;
  params: Promise<{ lang: Locale }>;
}) {
  const params = await props.params;

  const { lang } = params;

  const { children } = props;

  // const dict = await getDictionary(lang);

  const session = await auth();
  if (!session) {
    redirect('/auth');
  }
  // Determine access based on user roles: group-leader, any manager, or admin
  const isGroupLeader = session?.user?.roles?.includes('group-leader') || false;
  // Users with any role containing 'manager' (e.g., plant manager, logistics manager, etc.) can create requests
  const isManager =
    session?.user?.roles?.some((role) => role.includes('manager')) || false;
  const isAdmin = session?.user?.roles?.includes('admin') || false;
  const canCreateRequest = isGroupLeader || isManager || isAdmin;

  if (!canCreateRequest) {
    redirect('/production-overtime');
  }

  return <div className='flex justify-center'>{children}</div>;
}
