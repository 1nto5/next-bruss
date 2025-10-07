import { auth } from '@/lib/auth';
import AccessDeniedAlert from '@/components/access-denied-alert';
import { getUsers } from '@/lib/data/get-users';
import { redirect } from 'next/navigation';
import OvertimeRequestForm from '../components/overtime-request-form';

export default async function AddOvertimeSubmissionPage() {
  const managers = await getUsers();
  const session = await auth();
  if (!session || !session.user?.email) {
    redirect('/auth');
  }
  // Tester role check
  const userRoles = session.user?.roles || [];
  const isTester = userRoles.includes('tester');
  if (!isTester) {
    return <AccessDeniedAlert />;
  }
  return (
    <OvertimeRequestForm
      managers={managers}
      loggedInUserEmail={session?.user?.email ?? ''}
      mode='new'
    />
  );
}
