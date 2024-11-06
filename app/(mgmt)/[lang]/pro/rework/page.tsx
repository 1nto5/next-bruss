import { auth } from '@/auth';
import { Locale } from '@/i18n.config';
import { getDictionary } from '@/lib/dictionary';
import { redirect } from 'next/navigation';
import ReworkCard from './components/rework-card';

export default async function Rework(
  props: {
    params: Promise<{ lang: Locale }>;
  }
) {
  const params = await props.params;

  const {
    lang
  } = params;

  const dict = await getDictionary(lang);
  const session = await auth();

  if (!session?.user.email) {
    redirect('/auth');
  }

  return <ReworkCard cDict={dict.rework} userEmail={session?.user.email} />;
}
