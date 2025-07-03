import { auth } from '@/auth';
import { dbc } from '@/lib/mongo';
import { extractFullNameFromEmail } from '@/lib/utils/name-format';
import { redirect } from 'next/navigation';
import NewOvertimeSubmissionForm from '../components/new-overtime-request-form';

// Get users with manager roles (any role containing "manager")
async function getManagers() {
  try {
    const usersColl = await dbc('users');
    const managers = await usersColl
      .find({
        roles: {
          $regex: 'manager',
          $options: 'i', // case insensitive
        },
      })
      .toArray();

    return managers.map((manager) => ({
      _id: manager._id.toString(),
      email: manager.email,
      name: extractFullNameFromEmail(manager.email),
    }));
  } catch (error) {
    console.error('Error fetching managers:', error);
    return [];
  }
}

export default async function AddOvertimeSubmissionPage() {
  const managers = await getManagers();
  const session = await auth();

  if (!session || !session.user?.email) {
    redirect('/auth');
  }

  return (
    <NewOvertimeSubmissionForm
      managers={managers}
      loggedInUserEmail={session.user.email ?? ''}
    />
  );
}
