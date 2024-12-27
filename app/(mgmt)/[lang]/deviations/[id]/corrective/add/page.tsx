import { Locale } from '@/i18n.config';
// import { getDictionary } from '@/lib/dictionary';
import { UsersListType } from '@/lib/types/user';
import AddCorrectiveAction from './components/add-corrective-action';

async function getUsers(): Promise<UsersListType> {
  const res = await fetch(`${process.env.API}/users`, {
    next: { revalidate: 60 * 60 * 24, tags: ['users'] },
  });

  if (!res.ok) {
    const json = await res.json();
    throw new Error(
      `getUsersEmail error:  ${res.status}  ${res.statusText} ${json.error}`,
    );
  }
  const data = await res.json();
  return data;
}

export default async function AddDeviationPage(props: {
  params: Promise<{ lang: Locale; id: string }>;
}) {
  const params = await props.params;

  const { lang, id } = params;

  // const dict = await getDictionary(lang);
  const users = await getUsers();
  return <AddCorrectiveAction id={id} users={users} />;
}
