import { auth } from '@/auth';
import { Locale } from '@/i18n.config';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: "New Entry - Adrian's Projects (BRUSS)",
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
  if (!session || !session.user || !session.user.email) {
    redirect('/auth');
  }
  const access = session.user.email === 'adrian.antosiak@bruss-group.com';
  if (access === false) {
    redirect(`/projects`);
  }

  return <div className='flex justify-center'>{children}</div>;
}
