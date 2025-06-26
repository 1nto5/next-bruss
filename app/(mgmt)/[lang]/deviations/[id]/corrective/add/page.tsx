import { Locale } from '@/i18n.config';
// import { getDictionary } from '@/lib/dictionary';
import { getUsers } from '@/lib/get-users';
import AddCorrectiveActionForm from '../../../components/add-corrective-action-form';

export default async function AddDeviationPage(props: {
  params: Promise<{ lang: Locale; id: string }>;
}) {
  const params = await props.params;

  const { lang, id } = params;

  // const dict = await getDictionary(lang);
  const users = await getUsers();
  return <AddCorrectiveActionForm id={id} users={users} />;
}
