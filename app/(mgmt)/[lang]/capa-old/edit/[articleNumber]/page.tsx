import { auth } from '@/auth';
import { Locale } from '@/i18n.config';
import { getDictionary } from '@/lib/dictionary';
import { redirect } from 'next/navigation';
import Info from '../../../components/welcome-alert';
import { getCapa } from '../../actions';
import EditCapa from './components/edit-capa';

export default async function EditCapaPage(props: {
  params: Promise<{ lang: Locale; articleNumber: string }>;
}) {
  const params = await props.params;

  const { lang, articleNumber } = params;

  const dict = await getDictionary(lang);
  const noAccess = (
    <>
      {dict.noAccess}{' '}
      <a
        href={`mailto:support@bruss-group.com?subject=Next BRUSS: ${dict.noAccessMailSubject}`}
        className='text-blue-600 hover:text-blue-800'
      >
        support@bruss-group.com
      </a>
      .
    </>
  );
  const session = await auth();
  if (!session) {
    redirect('/auth');
  }
  if (!session?.user?.roles?.includes('capa')) {
    return (
      <div className='flex justify-center'>
        <Info title={dict.noAccessTitle} description={noAccess} />
      </div>
    );
  }
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
