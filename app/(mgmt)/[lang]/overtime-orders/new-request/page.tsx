import { auth } from '@/auth';
import getEmployees from '@/lib/get-employees';
import { getUsers } from '@/lib/get-users';
import { redirect } from 'next/navigation';
import NewOvertimeRequestForm from '../components/new-overtime-request-form';

export default async function AddDeviationPage(props: {
  params: Promise<{ lang: string }>;
}) {
  const params = await props.params;
  const { lang } = params;
  const employees = await getEmployees();
  const users = await getUsers();
  const session = await auth();

  if (!session || !session.user?.email) {
    redirect('/auth');
  }
  // Determine access based on user roles: group leader (any role containing "group-leader"), any manager, or admin
  const isGroupLeader =
    session?.user?.roles?.some((role) => role.includes('group-leader')) ||
    false;
  const isManager =
    session?.user?.roles?.some((role) => role.includes('manager')) || false;
  const isAdmin = session?.user?.roles?.includes('admin') || false;
  const canCreateRequest = isGroupLeader || isManager || isAdmin;
  if (!canCreateRequest) {
    redirect('/overtime-orders');
  }

  return (
    <NewOvertimeRequestForm
      employees={employees}
      users={users}
      loggedInUserEmail={session.user.email ?? ''}
    />
  );
}
