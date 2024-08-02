import { Locale } from '@/i18n.config';
// import { getDictionary } from '@/lib/dictionary';
import { auth } from '@/auth';
import { DeviationReasonType, DeviationType } from '@/lib/types/deviation';
import { redirect } from 'next/navigation';
import Deviation from './components/Deviation';

async function getDeviation(id: string): Promise<DeviationType> {
  const res = await fetch(
    `${process.env.API}/deviations/get-deviation?id=${id}`,
    {
      next: { revalidate: 0, tags: ['deviation'] },
    },
  );

  if (!res.ok) {
    const json = await res.json();
    throw new Error(
      `getDeviation error:  ${res.status}  ${res.statusText} ${json.error}`,
    );
  }

  const data = await res.json();
  return data;
}

export default async function EditDeviationPage({
  params: { lang, id },
}: {
  params: { lang: Locale; id: string };
}) {
  // const dict = await getDictionary(lang);
  const deviation = await getDeviation(id);
  if (deviation === null) {
    redirect('/deviations');
  }
  const session = await auth();

  return <Deviation deviation={deviation} lang={lang} session={session} />;
}
