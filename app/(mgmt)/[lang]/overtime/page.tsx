// import { auth } from '@/auth';
import { auth } from '@/auth';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Locale } from '@/i18n.config';
import { dbc } from '@/lib/mongo';
import { extractNameFromEmail } from '@/lib/utils/name-format';
import { KeyRound, Plus } from 'lucide-react';
import { Session } from 'next-auth';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import TableFilteringAndOptions from './components/table-filtering-and-options';
import { createColumns } from './components/table/columns';
import { DataTable } from './components/table/data-table';
import { OvertimeSubmissionType } from './lib/types';

async function getOvertimeSubmissions(session: Session): Promise<{
  fetchTime: Date;
  fetchTimeLocaleString: string;
  overtimeSubmissionsLocaleString: OvertimeSubmissionType[];
}> {
  if (!session || !session.user?.email) {
    redirect('/auth');
  }

  try {
    const coll = await dbc('overtime_submissions');

    // Get user roles
    const userRoles = session.user?.roles ?? [];
    const isManager = userRoles.some((role: string) =>
      role.toLowerCase().includes('manager'),
    );
    const isAdmin = userRoles.includes('admin');
    const isHR = userRoles.includes('hr');

    let submissions;

    if (isAdmin || isHR) {
      // Admins and HR can see all submissions
      submissions = await coll.find({}).sort({ submittedAt: -1 }).toArray();
    } else if (isManager) {
      // Managers can see submissions they supervise and their own submissions
      submissions = await coll
        .find({
          $or: [
            { supervisor: session.user.email },
            { submittedBy: session.user.email },
          ],
        })
        .sort({ submittedAt: -1 })
        .toArray();
    } else {
      // Regular employees can only see their own submissions
      submissions = await coll
        .find({ submittedBy: session.user.email })
        .sort({ submittedAt: -1 })
        .toArray();
    }

    // Transform submissions to include display names and convert ObjectId to string
    const transformedSubmissions: OvertimeSubmissionType[] = submissions.map(
      (submission) =>
        ({
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
          // Add display names for convenience (not part of the type but useful for table)
          submittedByName: extractNameFromEmail(submission.submittedBy),
          supervisorName: extractNameFromEmail(submission.supervisor),
        }) as OvertimeSubmissionType & {
          submittedByName: string;
          supervisorName: string;
        },
    );

    const fetchTime = new Date();
    const fetchTimeLocaleString = fetchTime.toLocaleString();

    return {
      fetchTime,
      fetchTimeLocaleString,
      overtimeSubmissionsLocaleString: transformedSubmissions,
    };
  } catch (error) {
    console.error('Error fetching overtime submissions:', error);
    throw new Error('Failed to fetch overtime submissions');
  }
}

export default async function OvertimePage(props: {
  params: Promise<{ lang: Locale }>;
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const params = await props.params;
  const { lang } = params;
  const searchParams = await props.searchParams;
  const session = await auth();

  // Anyone logged in can submit overtime hours
  const canCreateSubmission = !!session?.user?.email;

  if (!session?.user?.email) {
    redirect('/auth?callbackUrl=/overtime');
  }

  const { fetchTime, fetchTimeLocaleString, overtimeSubmissionsLocaleString } =
    await getOvertimeSubmissions(session);

  return (
    <Card>
      <CardHeader>
        <div className='mb-4 flex items-center justify-between'>
          <CardTitle>Zgłoszenia przepracowanych godzin nadliczbowych</CardTitle>
          {session && canCreateSubmission ? (
            <Link href='/overtime/new-request'>
              <Button variant={'outline'}>
                <Plus /> <span>Nowe zgłoszenie</span>
              </Button>
            </Link>
          ) : !session ? (
            <Link href={`/auth?callbackUrl=/overtime`}>
              <Button variant={'outline'}>
                <KeyRound /> <span>Zaloguj się</span>
              </Button>
            </Link>
          ) : null}
        </div>
        <TableFilteringAndOptions
          fetchTime={fetchTime}
          isGroupLeader={false}
          isLogged={!!session}
          userEmail={session?.user?.email || undefined}
        />
      </CardHeader>
      <DataTable
        columns={createColumns}
        data={overtimeSubmissionsLocaleString}
        fetchTimeLocaleString={fetchTimeLocaleString}
        fetchTime={fetchTime}
        session={session}
      />
    </Card>
  );
}
