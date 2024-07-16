import { Locale } from '@/i18n.config';
// import { getDictionary } from '@/lib/dictionary';
import AddDeviation from './components/AddDeviation';
import { DeviationReasonType } from '@/lib/types/deviation';

async function getReasons(): Promise<DeviationReasonType[]> {
  try {
    const res = await fetch(`${process.env.API}/deviations/get-reasons`, {
      next: { revalidate: 60 * 60, tags: ['deviationReasons'] },
    });
    return await res.json();
  } catch (error) {
    throw new Error('Fetching all capa error: ' + error);
  }
}

export default async function AddDeviationPage({
  params: { lang },
}: {
  params: { lang: Locale };
}) {
  // const dict = await getDictionary(lang);
  const deviationReasons = await getReasons();
  return (
    <main className='m-2 flex justify-center'>
      <AddDeviation reasons={deviationReasons} />
    </main>
  );
}
