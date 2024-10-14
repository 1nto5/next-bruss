import { auth } from '@/auth';
import FormContainer from '@/components/ui/form-container';
import { Locale } from '@/i18n.config';
import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Nowe odchylenie (Next BRUSS)',
};

export default async function Layout({
  children,
  params: { lang },
}: {
  children: React.ReactNode;
  params: { lang: Locale };
}) {
  // const dict = await getDictionary(lang);

  const session = await auth();
  if (!session) {
    redirect('/auth');
  }

  return <FormContainer>{children}</FormContainer>;
}
