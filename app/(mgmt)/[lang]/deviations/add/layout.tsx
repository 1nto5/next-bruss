import { auth } from '@/auth';
import FormContainer from '@/components/ui/form-container';
import { Locale } from '@/i18n.config';
import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Nowe odchylenie (Next BRUSS)',
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

  // const dict = await getDictionary(lang);

  const session = await auth();
  if (!session) {
    redirect('/auth');
  }

  return <FormContainer>{children}</FormContainer>;
}
