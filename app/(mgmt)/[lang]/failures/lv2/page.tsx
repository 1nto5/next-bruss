import { Locale } from '@/i18n.config';
import { FailureTableDataType, FailureType } from '@/lib/z/failure';
import { columns } from './table/columns';
import { DataTable } from './table/data-table';

async function getFailures(
  lang: string,
  searchParams: { [key: string]: string | undefined },
): Promise<{
  fetchTime: string;
  formattedFailures: FailureTableDataType[];
}> {
  const res = await fetch(`${process.env.API}/failures-lv2`, {
    next: { revalidate: 600, tags: ['failures-lv2'] },
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

  const { station, failure, supervisor, responsible } = searchParams;
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

  const formatTime = (failure: FailureType) => ({
    ...failure,
    from: new Date(failure.from).toLocaleString(lang),
    to: new Date(failure.to).toLocaleString(lang),
  });

  const formattedFailures: FailureTableDataType[] = failures.map(formatTime);

  return { fetchTime, formattedFailures };
}

export default async function DeviationsPage(props: {
  params: Promise<{ lang: Locale }>;
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
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
      lang={lang}
    />
  );
}
