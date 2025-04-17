import { Locale } from '@/i18n.config';
// import { getDictionary } from '@/lib/dictionary';
import { DeviationReasonType } from '@/lib/types/deviation';
import AddDeviationForm from './components/add-deviation-form';

async function getReasons(): Promise<DeviationReasonType[]> {
  const res = await fetch(`${process.env.API}/deviations/reasons`, {
    next: { revalidate: 60 * 60 * 24, tags: ['deviationReasons'] },
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

export default async function AddDeviationPage(props: {
  params: Promise<{ lang: Locale }>;
}) {
  const params = await props.params;

  const { lang } = params;

  // const dict = await getDictionary(lang);
  const deviationReasons = await getReasons();
  return <AddDeviationForm reasons={deviationReasons} />;
}
