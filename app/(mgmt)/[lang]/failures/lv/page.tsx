// import { auth } from '@/auth';
import { Locale } from '@/i18n.config';
import { columns } from './components/table/columns';
import { DataTable } from './components/table/data-table';
import { FailureType } from './lib/types-failures';

async function getFailures(
  lang: string,
  searchParams: { [key: string]: string | undefined },
): Promise<{
  fetchTime: string;
  formattedFailures: FailureType[];
}> {
  const filteredSearchParams = Object.fromEntries(
    Object.entries(searchParams).filter(
      ([_, value]) => value !== undefined,
    ) as [string, string][],
  );

  const queryParams = new URLSearchParams(filteredSearchParams).toString();
  const res = await fetch(`${process.env.API}/failures/lv?${queryParams}`, {
    next: { revalidate: 0, tags: ['failures-lv'] },
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

  const formatTime = (failure: FailureType) => {
    return {
      ...failure,
      fromLocaleString: new Date(failure.from).toLocaleString(lang),
      toLocaleString: failure.to
        ? new Date(failure.to).toLocaleString(lang)
        : '',
      createdAtLocaleString: new Date(failure.createdAt).toLocaleString(lang),

      updatedAtLocaleString: failure.updatedAt
        ? new Date(failure.updatedAt).toLocaleString(lang)
        : '',
    };
  };
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
  ({ fetchTime, formattedFailures } = await getFailures(lang, searchParams));

  return (
    <DataTable
      columns={columns}
      data={formattedFailures}
      fetchTime={fetchTime}
    />
  );
}
