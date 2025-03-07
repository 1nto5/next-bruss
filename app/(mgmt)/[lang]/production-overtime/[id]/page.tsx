import { Locale } from '@/i18n.config';
// import { getDictionary } from '@/lib/dictionary';
import { auth } from '@/auth';

import { redirect } from 'next/navigation';
import { OvertimeType } from '../lib/production-overtime-types';
import Overtime from './components/overtime-view';

async function getOvertime(
  id: string,
  lang: string,
): Promise<{
  fetchTime: string;
  overtime: OvertimeType;
}> {
  const res = await fetch(
    `${process.env.API}/production-overtime/request?id=${id}`,
    {
      next: { revalidate: 15, tags: ['overtime'] },
    },
  );

  if (!res.ok) {
    const json = await res.json();
    throw new Error(
      `getOvertime error:  ${res.status}  ${res.statusText} ${json.error}`,
    );
  }

  const dateFromResponse = new Date(res.headers.get('date') || '');
  const fetchTime = dateFromResponse.toLocaleString(lang);

  const data = await res.json();
  return { fetchTime, overtime: data };
}

export default async function ProductionOvertimePage(props: {
  params: Promise<{ lang: Locale; id: string }>;
}) {
  const params = await props.params;

  const { lang, id } = params;

  // const dict = await getDictionary(lang);
  const { fetchTime, overtime } = await getOvertime(id, lang);
  if (overtime === null) {
    redirect('/overtimes');
  }
  const session = await auth();

  return (
    <Overtime
      overtime={overtime}
      lang={lang}
      session={session}
      fetchTime={fetchTime}
    />
  );
}
