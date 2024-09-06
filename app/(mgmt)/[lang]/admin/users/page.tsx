import { Locale } from '@/i18n.config';
import { UserType } from '@/lib/types/user';
import { columns } from './table/columns';
import { DataTable } from './table/data-table';

async function getAllUsers(
  lang: string,
): Promise<{ fetchTime: string; allUsers: UserType[] }> {
  const res = await fetch(`${process.env.API}/admin/all-users`, {
    next: { revalidate: 60 * 15, tags: ['users'] },
  });

  if (!res.ok) {
    const json = await res.json();
    throw new Error(
      `getAllUsers error:  ${res.status}  ${res.statusText} ${json.error}`,
    );
  }

  const dateFromResponse = new Date(res.headers.get('date') || '');
  const fetchTime = dateFromResponse.toLocaleString(lang);

  let allUsers = await res.json();

  return { fetchTime, allUsers };
}

export default async function AdminUsersPage({
  params: { lang },
}: {
  params: { lang: Locale };
}) {
  const { fetchTime, allUsers } = await getAllUsers(lang);
  return <DataTable columns={columns} data={allUsers} fetchTime={fetchTime} />;
}
