import { Locale } from '@/i18n.config';
// import { getDictionary } from '@/lib/dictionary';
import { columns } from './table/columns';
import { DataTable } from './table/data-table';
// import { extractNameFromEmail } from '@/lib//utils/nameFormat';
import { DeviationType, ApprovalType } from '@/lib/types/deviation';
import Container from '@/components/ui/container';
import { auth } from '@/auth';
import { Session } from 'next-auth';

async function getAllDeviations(lang: string): Promise<{
  fetchTime: string;
  deviations: DeviationType[];
}> {
  const res = await fetch(`${process.env.API}/deviations/get-deviations`, {
    next: { revalidate: 0, tags: ['deviations'] },
  });

  if (!res.ok) {
    throw new Error('getting deviations: ' + res.status);
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
    return { ...deviation, timePeriod: formattedTimePeriod };
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
    next: { revalidate: 0, tags: ['deviations'] },
  });
  if (!res.ok) {
    throw new Error('getting deviations: ' + res.status);
  }
  const dateFromResponse = new Date(res.headers.get('date') || '');
  const fetchTime = dateFromResponse.toLocaleString(lang);
  const deviations: DeviationType[] = await res.json();

  const approvalMapping: { [key: string]: keyof DeviationType } = {
    'group-leader': 'groupLeaderApproval',
    'quality-manager': 'qualityManagerApproval',
    'engineering-manager': 'engineeringManagerAproval',
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
            return !approval?.approved;
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
      deviation.status !== 'draft' ||
      (deviation.status === 'draft' && deviation.owner !== session.user.email),
  );

  // Format the deviations
  const formatDeviation = (deviation: DeviationType) => {
    const formattedTimePeriod = {
      from: new Date(deviation.timePeriod.from).toLocaleDateString(lang),
      to: new Date(deviation.timePeriod.to).toLocaleDateString(lang),
    };
    return { ...deviation, timePeriod: formattedTimePeriod };
  };

  const deviationsFormatted = [
    ...userDrafts,
    ...uniqueDeviationsToApprove,
    ...otherDeviations,
  ].map(formatDeviation);

  return { fetchTime, deviations: deviationsFormatted };
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
    // <main className='mx-auto px-8 py-4 lg:px-4'>
    <Container>
      <main>
        <DataTable columns={columns} data={deviations} fetchTime={fetchTime} />
      </main>
    </Container>
  );
}
