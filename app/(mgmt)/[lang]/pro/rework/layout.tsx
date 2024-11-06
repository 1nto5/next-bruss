import { auth } from '@/auth';
import FormContainer from '@/components/ui/form-container';
import { Locale } from '@/i18n.config';
import { getDictionary } from '@/lib/dictionary';
import { redirect } from 'next/navigation';
import Info from '../../components/info';

export const metadata = {
  title: 'rework (Next BRUSS)',
};

export default async function Layout(
  props: {
    children: React.ReactNode;
    params: Promise<{ lang: Locale }>;
  }
) {
  const params = await props.params;

  const {
    lang
  } = params;

  const {
    children
  } = props;

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
  if (!session?.user.roles?.includes('rework')) {
    return (
      <FormContainer>
        <Info title={dict.noAccessTitle} description={noAccess} />
      </FormContainer>
    );
  }
  return <FormContainer>{children}</FormContainer>;
}
