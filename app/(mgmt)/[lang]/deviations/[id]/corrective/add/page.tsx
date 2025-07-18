import { auth } from '@/auth';
import { Locale } from '@/i18n.config';
import { getUsers } from '@/lib/get-users';
import { redirect } from 'next/navigation';
import AddCorrectiveActionForm from '../../../components/add-corrective-action-form';

export default async function AddDeviationPage(props: {
  params: Promise<{ lang: Locale; id: string }>;
}) {
  const session = await auth();
  if (!session) {
    redirect('/auth?callbackUrl=/deviations');
  }
  const params = await props.params;

  const { lang, id } = params;

  // const dict = await getDictionary(lang);
  const users = await getUsers();
  return <AddCorrectiveActionForm id={id} users={users} />;
}
