import { Locale } from '@/i18n.config';
// import { getDictionary } from '@/lib/dictionary';
import { auth } from '@/auth';
import { DeviationType } from '@/lib/types/deviation';
import { redirect } from 'next/navigation';
import Deviation from './components/deviation-view';

async function getDeviation(
  id: string,
  lang: string,
): Promise<{
  fetchTime: string;
  deviation: DeviationType;
}> {
  const res = await fetch(`${process.env.API}/deviations/deviation?id=${id}`, {
    next: { revalidate: 15, tags: ['deviation'] },
  });

  if (!res.ok) {
    const json = await res.json();
    throw new Error(
      `getDeviation error:  ${res.status}  ${res.statusText} ${json.error}`,
    );
  }

  const dateFromResponse = new Date(res.headers.get('date') || '');
  const fetchTime = dateFromResponse.toLocaleString(lang);

  const data = await res.json();
  return { fetchTime, deviation: data };
}

export default async function EditDeviationPage({
  params: { lang, id },
}: {
  params: { lang: Locale; id: string };
}) {
  // const dict = await getDictionary(lang);
  const { fetchTime, deviation } = await getDeviation(id, lang);
  if (deviation === null) {
    redirect('/deviations');
  }
  const session = await auth();

  return (
    <Deviation
      deviation={deviation}
      lang={lang}
      session={session}
      fetchTime={fetchTime}
    />
  );
}
