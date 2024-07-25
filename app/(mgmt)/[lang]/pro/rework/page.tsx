import ReworkCard from './components/ReworkCard';
import { Locale } from '@/i18n.config';
import { getDictionary } from '@/lib/dictionary';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';

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

  return (
    <main className='m-2 flex justify-center'>
      <ReworkCard cDict={dict.rework} userEmail={session?.user.email} />
    </main>
  );
}
