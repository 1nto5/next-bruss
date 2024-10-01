import { Locale } from '@/i18n.config';
// import { getDictionary } from '@/lib/dictionary';
import { ObjectId } from 'mongodb';
import { redirect } from 'next/navigation';
import { getUser } from '../../actions';
import EditUser from './components/EditUser';

export default async function EditUserPage({
  params: { lang, userId },
}: {
  params: { lang: Locale; userId: string };
}) {
  // const dict = await getDictionary(lang);
  let user = await getUser(new ObjectId(userId));
  if (!user) {
    redirect('/admin/users');
  }

  return (
    <EditUser
      userObject={{
        _id: user._id.toString(),
        email: user.email,
        roles: user.roles,
      }}
    />
  );
}
