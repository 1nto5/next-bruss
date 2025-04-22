import { auth } from '@/auth';
import { Locale } from '@/i18n.config';
// import { getDictionary } from '@/lib/dictionary';
import { redirect } from 'next/navigation';
// import Info from '../../components/Info';

export const metadata = {
  title: 'Nowa akcja korygująca (BRUSS)',
};

export default async function Layout(props: {
  children: React.ReactNode;
  params: Promise<{ lang: Locale }>;
}) {
  const params = await props.params;

  const { lang } = params;

  const { children } = props;

  // const dict = await getDictionary(lang);

  const session = await auth();
  if (!session) {
    redirect('/auth');
  }

  return <main className='flex justify-center'>{children}</main>;
}
