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
import { Plus } from 'lucide-react';
import { Session } from 'next-auth';
import { redirect } from 'next/navigation';
import LocalizedLink from '@/components/localized-link';
import OvertimeSummaryDisplay from './components/overtime-summary';
import TableFilteringAndOptions from './components/table-filtering-and-options';
import { createColumns } from './components/table/columns';
import { DataTable } from './components/table/data-table';
import {
  OvertimeSummary,
  calculateSummaryFromSubmissions,
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
  assignedToMePendingCount: number;
  pendingSettlementsCount: number;
  selectedEmployeeEmail: string | null;
  hasActiveFilters: boolean;
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

    // Note: assignedToMeCount, assignedToMePendingCount, and pendingSettlementsCount
    // will be calculated from filtered submissions below to respect active filters

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

    // Pending settlements filter - for HR/Admin only
    if (searchParams.pendingSettlements === 'true' && (isAdmin || isHR)) {
      filters.status = 'approved';
      // Clear baseQuery restrictions for HR when viewing pending settlements
      delete filters.$or;
      delete filters.submittedBy;
      delete filters.supervisor;
    } else {
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

      // Orders filter - shows only entries with payment or scheduledDayOff
      if (searchParams.onlyOrders === 'true') {
        filters.$or = [
          { payment: true },
          { scheduledDayOff: { $ne: null, $exists: true } }
        ];
      }

      // Employee filter - for HR, Admin, and Managers
      if (searchParams.employee && (isAdmin || isHR || isManager)) {
        const employees = searchParams.employee.split(',');
        if (employees.length > 1) {
          filters.submittedBy = { $in: employees };
        } else {
          filters.submittedBy = searchParams.employee;
        }
        // Remove the $or clause if it exists
        delete filters.$or;
      }
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

    // Week filter - for HR/Admin only (mutually exclusive with month)
    if (searchParams.week && (isAdmin || isHR)) {
      const weeks = searchParams.week.split(',');

      // Helper function to get Monday of ISO week
      const getFirstDayOfISOWeek = (year: number, week: number): Date => {
        const simple = new Date(year, 0, 1 + (week - 1) * 7);
        const dayOfWeek = simple.getDay();
        const isoWeekStart = simple;
        if (dayOfWeek <= 4) {
          isoWeekStart.setDate(simple.getDate() - simple.getDay() + 1);
        } else {
          isoWeekStart.setDate(simple.getDate() + 8 - simple.getDay());
        }
        return isoWeekStart;
      };

      if (weeks.length > 1) {
        filters.$or = weeks.map((weekStr) => {
          // Parse format: "2025-W42"
          const [yearStr, weekPart] = weekStr.split('-W');
          const year = parseInt(yearStr);
          const week = parseInt(weekPart);
          const monday = getFirstDayOfISOWeek(year, week);
          const sunday = new Date(monday);
          sunday.setDate(monday.getDate() + 6);
          sunday.setHours(23, 59, 59, 999);
          return {
            date: {
              $gte: monday,
              $lte: sunday,
            },
          };
        });
      } else {
        const [yearStr, weekPart] = searchParams.week.split('-W');
        const year = parseInt(yearStr);
        const week = parseInt(weekPart);
        const monday = getFirstDayOfISOWeek(year, week);
        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);
        sunday.setHours(23, 59, 59, 999);
        filters.date = {
          $gte: monday,
          $lte: sunday,
        };
      }
    }
    // Month filter (mutually exclusive with week)
    else if (searchParams.month) {
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

    // Year filter (only if no month or week filter)
    if (searchParams.year && !searchParams.month && !searchParams.week) {
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
          payment: submission.payment,
          scheduledDayOff: submission.scheduledDayOff,
          overtimeRequest: submission.overtimeRequest,
          plantManagerApprovedAt: submission.plantManagerApprovedAt,
          plantManagerApprovedBy: submission.plantManagerApprovedBy,
          supervisorApprovedAt: submission.supervisorApprovedAt,
          supervisorApprovedBy: submission.supervisorApprovedBy,
          editHistory: submission.editHistory,
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

    // Calculate overtime summary based on filters
    const selectedMonth = searchParams.month;
    const selectedYear = searchParams.year;
    const selectedEmployee = searchParams.employee;

    // Check if a single employee is selected (not multiple)
    const isSingleEmployee = selectedEmployee && !selectedEmployee.includes(',');

    // Calculate overtime summary directly from filtered submissions
    // This ensures the summary matches the filtered data being displayed
    const overtimeSummary = await calculateSummaryFromSubmissions(
      transformedSubmissions,
      selectedMonth,
      selectedYear,
      searchParams.onlyOrders === 'true'
    );

    // Determine if any filters are active (to show appropriate labels)
    const hasActiveFilters = !!(
      searchParams.employee ||
      searchParams.status ||
      searchParams.month ||
      searchParams.year ||
      searchParams.week ||
      searchParams.manager ||
      searchParams.onlyMySubmissions ||
      searchParams.assignedToMe ||
      searchParams.pendingSettlements ||
      searchParams.onlyOrders
    );

    // Check if there are filters OTHER than the toggle switches (onlyMySubmissions, assignedToMe, pendingSettlements)
    const hasOtherFilters = !!(
      searchParams.employee ||
      searchParams.status ||
      searchParams.month ||
      searchParams.year ||
      searchParams.week ||
      searchParams.manager
    );

    // When time filters (year, month, or week) are active, show only ONE card
    // Otherwise, show both cards when:
    // 1. No filters at all, OR
    // 2. Only "Tylko moje" (onlyMySubmissions) filter is active, OR
    // 3. Only single employee filter (no other filters)
    const hasTimeFilters = !!(searchParams.year || searchParams.month || searchParams.week);

    const onlyMySubmissionsAlone = !!(
      searchParams.onlyMySubmissions &&
      !searchParams.status &&
      !searchParams.employee &&
      !searchParams.manager &&
      !searchParams.assignedToMe &&
      !searchParams.pendingSettlements &&
      !searchParams.onlyOrders
    );

    const showBothCards = !hasTimeFilters && (
      !hasActiveFilters ||
      onlyMySubmissionsAlone ||
      (
        isSingleEmployee &&
        !searchParams.status &&
        !searchParams.manager &&
        !searchParams.onlyMySubmissions &&
        !searchParams.assignedToMe &&
        !searchParams.pendingSettlements &&
        !searchParams.onlyOrders
      )
    );

    // Calculate counts from filtered submissions to respect active filters
    const assignedToMeCount = transformedSubmissions.filter(
      (s) => s.supervisor === session.user.email
    ).length;

    const assignedToMePendingCount = transformedSubmissions.filter(
      (s) =>
        s.supervisor === session.user.email &&
        (s.status === 'pending' || s.status === 'pending-plant-manager')
    ).length;

    const pendingSettlementsCount = transformedSubmissions.filter(
      (s) => s.status === 'approved'
    ).length;

    const ordersCount = transformedSubmissions.filter(
      (s) => s.payment || s.scheduledDayOff
    ).length;

    const onlyMySubmissionsCount = transformedSubmissions.filter(
      (s) => s.submittedBy === session.user.email
    ).length;

    // Determine if we're showing organization-wide data
    // This happens when HR/Admin views all submissions without specific filters
    const isOrganizationView =
      (isAdmin || isHR) &&
      !selectedEmployee &&
      !searchParams.onlyMySubmissions &&
      !searchParams.assignedToMe &&
      !searchParams.pendingSettlements &&
      !searchParams.onlyOrders;

    return {
      fetchTime,
      fetchTimeLocaleString,
      overtimeSubmissionsLocaleString: transformedSubmissions,
      overtimeSummary,
      assignedToMeCount,
      assignedToMePendingCount,
      pendingSettlementsCount,
      ordersCount,
      onlyMySubmissionsCount,
      selectedEmployeeEmail: isSingleEmployee ? selectedEmployee : null,
      hasActiveFilters,
      showBothCards,
      isOrganizationView,
      onlyMySubmissions: searchParams.onlyMySubmissions || false,
      onlyOrders: searchParams.onlyOrders || false,
      hasOtherFilters,
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
    assignedToMePendingCount,
    pendingSettlementsCount,
    ordersCount,
    onlyMySubmissionsCount,
    selectedEmployeeEmail,
    hasActiveFilters,
    showBothCards,
    isOrganizationView,
    onlyMySubmissions,
    onlyOrders,
    hasOtherFilters,
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
            {session && canCreateSubmission ? (
              <LocalizedLink href='/overtime-submissions/new-request'>
                <Button variant={'outline'} className='w-full sm:w-auto'>
                  <Plus /> <span>{dict.newSubmission}</span>
                </Button>
              </LocalizedLink>
            ) : null}
          </div>
        </div>
        <OvertimeSummaryDisplay
          overtimeSummary={overtimeSummary}
          dict={dict}
          selectedEmployeeEmail={selectedEmployeeEmail}
          hasActiveFilters={hasActiveFilters}
          showBothCards={showBothCards}
          isOrganizationView={isOrganizationView}
          onlyMySubmissions={onlyMySubmissions}
          onlyOrders={onlyOrders}
          hasOtherFilters={hasOtherFilters}
        />

        <TableFilteringAndOptions
          fetchTime={fetchTime}
          userRoles={session?.user?.roles || []}
          users={users}
          assignedToMeCount={assignedToMeCount}
          assignedToMePendingCount={assignedToMePendingCount}
          pendingSettlementsCount={pendingSettlementsCount}
          ordersCount={ordersCount}
          onlyMySubmissionsCount={onlyMySubmissionsCount}
          dict={dict}
        />
      </CardHeader>

      <DataTable
        columns={createColumns}
        data={overtimeSubmissionsLocaleString}
        fetchTime={fetchTime}
        session={session}
        dict={dict}
      />
    </Card>
  );
}
