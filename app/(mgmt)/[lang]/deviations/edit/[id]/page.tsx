import { Locale } from '@/i18n.config';
// import { getDictionary } from '@/lib/dictionary';
import EditDeviation from './components/EditDeviation';
import { DeviationReasonType } from '@/lib/types/deviation';
import Container from '@/components/ui/container';
import { findDeviation, redirectToDeviations } from './actions';

async function getReasons(): Promise<DeviationReasonType[]> {
  const res = await fetch(`${process.env.API}/deviations/get-reasons`, {
    next: { revalidate: 60 * 60 * 8, tags: ['deviationReasons'] },
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

  return (
    <Container>
      <main className='flex justify-center'>
        <EditDeviation reasons={deviationReasons} deviation={deviation} />
      </main>
    </Container>
  );
}
