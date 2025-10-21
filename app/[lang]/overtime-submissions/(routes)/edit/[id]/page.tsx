import { auth } from '@/lib/auth';
import { dbc } from '@/lib/db/mongo';
import { extractFullNameFromEmail } from '@/lib/utils/name-format';
import { ObjectId } from 'mongodb';
import { notFound, redirect } from 'next/navigation';
import OvertimeRequestForm from '../../../components/overtime-request-form';
import { Locale } from '@/lib/config/i18n';
import { getDictionary } from '../../../lib/dict';
import { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: Locale; id: string }>;
}): Promise<Metadata> {
  const { lang, id } = await params;
  const dict = await getDictionary(lang);
  const submission = await getOvertimeSubmission(id);

  if (!submission) {
    return {
      title: `${dict.form.titleEdit} (BRUSS)`,
    };
  }

  return {
    title: `${dict.form.titleEdit} - ${submission.internalId || id} (BRUSS)`,
  };
}

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
      date: submission.date,
      hours: submission.hours,
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
      payment: submission.payment,
      overtimeRequest: submission.overtimeRequest ?? false,
      scheduledDayOff: submission.scheduledDayOff ?? undefined,
      directorApprovedAt: submission.directorApprovedAt,
      directorApprovedBy: submission.directorApprovedBy,
    };
  } catch (error) {
    console.error('Error fetching overtime submission:', error);
    return null;
  }
}

export default async function EditOvertimeSubmissionPage(props: {
  params: Promise<{ lang: Locale; id: string }>;
}) {
  const params = await props.params;
  const { lang, id } = params;
  const dict = await getDictionary(lang);

  const session = await auth();
  if (!session || !session.user?.email) {
    redirect('/auth?callbackUrl=/overtime-submissions');
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
  const isHR = session.user.roles?.includes('hr') ?? false;
  const isAdmin = session.user.roles?.includes('admin') ?? false;

  // Edit permissions:
  // - Author can edit when status is pending
  // - HR/Admin can edit regardless of status
  const canEdit =
    (isAuthor && submission.status === 'pending') || isHR || isAdmin;

  if (!canEdit) {
    redirect('/overtime-submissions');
  }

  // When HR/Admin edits a non-pending submission, it requires re-approval
  const requiresReapproval = !isAuthor && (isHR || isAdmin) && submission.status !== 'pending';

  return (
    <OvertimeRequestForm
      managers={managers}
      loggedInUserEmail={session.user.email ?? ''}
      mode='edit'
      submission={submission}
      dict={dict}
      lang={lang}
      requiresReapproval={requiresReapproval}
    />
  );
}
