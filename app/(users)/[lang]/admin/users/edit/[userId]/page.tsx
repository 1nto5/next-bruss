import { Locale } from '@/i18n.config';
// import { getDictionary } from '@/lib/dictionary';
import EditUser from './components/EditUser';
import { getUser } from '../../actions';
import { redirect } from 'next/navigation';

export default async function EditUserPage({
  params: { lang, userId },
}: {
  params: { lang: Locale; userId: string };
}) {
  // const dict = await getDictionary(lang);
  const user = await getUser(userId);
  if (!user) {
    redirect('/admin/users');
  }

  return (
    <main className='m-2 flex justify-center'>
      <EditUser data={user} />
    </main>
  );
}
