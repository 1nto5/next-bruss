import { auth } from '@/auth';
import { Locale } from '@/i18n.config';
import { getDictionary } from '@/lib/dictionary';
import { redirect } from 'next/navigation';
import ReworkCard from './components/rework-card';

export default async function Rework({
  params: { lang },
}: {
  params: { lang: Locale };
}) {
  const dict = await getDictionary(lang);
  const session = await auth();

  if (!session?.user.email) {
    redirect('/auth');
  }

  return <ReworkCard cDict={dict.rework} userEmail={session?.user.email} />;
}
