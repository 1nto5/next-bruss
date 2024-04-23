import { Locale } from '@/i18n.config';
// import { getDictionary } from '@/lib/dictionary';
import EditCapa from './components/EditCapa';
import { getCapa } from '../../actions';
import { redirect } from 'next/navigation';

export default async function EditCapaPage({
  params: { lang, articleNumber },
}: {
  params: { lang: Locale; articleNumber: string };
}) {
  // const dict = await getDictionary(lang);
  const capa = await getCapa(articleNumber);
  if (!capa || !capa.editHistory) {
    redirect('/capa');
  }
  if (capa.editHistory && capa.editHistory.length > 0) {
    const lastEdit = capa.editHistory[0];
    delete capa.editHistory;
    capa.lastEdit = {
      ...lastEdit,
      date: new Date(lastEdit.date).toLocaleString(lang),
    };
  }

  return (
    <main className='m-2 flex justify-center'>
      <EditCapa data={capa} />
    </main>
  );
}
