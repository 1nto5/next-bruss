import { Locale } from '@/i18n.config';
// import { getDictionary } from '@/lib/dictionary';
import EditCapa from './components/EditCapa';
// import { findDraftDeviation } from '../actions';
import { redirect } from 'next/navigation';

export default async function EditCapaPage({
  params: { lang, articleNumber },
}: {
  params: { lang: Locale; articleNumber: string };
}) {
  // const dict = await getDictionary(lang);
  // const capa = await getCapa(articleNumber);
  // if (!capa || !capa.edited) {
  //   redirect('/capa');
  // }
  // if (capa.edited) {
  //   const edited = capa.edited;
  //   capa.edited = {
  //     date: new Date(edited.date).toLocaleString(lang),
  //     email: edited.email,
  //   };
  // }

  return (
    <main className='m-2 flex justify-center'>
      {/* <EditCapa data={capa} /> */}
    </main>
  );
}
