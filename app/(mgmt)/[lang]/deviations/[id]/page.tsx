import { Locale } from '@/i18n.config';
// import { getDictionary } from '@/lib/dictionary';
import { auth } from '@/auth';
import { DeviationReasonType, DeviationType } from '@/lib/types/deviation';
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

async function getDeviation(id: string): Promise<DeviationType> {
  const res = await fetch(
    `${process.env.API}/deviations/get-deviation?id=${id}`,
    {
      next: { revalidate: 0, tags: ['deviation'] },
    },
  );

  if (!res.ok) {
    throw new Error('getting deviation reasons: ' + res.status);
  }

  const data = await res.json();
  // const convertedData = {
  //   ...data,
  //   id: data._id,
  //   timePeriod: {
  //     from: new Date(data.timePeriod.from),
  //     to: new Date(data.timePeriod.to),
  //   },
  //   createdAt: new Date(data.createdAt),
  // };
  return data;
}

export default async function EditDeviationPage({
  params: { lang, id },
}: {
  params: { lang: Locale; id: string };
}) {
  // const dict = await getDictionary(lang);
  const deviationReasons = await getReasons();
  const deviation = await getDeviation(id);
  if (deviation === null) {
    redirect('/deviations');
  }
  const session = await auth();

  return (
    <Deviation
      reasons={deviationReasons}
      deviation={deviation}
      lang={lang}
      session={session}
    />
  );
}
