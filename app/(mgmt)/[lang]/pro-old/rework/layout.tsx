import { auth } from '@/auth';
import { Locale } from '@/i18n.config';
import { getDictionary } from '@/lib/dictionary';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import Info from '../../components/welcome-alert';

export const metadata: Metadata = {
  title: 'rework (BRUSS)',
};

export default async function Layout(props: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const params = await props.params;

  const { lang } = params;

  const { children } = props;

  const dict = await getDictionary(lang as Locale);
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
  if (!session?.user?.roles?.includes('rework')) {
    return (
      <div className='flex justify-center'>
        <Info title={dict.noAccessTitle} description={noAccess} />
      </div>
    );
  }
  return <div className='flex justify-center'>{children}</div>;
}
