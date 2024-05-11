import { Locale } from '@/i18n.config';
// import { getDictionary } from '@/lib/dictionary';
import { User, columns } from './table/columns';
import { DataTable } from './table/data-table';

async function getData(
  lang: string,
): Promise<{ fetchTime: string; allUsers: User[] }> {
  try {
    const response = await fetch(`${process.env.API}/admin/get-all-users`, {
      next: { revalidate: 60 * 15, tags: ['users'] },
    });

    const dateFromResponse = new Date(response.headers.get('date') || '');
    const fetchTime = dateFromResponse.toLocaleString(lang);

    let allUsers = await response.json();

    let allRoles: string[] = allUsers.reduce((roles: string[], user: User) => {
      return [...roles, ...(user.roles ?? [])];
    }, []);
    // @ts-ignore
    allRoles = [...new Set(allRoles)];

    allUsers = allUsers.map((user: User) => {
      let rolesObj: { [key: string]: string } = {};
      allRoles.forEach((role: string) => {
        rolesObj[role] = (user.roles ?? []).includes(role) ? 'X' : '';
      });
      return { ...user, ...rolesObj };
    });
    return { fetchTime, allUsers };
  } catch (error) {
    throw new Error('Fetching all capa error: ' + error);
  }
}

export default async function CapaPage({
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
