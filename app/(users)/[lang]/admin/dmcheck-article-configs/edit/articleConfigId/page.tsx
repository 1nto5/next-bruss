import { Locale } from '@/i18n.config';
// import { getDictionary } from '@/lib/dictionary';
import EditUser from './components/EditArticleConfig';
import { getArticleConfig } from '../../actions';
import { redirect } from 'next/navigation';
import { ObjectId } from 'mongodb';

export default async function EditUserPage({
  params: { lang, userId },
}: {
  params: { lang: Locale; userId: string };
}) {
  // const dict = await getDictionary(lang);
  let user = await getArticleConfig(new ObjectId(userId));
  if (!user) {
    redirect('/admin/users');
  }

  return (
    <main className='m-2 flex justify-center'>
      <EditUser
        articleObject={{
          _id: user._id.toString(),
          email: user.email,
          roles: user.roles,
        }}
      />
    </main>
  );
}
