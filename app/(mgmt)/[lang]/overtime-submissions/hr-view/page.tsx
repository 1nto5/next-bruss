import { auth } from '@/auth';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Locale } from '@/i18n.config';
import { getUsers } from '@/lib/get-users';
import { dbc } from '@/lib/mongo';
import { extractNameFromEmail } from '@/lib/utils/name-format';
import { ArrowLeft } from 'lucide-react';
import { Session } from 'next-auth';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import HROvertimeSummaryDisplay from '../components/hr-overtime-summary';
import HrViewFilteringAndOptions from '../components/hr-view-filtering-and-options';
import { createColumns } from '../components/table/columns';
import { DataTable } from '../components/table/data-table';
import {
  calculateOrganizationOvertimeHours,
  HROvertimeSummary,
} from '../lib/calculate-overtime';
import { OvertimeSubmissionType } from '../lib/types';

async function getOvertimeSubmissionsForHR(
  session: Session,
  searchParams: { [key: string]: string | undefined },
): Promise<{
  fetchTime: Date;
  fetchTimeLocaleString: string;
  overtimeSubmissionsLocaleString: OvertimeSubmissionType[];
  hrOvertimeSummary: HROvertimeSummary;
  pendingSettlementsCount: number;
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
      // Person filter
      if (searchParams.person) {
        filters.submittedBy = searchParams.person;
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

      // Status filter
      if (searchParams.status) {
        filters.status = searchParams.status;
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

    // Calculate overtime summary for HR view
    const selectedMonth = searchParams.month;
    const hrOvertimeSummary =
      await calculateOrganizationOvertimeHours(selectedMonth);

    return {
      fetchTime,
      fetchTimeLocaleString,
      overtimeSubmissionsLocaleString: transformedSubmissions,
      hrOvertimeSummary,
      pendingSettlementsCount,
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
  const searchParams = await props.searchParams;
  const session = await auth();

  if (!session?.user?.email) {
    redirect('/auth?callbackUrl=/overtime-submissions');
  }

  // Check if user has required permissions - only HR and admin
  const userRoles = session.user?.roles ?? [];
  const isAdmin = userRoles.includes('admin');
  const isHR = userRoles.includes('hr');

  if (!isAdmin && !isHR) {
    redirect('/overtime-submissions');
  }

  // Fetch all users for person filter
  const users = await getUsers();

  const {
    fetchTime,
    overtimeSubmissionsLocaleString,
    hrOvertimeSummary,
    pendingSettlementsCount,
  } = await getOvertimeSubmissionsForHR(session, searchParams);

  return (
    <Card>
      <CardHeader>
        <div className='mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
          <CardTitle>Widok HR - Zgłoszenia nadgodzin</CardTitle>
          <div className='flex flex-col gap-2 sm:flex-row sm:items-center'>
            <Link href='/overtime-submissions'>
              <Button variant={'outline'} className='w-full sm:w-auto'>
                <ArrowLeft />
                <span>Powrót do zgłoszeń</span>
              </Button>
            </Link>
          </div>
        </div>

        <HROvertimeSummaryDisplay hrOvertimeSummary={hrOvertimeSummary} />

        <HrViewFilteringAndOptions
          fetchTime={fetchTime}
          userRoles={session?.user?.roles || []}
          users={users}
          pendingSettlementsCount={pendingSettlementsCount}
        />
      </CardHeader>

      <DataTable
        columns={createColumns}
        data={overtimeSubmissionsLocaleString}
        session={session}
      />
    </Card>
  );
}
