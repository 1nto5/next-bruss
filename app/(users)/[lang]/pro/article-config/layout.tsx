import { auth } from '@/auth';
import { Locale } from '@/i18n.config';
import { getDictionary } from '@/lib/dictionary';

import Info from '../../components/Info';

export const metadata = {
  title: 'rework (Next BRUSS)',
};

export default async function Layout({
  children,
  params: { lang },
}: {
  children: React.ReactNode;
  params: { lang: Locale };
}) {
  const dict = await getDictionary(lang);
  const cDict = dict.articleConfig;
  const infoDescription = (
    <>
      {cDict.noAccess}{' '}
      <a
        href={`mailto:support@bruss-group.com?subject=Next BRUSS: uprawnienia rework`}
        className='text-blue-600 hover:text-blue-800'
      >
        support@bruss-group.com
      </a>
      .
    </>
  );
  const session = await auth();
  if (!session?.user.roles?.includes('article-config')) {
    return (
      <main className='m-2 flex justify-center'>
        <Info title='Brak uprawnień!' description={infoDescription} />
      </main>
    );
  }
  return <>{children}</>;
}
