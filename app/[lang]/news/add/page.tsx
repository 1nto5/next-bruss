import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import NewsForm from '../components/news-form';
import { getDictionary } from '@/lib/dict';
import { Locale } from '@/lib/config/i18n';

export default async function AddNewsPage(props: {
  params: Promise<{ lang: Locale }>;
}) {
  const params = await props.params;
  const { lang } = params;
  
  const session = await auth();
  
  if (!session?.user?.roles?.includes('admin')) {
    redirect(`/${lang}`);
  }
  
  const dict = await getDictionary(lang);
  
  return <NewsForm lang={lang} dict={dict} />;
}