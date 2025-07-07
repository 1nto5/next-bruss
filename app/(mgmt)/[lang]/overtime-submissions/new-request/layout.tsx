import { auth } from '@/auth';
import { Locale } from '@/i18n.config';
import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Zgłoszenie przepracowanych godzin nadliczbowych (BRUSS)',
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

  // All logged-in users can submit overtime hours
  // No additional role restrictions needed

  return <div className='flex justify-center'>{children}</div>;
}
