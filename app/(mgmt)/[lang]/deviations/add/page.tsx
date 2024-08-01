import { Locale } from '@/i18n.config';
// import { getDictionary } from '@/lib/dictionary';
import { DeviationReasonType } from '@/lib/types/deviation';
import AddDeviation from './components/AddDeviation';

async function getReasons(): Promise<DeviationReasonType[]> {
  const res = await fetch(`${process.env.API}/deviations/get-reasons`, {
    next: { revalidate: 0, tags: ['deviationReasons'] }, // TODO: add revalidate time
  });

  if (!res.ok) {
    const json = await res.json();
    throw new Error(
      `getReasons error:  ${res.status}  ${res.statusText} ${json.error}`,
    );
  }
  const data = await res.json();
  return data;
}

export default async function AddDeviationPage({
  params: { lang },
}: {
  params: { lang: Locale };
}) {
  // const dict = await getDictionary(lang);
  const deviationReasons = await getReasons();
  return <AddDeviation reasons={deviationReasons} />;
}
