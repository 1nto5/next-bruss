import { auth } from '@/auth';
import FormContainer from '@/components/ui/form-container';
import { Locale } from '@/i18n.config';
import { getDictionary } from '@/lib/dictionary';
import { redirect } from 'next/navigation';
import Info from '../../components/info';

export const metadata = {
  title: 'Persons config (Next BRUSS)',
};

export default async function Layout({
  children,
  params: { lang },
}: {
  children: React.ReactNode;
  params: { lang: Locale };
}) {
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
  if (!session?.user.roles?.includes('persons-config')) {
    return (
      <FormContainer>
        <Info title={dict.noAccessTitle} description={noAccess} />
      </FormContainer>
    );
  }
  return <FormContainer>{children}</FormContainer>;
}
