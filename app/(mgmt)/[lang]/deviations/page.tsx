import {
  ApprovalType,
  DeviationType,
} from '@/app/(mgmt)/[lang]/deviations/lib/types';
import { auth } from '@/auth';
import { Button } from '@/components/ui/button'; // Import Button
import {
  Card, // Keep CardDescription import if used elsewhere, otherwise remove
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Locale } from '@/i18n.config';
import { KeyRound, Plus } from 'lucide-react'; // Import Plus icon
import { Session } from 'next-auth';
import Link from 'next/link'; // Import Link
import TableFilteringAndOptions from './components/table-filtering-and-options';
import { columns } from './components/table/columns';
import { DataTable } from './components/table/data-table';
import {
  getConfigAreaOptions,
  getConfigReasonOptions,
} from './lib/get-configs';
import { DeviationAreaType, DeviationReasonType } from './lib/types'; // Import ConfigOption

async function getAllDeviations(
  lang: string,
  searchParams: { [key: string]: string | undefined },
): Promise<{
  fetchTime: Date;
  fetchTimeLocaleString: string;
  deviations: DeviationType[];
}> {
  const filteredSearchParams = Object.fromEntries(
    Object.entries(searchParams).filter(
      ([_, value]) => value !== undefined,
    ) as [string, string][],
  );

  const queryParams = new URLSearchParams(filteredSearchParams).toString();
  const res = await fetch(`${process.env.API}/deviations/?${queryParams}`, {
    next: { revalidate: 30, tags: ['deviations'] },
  });

  if (!res.ok) {
    const json = await res.json();
    throw new Error(
      `getAllDeviations error:  ${res.status}  ${res.statusText} ${json.error}`,
    );
  }

  const fetchTime = new Date(res.headers.get('date') || '');
  const fetchTimeLocaleString = fetchTime.toLocaleString(lang);

  const deviations: DeviationType[] = await res.json();
  const deviationsFiltered = deviations.filter(
    (deviation: DeviationType) => deviation.status !== 'draft',
  );

  const formatDeviation = (deviation: DeviationType) => {
    const formattedTimePeriod = {
      from: deviation.timePeriod?.from
        ? new Date(deviation.timePeriod.from).toLocaleDateString(lang)
        : '',
      to: deviation.timePeriod?.to
        ? new Date(deviation.timePeriod.to).toLocaleDateString(lang)
        : '',
    };
    return { ...deviation, timePeriodLocalDateString: formattedTimePeriod };
  };

  const deviationsFormatted = deviationsFiltered.map(formatDeviation);

  return { fetchTime, fetchTimeLocaleString, deviations: deviationsFormatted };
}

async function getUserDeviations(
  lang: string,
  session: Session,
  searchParams: { [key: string]: string | undefined } = {},
): Promise<{
  fetchTime: Date;
  fetchTimeLocaleString: string;
  deviations: DeviationType[];
}> {
  const filteredSearchParams = Object.fromEntries(
    Object.entries(searchParams).filter(
      ([_, value]) => value !== undefined,
    ) as [string, string][],
  );

  const queryParams = new URLSearchParams(filteredSearchParams).toString();
  const res = await fetch(`${process.env.API}/deviations/?${queryParams}`, {
    next: { revalidate: 30, tags: ['deviations'] },
  });

  if (!res.ok) {
    const json = await res.json();
    throw new Error(
      `getUserDeviations error:  ${res.status}  ${res.statusText} ${json.error}`,
    );
  }

  const fetchTime = new Date(res.headers.get('date') || '');
  const fetchTimeLocaleString = fetchTime.toLocaleString(lang);
  const deviations: DeviationType[] = await res.json();

  const approvalMapping: { [key: string]: keyof DeviationType } = {
    'group-leader': 'groupLeaderApproval',
    'quality-manager': 'qualityManagerApproval',
    'production-manager': 'productionManagerApproval',
    'plant-manager': 'plantManagerApproval',
  };

  // Find deviations that need approval from the user based on their role
  let deviationsToApprove: DeviationType[] = [];
  if (session.user?.roles) {
    session.user.roles.forEach((role) => {
      const approvalField = approvalMapping[role];
      if (approvalField) {
        const roleDeviations = deviations
          .filter((deviation: DeviationType) => {
            const approval = deviation[approvalField] as
              | ApprovalType
              | undefined;
            return (
              deviation.status !== 'draft' &&
              deviation.status !== 'rejected' &&
              !approval?.approved
            );
          })
          .map((deviation: DeviationType) => ({
            ...deviation,
            status: 'to approve' as 'to approve',
          }));
        deviationsToApprove = [...deviationsToApprove, ...roleDeviations];
      }
    });
  }

  // Remove duplicates by _id
  const uniqueDeviationsToApprove = Array.from(
    new Map(
      deviationsToApprove.map((item) => [item._id?.toString(), item]),
    ).values(),
  );

  // Extract user's drafts
  const userDrafts = deviations.filter(
    (deviation: DeviationType) =>
      deviation.status === 'draft' && deviation.owner === session.user?.email,
  );

  // Get other deviations (not drafts, not waiting for user's approval)
  const otherDeviations = deviations.filter(
    (deviation: DeviationType) =>
      deviation.status !== 'draft' &&
      !uniqueDeviationsToApprove.find(
        (d) => d._id?.toString() === deviation._id?.toString(),
      ),
  );

  const formatDeviation = (deviation: DeviationType) => {
    const formattedTimePeriod = {
      from: deviation.timePeriod?.from
        ? new Date(deviation.timePeriod.from).toLocaleDateString(lang)
        : '',
      to: deviation.timePeriod?.to
        ? new Date(deviation.timePeriod.to).toLocaleDateString(lang)
        : '',
    };
    return { ...deviation, timePeriodLocalDateString: formattedTimePeriod };
  };

  // Combine all deviations in priority order:
  // 1. User's drafts
  // 2. Deviations waiting for user's approval
  // 3. All other deviations
  const allDeviationsFormatted = [
    ...userDrafts,
    ...uniqueDeviationsToApprove,
    ...otherDeviations,
  ].map(formatDeviation);

  return {
    fetchTime,
    fetchTimeLocaleString,
    deviations: allDeviationsFormatted,
  };
}

export default async function DeviationsPage(props: {
  params: Promise<{ lang: Locale }>;
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const params = await props.params;

  const { lang } = params;

  let fetchTime, fetchTimeLocaleString, deviations;
  const session = await auth();
  const reasonOptions: DeviationReasonType[] = await getConfigReasonOptions(); // Ensure type
  const areaOptions: DeviationAreaType[] = await getConfigAreaOptions(); // Ensure type
  const searchParams = await props.searchParams;

  if (!session) {
    ({ fetchTime, fetchTimeLocaleString, deviations } = await getAllDeviations(
      lang,
      searchParams,
    ));
  } else {
    ({ fetchTime, fetchTimeLocaleString, deviations } = await getUserDeviations(
      lang,
      session,
      searchParams,
    ));
  }

  return (
    <Card>
      <CardHeader>
        <div className='mb-4 flex items-center justify-between'>
          {' '}
          {/* Add flex container */}
          <CardTitle>Odchylenia w procesie produkcyjnym</CardTitle>
          {/* Add the "Add Deviation" button here, conditionally rendered */}
          {session ? (
            <Link href='/deviations/add'>
              <Button variant={'outline'}>
                <Plus /> <span>Nowe odchylenie</span>
              </Button>
            </Link>
          ) : (
            <Link href='/auth'>
              <Button variant={'outline'}>
                <KeyRound /> <span>Zaloguj by dodać odchylenie</span>
              </Button>
            </Link>
          )}
        </div>
        {/* Remove CardDescription with sync time */}
        {/* <CardDescription>
          Ostatnia synchronizacja: {fetchTimeLocaleString}
        </CardDescription> */}
        <TableFilteringAndOptions
          fetchTime={fetchTime} // Pass fetchTime for useEffect dependency
          isLogged={!!session}
          userEmail={session?.user?.email || undefined}
          areaOptions={areaOptions} // Pass areaOptions
          reasonOptions={reasonOptions} // Pass reasonOptions
        />
      </CardHeader>
      <DataTable
        columns={columns}
        data={deviations}
        fetchTimeLocaleString={fetchTimeLocaleString} // Keep prop if DataTable needs it
        lang={lang}
        reasonOptions={reasonOptions}
        areaOptions={areaOptions}
      />
    </Card>
  );
}
