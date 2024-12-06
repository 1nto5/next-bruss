// import { auth } from '@/auth';
import { Locale } from '@/i18n.config';
import { FailureType } from '@/lib/z/failure';
import { columns } from './table/columns';
import { DataTable } from './table/data-table';

async function getFailures(
  lang: string,
  searchParams: { [key: string]: string | undefined },
): Promise<{
  fetchTime: string;
  formattedFailures: FailureType[];
}> {
  let queryParams = [];
  if (searchParams.from?.trim()) {
    queryParams.push(`from=${searchParams.from.trim()}`);
  }
  if (searchParams.to?.trim()) {
    queryParams.push(`to=${searchParams.to.trim()}`);
  }
  const queryString = queryParams.length ? `?${queryParams.join('&')}` : '';

  const res = await fetch(`${process.env.API}/failures-lv${queryString}`, {
    next: { revalidate: 300, tags: ['failures-lv'] },
  });

  if (!res.ok) {
    const json = await res.json();
    throw new Error(
      `getFailures error: ${res.status} ${res.statusText} ${json.error}`,
    );
  }

  const dateFromResponse = new Date(res.headers.get('date') || '');
  const fetchTime = dateFromResponse.toLocaleString(lang);

  let failures: FailureType[] = await res.json();

  const { line, station, failure, supervisor, responsible } = searchParams;
  if (line) {
    failures = failures.filter((failure) => failure.line === line);
  }
  if (station) {
    failures = failures.filter((failure) => failure.station === station);
  }
  if (failure) {
    failures = failures.filter((failure_) => failure_.failure === failure);
  }
  if (supervisor) {
    failures = failures.filter((failure) =>
      failure.supervisor.toLowerCase().includes(supervisor.toLowerCase()),
    );
  }
  if (responsible) {
    failures = failures.filter((failure) =>
      failure.responsible.toLowerCase().includes(responsible.toLowerCase()),
    );
  }

  // const duration = (failure: FailureType) =>
  //   Math.round(failure.to.getTime() - failure.from.getTime()) / 60000;

  const formatTime = (failure: FailureType) => ({
    ...failure,
    fromLocaleString: new Date(failure.from).toLocaleString(lang),
    toLocaleString: new Date(failure.to).toLocaleString(lang),
    duration: Math.round(
      (new Date(failure.to).getTime() - new Date(failure.from).getTime()) /
        60000,
    ),
    createdAt: new Date(failure.createdAt).toLocaleString(lang),
    updatedAt: new Date(failure.updatedAt).toLocaleString(lang),
  });

  const formattedFailures: FailureType[] = failures.map(formatTime);
  return { fetchTime, formattedFailures };
}

export default async function FailuresPage(props: {
  params: Promise<{ lang: Locale }>;
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  // const session = await auth();
  const params = await props.params;
  const searchParams = await props.searchParams;

  const { lang } = params;

  let fetchTime, formattedFailures;
  // const { number = '' } = searchParams;
  ({ fetchTime, formattedFailures } = await getFailures(lang, searchParams));

  return (
    <DataTable
      columns={columns}
      data={formattedFailures}
      fetchTime={fetchTime}
      // lang={lang}
      // session={session}
    />
  );
}
