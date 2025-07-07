import { auth } from '@/auth';
import { getUsers } from '@/lib/get-users';
import OvertimeRequestForm from '../components/overtime-request-form';

export default async function AddOvertimeSubmissionPage() {
  const managers = await getUsers();
  const session = await auth();

  return (
    <OvertimeRequestForm
      managers={managers}
      loggedInUserEmail={session?.user?.email ?? ''}
      mode='new'
    />
  );
}
