import { auth } from '@/auth';
import { Locale } from '@/i18n.config';
import { Metadata } from 'next';
import { getDictionary } from '@/lib/dictionary';
import { redirect } from 'next/navigation';
import Info from '../../components/welcome-alert';

export const metadata: Metadata = {
  title: 'Add new CAPA (Next BRUSS)',
};

export default async function Layout(props: {
  children: React.ReactNode;
  params: Promise<{ lang: Locale }>;
}) {
  const params = await props.params;

  const { lang } = params;

  const { children } = props;

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
  return <div className='flex justify-center'>{children}</div>;
}
