// import { auth } from '@/auth';
import FormContainer from '@/components/ui/form-container';
import { Locale } from '@/i18n.config';
// import { getDictionary } from '@/lib/dictionary';
// import { redirect } from 'next/navigation';
// import Info from '../../../../components/Info';

export const metadata = {
  title: 'Add article config (Next BRUSS)',
};

export default async function Layout({
  children,
  params: { lang },
}: {
  children: React.ReactNode;
  params: { lang: Locale };
}) {
  // const dict = await getDictionary(lang);
  return <FormContainer>{children}</FormContainer>;
}
