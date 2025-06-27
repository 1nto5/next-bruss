import { auth } from '@/auth';
import getEmployees from '@/lib/get-employees';
import { getUsers } from '@/lib/get-users';
import { redirect } from 'next/navigation';
import NewOvertimeRequestForm from '../components/new-overtime-request-form';

export default async function AddDeviationPage() {
  const employees = await getEmployees();
  const users = await getUsers();
  const session = await auth();

  if (!session || !session.user?.email) {
    redirect('/auth');
  }

  return (
    <NewOvertimeRequestForm
      employees={employees}
      users={users}
      loggedInUserEmail={session.user.email ?? ''}
    />
  );
}
