import { Locale } from '@/i18n.config';
// import { getDictionary } from '@/lib/dictionary';
import { EmployeeType } from '@/lib/types/employee';
import { User } from 'next-auth';
import { columns } from './table/columns';
import { DataTable } from './table/data-table';

async function getPersons(
  lang: string,
): Promise<{ fetchTime: string; allUsers: EmployeeType[] }> {
  const res = await fetch(`${process.env.API}/admin/all-persons`, {
    next: { revalidate: 60 * 15, tags: ['employees'] },
  });

  if (!res.ok) {
    const json = await res.json();
    throw new Error(
      `getPersons error:  ${res.status}  ${res.statusText} ${json.error}`,
    );
  }

  const dateFromResponse = new Date(res.headers.get('date') || '');
  const fetchTime = dateFromResponse.toLocaleString(lang);

  let allUsers = await res.json();

  return { fetchTime, allUsers };
}

export default async function AdminEmployeesPage({
  params: { lang },
}: {
  params: { lang: Locale };
}) {
  const { fetchTime, allUsers } = await getPersons(lang);
  return <DataTable columns={columns} data={allUsers} fetchTime={fetchTime} />;
}
