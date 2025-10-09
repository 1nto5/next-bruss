// import { auth } from '@/lib/auth';
import { auth } from '@/lib/auth';
import AccessDeniedAlert from '@/components/access-denied-alert';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Locale } from '@/lib/config/i18n';
import { getUsers } from '@/lib/data/get-users';
import { dbc } from '@/lib/db/mongo';
import { extractNameFromEmail } from '@/lib/utils/name-format';
import { Plus, Users } from 'lucide-react';
import { Session } from 'next-auth';
import { redirect } from 'next/navigation';
import LocalizedLink from '@/components/localized-link';
import OvertimeSummaryDisplay from './components/overtime-summary';
import TableFilteringAndOptions from './components/table-filtering-and-options';
import { createColumns } from './components/table/columns';
import { DataTable } from './components/table/data-table';
import {
  OvertimeSummary,
  calculateUnclaimedOvertimeHours,
} from './lib/calculate-overtime';
import { OvertimeSubmissionType } from './lib/types';
import { getDictionary } from './lib/dict';

async function getOvertimeSubmissions(
  session: Session,
  searchParams: { [key: string]: string | undefined },
): Promise<{
  fetchTime: Date;
  fetchTimeLocaleString: string;
  overtimeSubmissionsLocaleString: OvertimeSubmissionType[];
  overtimeSummary: OvertimeSummary;
  pendingApprovalsCount: number;
}> {
  if (!session || !session.user?.email) {
    redirect('/auth?callbackUrl=/overtime-submissions');
  }

  try {
    const coll = await dbc('overtime_submissions');

    // Get user roles
    const userRoles = session.user?.roles ?? [];
    const isManager = userRoles.some(
      (role: string) =>
        role.toLowerCase().includes('manager') ||
        role.toLowerCase().includes('group-leader'),
    );
    const isAdmin = userRoles.includes('admin');
    const isHR = userRoles.includes('hr');

    // Calculate pending approvals count for current user
    let pendingApprovalsCount = 0;
    if (isManager || isAdmin || isHR) {
      const pendingApprovals = await coll
        .find({
          status: 'pending',
          supervisor: session.user.email,
        })
        .toArray();
      pendingApprovalsCount = pendingApprovals.length;
    }

    // Build base query based on user permissions
    let baseQuery: any = {};

    if (isAdmin || isHR) {
      // Admins and HR can see all submissions
      baseQuery = {};
    } else if (isManager) {
      // Managers can see submissions they supervise and their own submissions
      baseQuery = {
        $or: [
          { supervisor: session.user.email },
          { submittedBy: session.user.email },
        ],
      };
    } else {
      // Regular employees can only see their own submissions
      baseQuery = { submittedBy: session.user.email };
    }

    // Apply filters from search parameters
    const filters: any = { ...baseQuery };

    // Status filter
    if (searchParams.status) {
      filters.status = searchParams.status;
    }

    // Month filter
    if (searchParams.month) {
      const [year, month] = searchParams.month.split('-').map(Number);
      const startOfMonth = new Date(year, month - 1, 1);
      const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);

      filters.date = {
        $gte: startOfMonth,
        $lte: endOfMonth,
      };
    }

    // Year filter
    if (searchParams.year) {
      const year = parseInt(searchParams.year);
      const startOfYear = new Date(year, 0, 1);
      const endOfYear = new Date(year, 11, 31, 23, 59, 59, 999);

      filters.date = {
        $gte: startOfYear,
        $lte: endOfYear,
      };
    }

    // Supervisor (manager) filter
    if (searchParams.manager) {
      filters.supervisor = searchParams.manager;
    }

    // My pending approvals filter
    if (searchParams.myPendingApprovals === 'true') {
      // Show only submissions that are pending and where the current user is the supervisor
      filters.status = 'pending';
      filters.supervisor = session.user.email;
    }

    const submissions = await coll
      .find(filters)
      .sort({ submittedAt: -1 })
      .toArray();

    // Transform submissions to include display names and convert ObjectId to string
    const transformedSubmissions: OvertimeSubmissionType[] = submissions.map(
      (submission) =>
        ({
          _id: submission._id.toString(),
          status: submission.status,
          supervisor: submission.supervisor,
          date: submission.date,
          hours: submission.hours,
          reason: submission.reason,
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

    // Calculate overtime summary for the user
    const selectedMonth = searchParams.month;
    const overtimeSummary = await calculateUnclaimedOvertimeHours(
      session.user.email,
      selectedMonth,
    );

    return {
      fetchTime,
      fetchTimeLocaleString,
      overtimeSubmissionsLocaleString: transformedSubmissions,
      overtimeSummary,
      pendingApprovalsCount,
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
  const dict = await getDictionary(lang);
  const searchParams = await props.searchParams;
  const session = await auth();

  if (!session || !session.user?.email) {
    redirect('/auth?callbackUrl=/overtime-submissions');
  }

  // Tester role check
  const userRoles = session.user?.roles || [];
  const isTester = userRoles.includes('tester');
  if (!isTester) {
    return <AccessDeniedAlert />;
  }

  // Anyone logged in can submit overtime hours
  const canCreateSubmission = !!session?.user?.email;

  // Fetch all users for manager filter
  const users = await getUsers();

  const {
    fetchTime,
    overtimeSubmissionsLocaleString,
    overtimeSummary,
    pendingApprovalsCount,
  } = await getOvertimeSubmissions(session, searchParams);

  return (
    <Card>
      <CardHeader className='pb-2'>
        <div className='mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
          <CardTitle>{dict.pageTitle}</CardTitle>
          <CardDescription>
            {dict.testWarning}
          </CardDescription>
          <div className='flex flex-col gap-2 sm:flex-row sm:items-center'>
            {/* HR View Link for HR and admin only */}
            {(session?.user?.roles?.includes('admin') ||
              session?.user?.roles?.includes('hr')) && (
              <LocalizedLink href='/overtime-submissions/hr-view'>
                <Button variant={'outline'} className='w-full sm:w-auto'>
                  <Users />
                  <span>{dict.hrView}</span>
                </Button>
              </LocalizedLink>
            )}
            {session && canCreateSubmission ? (
              <LocalizedLink href='/overtime-submissions/new-request'>
                <Button variant={'outline'} className='w-full sm:w-auto'>
                  <Plus /> <span>{dict.newSubmission}</span>
                </Button>
              </LocalizedLink>
            ) : null}
          </div>
        </div>
        <OvertimeSummaryDisplay overtimeSummary={overtimeSummary} dict={dict} />

        <TableFilteringAndOptions
          fetchTime={fetchTime}
          userRoles={session?.user?.roles || []}
          users={users}
          pendingApprovalsCount={pendingApprovalsCount}
          dict={dict}
        />
      </CardHeader>

      <DataTable
        columns={createColumns}
        data={overtimeSubmissionsLocaleString}
        session={session}
        dict={dict}
      />
    </Card>
  );
}
