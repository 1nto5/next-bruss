import { Locale } from '@/i18n.config';
// import { getDictionary } from '@/lib/dictionary';
import { redirect } from 'next/navigation';
import { getCapa } from '../../actions';
import EditCapa from './components/edit-capa';

export default async function EditCapaPage(
  props: {
    params: Promise<{ lang: Locale; articleNumber: string }>;
  }
) {
  const params = await props.params;

  const {
    lang,
    articleNumber
  } = params;

  // const dict = await getDictionary(lang);
  const capa = await getCapa(articleNumber);
  if (!capa || !capa.edited) {
    redirect('/capa');
  }
  if (capa.edited) {
    const edited = capa.edited;
    capa.edited = {
      date: new Date(edited.date).toLocaleString(lang),
      email: edited.email,
    };
  }

  return <EditCapa data={capa} />;
}
