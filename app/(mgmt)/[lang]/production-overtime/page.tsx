// import { auth } from '@/auth';
import { Locale } from '@/i18n.config';
import { columns } from './components/table/columns';
import { DataTable } from './components/table/data-table';
import { OvertimeType } from './lib/production-overtime-types';

async function getOvertimeRequests(
  lang: string,
  searchParams: { [key: string]: string | undefined },
): Promise<{
  fetchTime: Date;
  fetchTimeLocaleString: string;
  overtimeRequestsLocaleString: OvertimeType[];
}> {
  const filteredSearchParams = Object.fromEntries(
    Object.entries(searchParams).filter(
      ([_, value]) => value !== undefined,
    ) as [string, string][],
  );

  const queryParams = new URLSearchParams(filteredSearchParams).toString();
  const res = await fetch(
    `${process.env.API}/production-overtime?${queryParams}`,
    {
      next: { revalidate: 60, tags: ['production-overtime'] },
    },
  );

  if (!res.ok) {
    const json = await res.json();
    throw new Error(
      `getFailures error: ${res.status} ${res.statusText} ${json.error}`,
    );
  }

  const fetchTime = new Date(res.headers.get('date') || '');
  const fetchTimeLocaleString = fetchTime.toLocaleString(lang);

  const overtimeRequests: OvertimeType[] = await res.json();
  const overtimeRequestsLocaleString = overtimeRequests.map(
    (overtimeRequest) => {
      return {
        ...overtimeRequest,
        fromLocaleString: new Date(overtimeRequest.from).toLocaleString(lang),
        toLocaleString: new Date(overtimeRequest.to).toLocaleString(lang),
        approvedAtLocaleString: overtimeRequest.approvedAt
          ? new Date(overtimeRequest.approvedAt).toLocaleString(lang)
          : undefined,
        requestedAtLocaleString: new Date(
          overtimeRequest.requestedAt,
        ).toLocaleString(lang),
        editedAtLocaleString: new Date(overtimeRequest.editedAt).toLocaleString(
          lang,
        ),
      };
    },
  );
  console.log('overtimeRequestsLocaleString', overtimeRequestsLocaleString);

  return { fetchTime, fetchTimeLocaleString, overtimeRequestsLocaleString };
}

export default async function FailuresPage(props: {
  params: Promise<{ lang: Locale }>;
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const params = await props.params;
  const searchParams = await props.searchParams;

  const { lang } = params;

  let fetchTime, fetchTimeLocaleString, overtimeRequestsLocaleString;
  ({ fetchTime, fetchTimeLocaleString, overtimeRequestsLocaleString } =
    await getOvertimeRequests(lang, searchParams));

  return (
    <DataTable
      columns={columns}
      data={overtimeRequestsLocaleString}
      fetchTimeLocaleString={fetchTimeLocaleString}
      fetchTime={fetchTime}
    />
  );
}
