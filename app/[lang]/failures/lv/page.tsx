// import { auth } from '@/lib/auth';
import { Locale } from '@/lib/config/i18n';
import { getDictionary } from '../lib/dict';
import { createColumns } from './components/table/columns';
import { DataTable } from './components/table/data-table';
import { FailureOptionType, FailureType } from './lib/failures-types';

async function getFailuresOptions(): Promise<FailureOptionType[]> {
  const res = await fetch(`${process.env.API}/failures/lv/options`, {
    next: {
      revalidate: 60 * 60 * 8,
      // revalidate: 0,
      tags: ['failures-lv-options'],
    },
  });

  if (!res.ok) {
    const json = await res.json();
    throw new Error(
      `getFailuresOptions error: ${res.status} ${res.statusText} ${json.error}`,
    );
  }

  const failuresOptions: FailureOptionType[] = await res.json();
  return failuresOptions;
}

async function getFailures(
  lang: string,
  searchParams: { [key: string]: string | undefined },
): Promise<{
  fetchTime: Date;
  fetchTimeLocaleString: string;
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

  const fetchTime = new Date(res.headers.get('date') || '');
  const fetchTimeLocaleString = fetchTime.toLocaleString(process.env.DATE_TIME_LOCALE);

  const failures: FailureType[] = await res.json();

  const formatTime = (failure: FailureType) => {
    return {
      ...failure,
      fromLocaleString: new Date(failure.from).toLocaleString(process.env.DATE_TIME_LOCALE),
      toLocaleString: failure.to
        ? new Date(failure.to).toLocaleString(process.env.DATE_TIME_LOCALE)
        : '',
      createdAtLocaleString: new Date(failure.createdAt).toLocaleString(process.env.DATE_TIME_LOCALE),

      updatedAtLocaleString: failure.updatedAt
        ? new Date(failure.updatedAt).toLocaleString(process.env.DATE_TIME_LOCALE)
        : '',
    };
  };
  const formattedFailures: FailureType[] = failures.map(formatTime);
  return { fetchTime, fetchTimeLocaleString, formattedFailures };
}

export default async function FailuresPage(props: {
  params: Promise<{ lang: Locale }>;
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  // const session = await auth();
  const params = await props.params;
  const searchParams = await props.searchParams;

  const { lang } = params;

  const dict = await getDictionary(lang);

  let fetchTime, fetchTimeLocaleString, formattedFailures;
  ({ fetchTime, fetchTimeLocaleString, formattedFailures } = await getFailures(
    lang,
    searchParams,
  ));

  const failuresOptions = await getFailuresOptions();

  const columns = createColumns(dict);

  return (
    <DataTable
      columns={columns}
      data={formattedFailures}
      fetchTimeLocaleString={fetchTimeLocaleString}
      fetchTime={fetchTime}
      failuresOptions={failuresOptions}
      dict={dict}
    />
  );
}
