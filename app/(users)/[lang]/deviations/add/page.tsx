import { Locale } from '@/i18n.config';
// import { getDictionary } from '@/lib/dictionary';
import AddDeviation from './components/AddDeviation';
import { DeviationReasonType } from '@/lib/types/deviation';

async function getReasons(): Promise<DeviationReasonType[]> {
  try {
    const res = await fetch(`${process.env.API}/deviations/get-reasons`, {
      next: { revalidate: 0, tags: ['deviationReasons'] },
    });

    if (!res.ok) {
      throw new Error('getting deviation reasons: ' + res.status);
    }
    const data = await res.json();
    console.log('res', res.status);
    return data;
  } catch (error) {
    console.error('getting deviation reasons:', error);
    throw error;
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
