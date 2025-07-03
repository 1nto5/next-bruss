import { auth } from '@/auth';
import { dbc } from '@/lib/mongo';
import { extractFullNameFromEmail } from '@/lib/utils/name-format';
import { ObjectId } from 'mongodb';
import { notFound, redirect } from 'next/navigation';
import EditOvertimeSubmissionForm from '../../../overtime/components/edit-overtime-request-form';

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

async function getOvertimeSubmission(id: string) {
  try {
    const coll = await dbc('overtime_submissions');
    const submission = await coll.findOne({ _id: new ObjectId(id) });

    if (!submission) {
      return null;
    }

    return {
      _id: submission._id.toString(),
      status: submission.status,
      supervisor: submission.supervisor,
      workedDate: submission.workedDate,
      hoursWorked: submission.hoursWorked,
      reason: submission.reason,
      description: submission.description,
      note: submission.note,
      submittedAt: submission.submittedAt,
      submittedBy: submission.submittedBy,
      editedAt: submission.editedAt,
      editedBy: submission.editedBy,
      approvedAt: submission.approvedAt,
      approvedBy: submission.approvedBy,
      rejectedAt: submission.rejectedAt,
      rejectedBy: submission.rejectedBy,
      rejectionReason: submission.rejectionReason,
      accountedAt: submission.accountedAt,
      accountedBy: submission.accountedBy,
      hasAttachment: submission.hasAttachment,
    };
  } catch (error) {
    console.error('Error fetching overtime submission:', error);
    return null;
  }
}

export default async function EditOvertimeSubmissionPage(props: {
  params: Promise<{ id: string }>;
}) {
  const params = await props.params;
  const { id } = params;

  const session = await auth();
  if (!session || !session.user?.email) {
    redirect('/auth?callbackUrl=/overtime');
  }

  const [managers, submission] = await Promise.all([
    getManagers(),
    getOvertimeSubmission(id),
  ]);

  if (!submission) {
    notFound();
  }

  // Check if user can edit this submission
  const isAuthor = submission.submittedBy === session.user.email;
  const canEdit = isAuthor && submission.status === 'pending';

  if (!canEdit) {
    redirect('/overtime');
  }

  return (
    <EditOvertimeSubmissionForm
      managers={managers}
      loggedInUserEmail={session.user.email ?? ''}
      submission={submission}
    />
  );
}
