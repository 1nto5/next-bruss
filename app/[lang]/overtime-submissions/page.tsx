import { auth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Locale } from '@/lib/config/i18n';
import { formatDateTime } from '@/lib/utils/date-format';
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

export const dynamic = 'force-dynamic';

async function getOvertimeSubmissions(
  session: Session,
  searchParams: { [key: string]: string | undefined },
): Promise<{
  fetchTime: Date;
  fetchTimeLocaleString: string;
  overtimeSubmissionsLocaleString: OvertimeSubmissionType[];
  overtimeSummary: OvertimeSummary;
  assignedToMeCount: number;
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

    // Count submissions assigned to current user as supervisor
    const assignedToMe = await coll
      .find({
        supervisor: session.user.email,
      })
      .toArray();
    const assignedToMeCount = assignedToMe.length;

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

    // Only my submissions filter - overrides baseQuery to show only user's own submissions
    if (searchParams.onlyMySubmissions === 'true') {
      filters.submittedBy = session.user.email;
      // Remove the $or clause if it exists
      delete filters.$or;
    }

    // Assigned to me filter - shows all submissions where I'm the supervisor
    if (searchParams.assignedToMe === 'true') {
      // Show all submissions where the current user is the supervisor, regardless of status
      filters.supervisor = session.user.email;
      // Remove submittedBy filter if it exists from onlyMySubmissions
      delete filters.submittedBy;
      // Remove the $or clause if it exists
      delete filters.$or;
      // Don't filter by status - show all
    }

    // Status filter
    if (searchParams.status) {
      const statuses = searchParams.status.split(',');
      if (statuses.length > 1) {
        filters.status = { $in: statuses };
      } else {
        filters.status = searchParams.status;
      }
    }

    // Month filter
    if (searchParams.month) {
      const months = searchParams.month.split(',');
      if (months.length > 1) {
        // Multiple months: create $or query with date ranges
        filters.$or = months.map(monthStr => {
          const [year, month] = monthStr.split('-').map(Number);
          const startOfMonth = new Date(year, month - 1, 1);
          const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);
          return {
            date: {
              $gte: startOfMonth,
              $lte: endOfMonth,
            },
          };
        });
      } else {
        const [year, month] = searchParams.month.split('-').map(Number);
        const startOfMonth = new Date(year, month - 1, 1);
        const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);
        filters.date = {
          $gte: startOfMonth,
          $lte: endOfMonth,
        };
      }
    }

    // Year filter
    if (searchParams.year) {
      const years = searchParams.year.split(',').map(y => parseInt(y));
      if (years.length > 1) {
        // Multiple years: create $or query with date ranges
        filters.$or = years.map(year => {
          const startOfYear = new Date(year, 0, 1);
          const endOfYear = new Date(year, 11, 31, 23, 59, 59, 999);
          return {
            date: {
              $gte: startOfYear,
              $lte: endOfYear,
            },
          };
        });
      } else {
        const year = parseInt(searchParams.year);
        const startOfYear = new Date(year, 0, 1);
        const endOfYear = new Date(year, 11, 31, 23, 59, 59, 999);
        filters.date = {
          $gte: startOfYear,
          $lte: endOfYear,
        };
      }
    }

    // Supervisor (manager) filter
    if (searchParams.manager) {
      const managers = searchParams.manager.split(',');
      if (managers.length > 1) {
        filters.supervisor = { $in: managers };
      } else {
        filters.supervisor = searchParams.manager;
      }
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
          internalId: submission.internalId,
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
    const fetchTimeLocaleString = formatDateTime(fetchTime);

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
      assignedToMeCount,
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

  // Anyone logged in can submit overtime hours
  const canCreateSubmission = !!session?.user?.email;

  // Fetch all users for manager filter
  const users = await getUsers();

  const {
    fetchTime,
    overtimeSubmissionsLocaleString,
    overtimeSummary,
    assignedToMeCount,
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
          assignedToMeCount={assignedToMeCount}
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
