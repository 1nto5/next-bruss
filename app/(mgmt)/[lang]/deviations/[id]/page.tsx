import { Locale } from '@/i18n.config';
// import { getDictionary } from '@/lib/dictionary';
import { DeviationReasonType } from '@/lib/types/deviation';
import { redirect } from 'next/navigation';
import { findDeviation } from './actions';
import Deviation from './components/Deviation';

async function getReasons(): Promise<DeviationReasonType[]> {
  const res = await fetch(`${process.env.API}/deviations/get-reasons`, {
    next: { revalidate: 0, tags: ['deviationReasons'] }, // TODO: add revalidate time
  });

  if (!res.ok) {
    throw new Error('getting deviation reasons: ' + res.status);
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
  const deviationReasons = await getReasons();
  const deviation = await findDeviation(id);
  if (deviation === null) {
    redirect('/deviations');
  }

  return (
    <Deviation reasons={deviationReasons} deviation={deviation} lang={lang} />
  );
}
