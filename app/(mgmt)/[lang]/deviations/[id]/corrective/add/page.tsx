import { Locale } from '@/i18n.config';
// import { getDictionary } from '@/lib/dictionary';
import AddCorrectiveAction from './components/AddCorrectiveAction';

// async function getReasons(): Promise<DeviationReasonType[]> {
//   const res = await fetch(`${process.env.API}/deviations/get-reasons`, {
//     next: { revalidate: 0, tags: ['deviationReasons'] }, // TODO: add revalidate time
//   });

//   if (!res.ok) {
//     const json = await res.json();
//     throw new Error(
//       `getReasons error:  ${res.status}  ${res.statusText} ${json.error}`,
//     );
//   }
//   const data = await res.json();
//   return data;
// }

export default async function AddDeviationPage({
  params: { lang, id },
}: {
  params: { lang: Locale; id: string };
}) {
  // const dict = await getDictionary(lang);
  return <AddCorrectiveAction id={id} />;
}
