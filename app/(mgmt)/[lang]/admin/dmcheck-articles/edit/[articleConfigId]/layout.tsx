// import { auth } from '@/auth';
import FormContainer from '@/components/ui/form-container';
import { Locale } from '@/i18n.config';
// import { getDictionary } from '@/lib/dictionary';
// import { redirect } from 'next/navigation';
// import Info from '../../../../components/Info';

export const metadata = {
  title: 'Edit article config (Next BRUSS)',
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
  return <FormContainer>{children}</FormContainer>;
}
