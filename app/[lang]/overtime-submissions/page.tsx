import LocalizedLink from '@/components/localized-link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { auth } from '@/lib/auth';
import { Locale } from '@/lib/config/i18n';
import { getUsers } from '@/lib/data/get-users';
import { formatDateTime } from '@/lib/utils/date-format';
import { Plus } from 'lucide-react';
import { Session } from 'next-auth';
import { redirect } from 'next/navigation';
import OvertimeSummaryDisplay from './components/overtime-summary';
import TableFilteringAndOptions from './components/table-filtering-and-options';
import { createColumns } from './components/table/columns';
import { DataTable } from './components/table/data-table';
import { calculateSummaryFromSubmissions } from './lib/calculate-overtime';
import { getDictionary } from './lib/dict';
import { OvertimeSubmissionType } from './lib/types';

export const dynamic = 'force-dynamic';

async function getOvertimeSubmissions(
  session: Session,
  searchParams: { [key: string]: string | undefined },
): Promise<{
  fetchTime: Date;
  fetchTimeLocaleString: string;
  overtimeSubmissionsLocaleString: OvertimeSubmissionType[];
}> {
  if (!session || !session.user?.email) {
    redirect('/auth?callbackUrl=/overtime-submissions');
  }

  const filteredSearchParams = Object.fromEntries(
    Object.entries(searchParams).filter(
      ([_, value]) => value !== undefined,
    ) as [string, string][],
  );

  // Add userEmail and userRoles to query params
  if (session.user.email) {
    filteredSearchParams.userEmail = session.user.email;
  }
  if (session.user.roles) {
    filteredSearchParams.userRoles = session.user.roles.join(',');
  }

  const queryParams = new URLSearchParams(filteredSearchParams).toString();
  const res = await fetch(
    `${process.env.API}/overtime-submissions?${queryParams}`,
    {
      next: { revalidate: 0, tags: ['overtime-submissions'] },
    },
  );

  if (!res.ok) {
    const json = await res.json();
    throw new Error(
      `getOvertimeSubmissions error: ${res.status} ${res.statusText} ${json.error}`,
    );
  }

  const fetchTime = new Date(res.headers.get('date') || '');
  const fetchTimeLocaleString = formatDateTime(fetchTime);

  const overtimeSubmissionsLocaleString: OvertimeSubmissionType[] =
    await res.json();

  return {
    fetchTime,
    fetchTimeLocaleString,
    overtimeSubmissionsLocaleString,
  };
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

  const { fetchTime, overtimeSubmissionsLocaleString } =
    await getOvertimeSubmissions(session, searchParams);

  // Get user roles
  const userRoles = session.user?.roles ?? [];
  const isManager = userRoles.some(
    (role: string) =>
      role.toLowerCase().includes('manager') ||
      role.toLowerCase().includes('group-leader'),
  );
  const isAdmin = userRoles.includes('admin');
  const isHR = userRoles.includes('hr');

  // Calculate overtime summary based on filters
  const selectedMonth = searchParams.month;
  const selectedYear = searchParams.year;
  const selectedEmployee = searchParams.employee;

  // Check if a single employee is selected (not multiple)
  const isSingleEmployee = selectedEmployee && !selectedEmployee.includes(',');

  // Calculate overtime summary directly from filtered submissions
  // This ensures the summary matches the filtered data being displayed
  const overtimeSummary = await calculateSummaryFromSubmissions(
    overtimeSubmissionsLocaleString,
    selectedMonth,
    selectedYear,
    searchParams.onlyOrders === 'true',
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
  const hasTimeFilters = !!(
    searchParams.year ||
    searchParams.month ||
    searchParams.week
  );

  const onlyMySubmissionsAlone = !!(
    searchParams.onlyMySubmissions &&
    !searchParams.status &&
    !searchParams.employee &&
    !searchParams.manager &&
    !searchParams.assignedToMe &&
    !searchParams.pendingSettlements &&
    !searchParams.onlyOrders
  );

  const showBothCards = Boolean(
    !hasTimeFilters &&
      (!hasActiveFilters ||
        onlyMySubmissionsAlone ||
        (isSingleEmployee &&
          !searchParams.status &&
          !searchParams.manager &&
          !searchParams.onlyMySubmissions &&
          !searchParams.assignedToMe &&
          !searchParams.pendingSettlements &&
          !searchParams.onlyOrders)),
  );

  // Calculate counts from filtered submissions to respect active filters
  const assignedToMeCount = overtimeSubmissionsLocaleString.filter(
    (s) => s.supervisor === session.user.email,
  ).length;

  const assignedToMePendingCount = overtimeSubmissionsLocaleString.filter(
    (s) =>
      s.supervisor === session.user.email &&
      (s.status === 'pending' || s.status === 'pending-plant-manager'),
  ).length;

  const pendingSettlementsCount = overtimeSubmissionsLocaleString.filter(
    (s) => s.status === 'approved',
  ).length;

  const ordersCount = overtimeSubmissionsLocaleString.filter(
    (s) => s.payment || s.scheduledDayOff,
  ).length;

  const onlyMySubmissionsCount = overtimeSubmissionsLocaleString.filter(
    (s) => s.submittedBy === session.user.email,
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

  const selectedEmployeeEmail = isSingleEmployee ? selectedEmployee : null;
  const onlyMySubmissions = searchParams.onlyMySubmissions === 'true';
  const onlyOrders = searchParams.onlyOrders === 'true';

  return (
    <Card>
      <CardHeader className='pb-2'>
        <div className='mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
          <CardTitle>{dict.pageTitle}</CardTitle>
          <CardDescription>{dict.testWarning}</CardDescription>
          <div className='flex flex-col gap-2 sm:flex-row sm:items-center'>
            {session && canCreateSubmission ? (
              <>
                <LocalizedLink href='/overtime-submissions/add-overtime'>
                  <Button variant={'outline'} className='w-full sm:w-auto'>
                    <Plus /> <span>{dict.addOvertime}</span>
                  </Button>
                </LocalizedLink>
                <LocalizedLink href='/overtime-submissions/add-work-order'>
                  <Button variant={'outline'} className='w-full sm:w-auto'>
                    <Plus /> <span>{dict.addWorkOrder}</span>
                  </Button>
                </LocalizedLink>
              </>
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
