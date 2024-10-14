import { Locale } from '@/i18n.config';
// import { getDictionary } from '@/lib/dictionary';
import { UsersListType } from '@/lib/types/user';
import AddCorrectiveAction from './components/add-corrective-action';

async function getUsers(): Promise<UsersListType> {
  const res = await fetch(`${process.env.API}/users`, {
    next: { revalidate: 0, tags: ['users'] }, // TODO: add revalidate time
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

export default async function AddDeviationPage({
  params: { lang, id },
}: {
  params: { lang: Locale; id: string };
}) {
  // const dict = await getDictionary(lang);
  const users = await getUsers();
  return <AddCorrectiveAction id={id} users={users} />;
}
