import { Locale } from '@/i18n.config';
// import { getDictionary } from '@/lib/dictionary';
import { columns } from './table/columns';
import { DataTable } from './table/data-table';
// import { extractNameFromEmail } from '@/lib//utils/nameFormat';
import { auth } from '@/auth';
import { ApprovalType, DeviationType } from '@/lib/types/deviation';
import { Session } from 'next-auth';

async function getAllDeviations(lang: string): Promise<{
  fetchTime: string;
  deviations: DeviationType[];
}> {
  const res = await fetch(`${process.env.API}/deviations/get-deviations`, {
    next: { revalidate: 60 * 15, tags: ['deviations'] },
  });

  if (!res.ok) {
    throw new Error('getAllDeviations fetch res: ' + res.status);
  }

  const dateFromResponse = new Date(res.headers.get('date') || '');
  const fetchTime = dateFromResponse.toLocaleString(lang);

  const deviations: DeviationType[] = await res.json();

  const deviationsFiltered = deviations.filter(
    (deviation: DeviationType) => deviation.status !== 'draft',
  );

  const formatDeviation = (deviation: DeviationType) => {
    const formattedTimePeriod = {
      from: new Date(deviation.timePeriod.from).toLocaleDateString(lang),
      to: new Date(deviation.timePeriod.to).toLocaleDateString(lang),
    };
    return { ...deviation, timePeriodLocalDateString: formattedTimePeriod };
  };

  const deviationsFormatted = deviationsFiltered.map(formatDeviation);

  return { fetchTime, deviations: deviationsFormatted };
}

async function getUserDeviations(
  lang: string,
  session: Session,
): Promise<{
  fetchTime: string;
  deviations: DeviationType[];
}> {
  const res = await fetch(`${process.env.API}/deviations/get-deviations`, {
    next: { revalidate: 60 * 15, tags: ['deviations'] },
  });
  if (!res.ok) {
    throw new Error('getUserDeviations res: ' + res.status);
  }
  const dateFromResponse = new Date(res.headers.get('date') || '');
  const fetchTime = dateFromResponse.toLocaleString(lang);
  const deviations: DeviationType[] = await res.json();

  const approvalMapping: { [key: string]: keyof DeviationType } = {
    'group-leader': 'groupLeaderApproval',
    'quality-manager': 'qualityManagerApproval',
    'engineering-manager': 'engineeringManagerApproval',
    'maintenance-manager': 'maintenanceManagerApproval',
    'production-manager': 'productionManagerApproval',
  };

  let deviationsToApprove: DeviationType[] = [];

  if (session.user.roles) {
    session.user.roles.forEach((role) => {
      const approvalField = approvalMapping[role];
      if (approvalField) {
        const roleDeviations = deviations
          .filter((deviation: DeviationType) => {
            const approval = deviation[approvalField] as
              | ApprovalType
              | undefined;
            return deviation.status !== 'draft' && !approval?.approved;
          })
          .map((deviation: DeviationType) => ({
            ...deviation,
            status: 'to approve',
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

  // Separate deviations into drafts owned by the user and other deviations
  const userDrafts = deviations.filter(
    (deviation: DeviationType) =>
      deviation.status === 'draft' && deviation.owner === session.user.email,
  );

  const otherDeviations = deviations.filter(
    (deviation: DeviationType) =>
      deviation.status !== 'draft' &&
      !uniqueDeviationsToApprove.find(
        (d) => d._id?.toString() === deviation._id?.toString(),
      ),
  );

  const formatDeviation = (deviation: DeviationType) => {
    const formattedTimePeriod = {
      from: new Date(deviation.timePeriod.from).toLocaleDateString(lang),
      to: new Date(deviation.timePeriod.to).toLocaleDateString(lang),
    };
    return { ...deviation, timePeriodLocalDateString: formattedTimePeriod };
  };

  const deviationsFormatted = [
    ...userDrafts,
    ...uniqueDeviationsToApprove,
    ...otherDeviations,
  ].map(formatDeviation);

  return {
    fetchTime,
    deviations: deviationsFormatted,
  };
}

export default async function DeviationsPage({
  params: { lang },
}: {
  params: { lang: Locale };
}) {
  let fetchTime, deviations;
  const session = await auth();

  if (!session) {
    ({ fetchTime, deviations } = await getAllDeviations(lang));
  } else {
    ({ fetchTime, deviations } = await getUserDeviations(lang, session));
  }

  return (
    <DataTable
      columns={columns}
      data={deviations}
      fetchTime={fetchTime}
      lang={lang}
    />
  );
}
