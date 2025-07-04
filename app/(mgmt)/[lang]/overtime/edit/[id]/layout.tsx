import { auth } from '@/auth';
import { Locale } from '@/i18n.config';
import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Edycja zgłoszenia nadgodzin (BRUSS)',
};

export default async function Layout(props: {
  children: React.ReactNode;
  params: Promise<{ lang: Locale }>;
}) {
  const params = await props.params;
  const { lang } = params;
  const { children } = props;
  const session = await auth();
  if (!session) {
    redirect('/auth');
  }
  // All logged-in users can edit their overtime requests
  return <div className='flex justify-center'>{children}</div>;
}
