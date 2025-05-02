import { auth } from '@/auth';
import { Locale } from '@/i18n.config';
import { redirect } from 'next/navigation';

export const metadata = {
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
  if (!session) {
    redirect('/auth');
  }
  const access =
    session.user?.roles.includes('group-leader') ||
    session.user?.roles.includes('plant-manager') ||
    false;
  if (access === false) {
    redirect('/projects');
  }

  return <div className='flex justify-center'>{children}</div>;
}
