import { Locale } from '@/i18n.config';
// import { getDictionary } from '@/lib/dictionary';
import { UserType } from '@/lib/types/user';
import { User } from 'next-auth';
import { columns } from './table/columns';
import { DataTable } from './table/data-table';

async function getData(
  lang: string,
): Promise<{ fetchTime: string; allUsers: UserType[] }> {
  try {
    const response = await fetch(`${process.env.API}/admin/all-users`, {
      next: { revalidate: 60 * 15, tags: ['users'] },
    });

    const dateFromResponse = new Date(response.headers.get('date') || '');
    const fetchTime = dateFromResponse.toLocaleString(lang);

    let allUsers = await response.json();

    return { fetchTime, allUsers };
  } catch (error) {
    throw new Error('Fetching all users error: ' + error);
  }
}

export default async function AdminUsersPage({
  params: { lang },
}: {
  params: { lang: Locale };
}) {
  const { fetchTime, allUsers } = await getData(lang);
  return (
    // <main className='m-2 flex justify-center'>
    //   {' '}
    // container
    <div className='mx-auto px-12 py-4 lg:px-24'>
      <DataTable columns={columns} data={allUsers} fetchTime={fetchTime} />
    </div>
    // </main>
  );
}
