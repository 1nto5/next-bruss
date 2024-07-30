import { Locale } from '@/i18n.config';
// import { getDictionary } from '@/lib/dictionary';
import Container from '@/components/ui/container';
import { DeviationReasonType } from '@/lib/types/deviation';
import { findDeviation } from './actions';
import EditDeviation from './components/EditDeviation';

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

  return (
    <Container>
      <main className='flex justify-center'>
        <EditDeviation reasons={deviationReasons} deviation={deviation} />
      </main>
    </Container>
  );
}
