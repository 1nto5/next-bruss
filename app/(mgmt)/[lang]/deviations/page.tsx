import {
  ApprovalType,
  DeviationType,
} from '@/app/(mgmt)/[lang]/deviations/lib/types';
import { auth } from '@/auth';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Locale } from '@/i18n.config';
import { Session } from 'next-auth';
import TableFilteringAndOptions from './components/table-filtering-and-options';
import { columns } from './components/table/columns';
import { DataTable } from './components/table/data-table';
import {
  getConfigAreaOptions,
  getConfigReasonOptions,
} from './lib/get-configs';

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
  const res = await fetch(
    `${process.env.API}/deviations/deviations?${queryParams}`,
    {
      next: { revalidate: 30, tags: ['deviations'] },
    },
  );

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
  const res = await fetch(
    `${process.env.API}/deviations/deviations?${queryParams}`,
    {
      next: { revalidate: 30, tags: ['deviations'] },
    },
  );

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
  const reasonOptions = await getConfigReasonOptions();
  const areaOptions = await getConfigAreaOptions();
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
        <CardTitle>Odchylenia</CardTitle>
        <CardDescription>
          Ostatnia synchronizacja: {fetchTimeLocaleString}
        </CardDescription>
        <TableFilteringAndOptions
          fetchTime={fetchTime}
          isLogged={!!session}
          userEmail={session?.user?.email || undefined}
        />
      </CardHeader>
      <DataTable
        columns={columns}
        data={deviations}
        fetchTimeLocaleString={fetchTimeLocaleString}
        lang={lang}
        reasonOptions={reasonOptions}
        areaOptions={areaOptions}
      />
    </Card>
  );
}
