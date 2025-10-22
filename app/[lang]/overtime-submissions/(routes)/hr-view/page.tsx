import { auth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Locale } from '@/lib/config/i18n';
import { formatDateTime } from '@/lib/utils/date-format';
import { getUsers } from '@/lib/data/get-users';
import { dbc } from '@/lib/db/mongo';
import { extractNameFromEmail } from '@/lib/utils/name-format';
import { ArrowLeft } from 'lucide-react';
import { Session } from 'next-auth';
import { redirect } from 'next/navigation';
import LocalizedLink from '@/components/localized-link';
import HROvertimeSummaryDisplay from '../../components/hr-overtime-summary';
import HrViewFilteringAndOptions from '../../components/hr-view-filtering-and-options';
import { OvertimeExportButton } from '../../components/overtime-export-button';
import { createColumns } from '../../components/table/columns';
import { DataTable } from '../../components/table/data-table';
import {
  calculateOrganizationOvertimeHours,
  calculateEmployeeOvertimeHours,
  HROvertimeSummary,
} from '../../lib/calculate-overtime';
import { OvertimeSubmissionType } from '../../lib/types';
import { getDictionary } from '../../lib/dict';

export const dynamic = 'force-dynamic';

async function getOvertimeSubmissionsForHR(
  session: Session,
  searchParams: { [key: string]: string | undefined },
): Promise<{
  fetchTime: Date;
  fetchTimeLocaleString: string;
  overtimeSubmissionsLocaleString: OvertimeSubmissionType[];
  hrOvertimeSummary: HROvertimeSummary;
  pendingSettlementsCount: number;
  selectedEmployee?: string;
}> {
  // Check if user has required permissions - only HR and admin
  const userRoles = session.user?.roles ?? [];
  const isAdmin = userRoles.includes('admin');
  const isHR = userRoles.includes('hr');

  if (!isAdmin && !isHR) {
    redirect('/overtime-submissions');
  }

  try {
    const coll = await dbc('overtime_submissions');

    // Calculate pending settlements count (approved but not accounted)
    const pendingSettlements = await coll
      .find({
        status: 'approved',
      })
      .toArray();
    const pendingSettlementsCount = pendingSettlements.length;

    // Build query based on filters
    const filters: any = {};

    // Pending settlements filter
    if (searchParams.pendingSettlements === 'true') {
      filters.status = 'approved';
    } else {
      // Employee filter with multi-value support
      if (searchParams.employee) {
        const employees = searchParams.employee.split(',');
        if (employees.length > 1) {
          filters.submittedBy = { $in: employees };
        } else {
          filters.submittedBy = searchParams.employee;
        }
      }

      // Week filter with multi-value support (mutually exclusive with month)
      if (searchParams.week) {
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
      // Month filter with multi-value support (mutually exclusive with week)
      else if (searchParams.month) {
        const months = searchParams.month.split(',');
        if (months.length > 1) {
          filters.$or = months.map((monthStr) => {
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

      // Year filter with multi-value support (only if no month or week filter)
      if (searchParams.year && !searchParams.month && !searchParams.week) {
        const years = searchParams.year.split(',');
        if (years.length > 1) {
          filters.$or = years.map((yearStr) => {
            const year = parseInt(yearStr);
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

      // Status filter with multi-value support
      if (searchParams.status) {
        const statuses = searchParams.status.split(',');
        if (statuses.length > 1) {
          filters.status = { $in: statuses };
        } else {
          filters.status = searchParams.status;
        }
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

    // Calculate overtime summary for HR view
    const selectedMonth = searchParams.month;
    const selectedEmployee = searchParams.employee;

    // Check if exactly one employee is selected (not multiple)
    const isSingleEmployee = selectedEmployee && !selectedEmployee.includes(',');

    const hrOvertimeSummary = isSingleEmployee
      ? await calculateEmployeeOvertimeHours(selectedEmployee, selectedMonth)
      : await calculateOrganizationOvertimeHours(selectedMonth);

    return {
      fetchTime,
      fetchTimeLocaleString,
      overtimeSubmissionsLocaleString: transformedSubmissions,
      hrOvertimeSummary,
      pendingSettlementsCount,
      selectedEmployee: isSingleEmployee ? selectedEmployee : undefined,
    };
  } catch (error) {
    console.error('Error fetching overtime submissions for HR:', error);
    throw new Error('Failed to fetch overtime submissions');
  }
}

export default async function OvertimeHRViewPage(props: {
  params: Promise<{ lang: Locale }>;
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const params = await props.params;
  const { lang } = params;
  const dict = await getDictionary(lang);
  const searchParams = await props.searchParams;
  const session = await auth();

  if (!session?.user?.email) {
    redirect('/auth?callbackUrl=/overtime-submissions');
  }

  // Fetch all users for person filter
  const users = await getUsers();

  const {
    fetchTime,
    overtimeSubmissionsLocaleString,
    hrOvertimeSummary,
    pendingSettlementsCount,
    selectedEmployee,
  } = await getOvertimeSubmissionsForHR(session, searchParams);

  return (
    <Card>
      <CardHeader className='pb-2'>
        <div className='mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
          <CardTitle>{dict.hrViewTitle}</CardTitle>
          <div className='flex flex-col gap-2 sm:flex-row sm:items-center'>
            <OvertimeExportButton
              submissions={overtimeSubmissionsLocaleString}
              dict={dict.export}
              statusDict={dict.status}
              columnLabels={dict.summaryModal}
            />
            <LocalizedLink href='/overtime-submissions'>
              <Button variant={'outline'} className='w-full sm:w-auto'>
                <ArrowLeft />
                <span>{dict.backToSubmissions}</span>
              </Button>
            </LocalizedLink>
          </div>
        </div>

        <HROvertimeSummaryDisplay
          submissions={overtimeSubmissionsLocaleString}
          dict={dict}
        />

        <HrViewFilteringAndOptions
          fetchTime={fetchTime}
          userRoles={session?.user?.roles || []}
          users={users}
          pendingSettlementsCount={pendingSettlementsCount}
          dict={dict}
        />
      </CardHeader>

      <DataTable
        columns={createColumns}
        data={overtimeSubmissionsLocaleString}
        session={session}
        dict={dict}
        fromView="hr-view"
      />
    </Card>
  );
}
