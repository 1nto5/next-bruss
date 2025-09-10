import { auth } from '@/auth';
import { Locale } from '@/i18n.config';
import { redirect } from 'next/navigation';
// import { getDictionary } from '@/lib/dictionary';
import { EmployeeType } from '@/lib/types/employee-types';
import { columns } from './table/columns';
import { DataTable } from './table/data-table';

async function getEmployees(
  lang: string,
): Promise<{ fetchTime: string; allUsers: EmployeeType[] }> {
  const res = await fetch(`${process.env.API}/admin/employees`, {
    next: { revalidate: 60 * 15, tags: ['employees'] },
  });

  if (!res.ok) {
    const json = await res.json();
    throw new Error(
      `getEmployees error:  ${res.status}  ${res.statusText} ${json.error}`,
    );
  }

  const dateFromResponse = new Date(res.headers.get('date') || '');
  const fetchTime = dateFromResponse.toLocaleString(lang);

  const allUsers = await res.json();

  return { fetchTime, allUsers };
}

export default async function AdminEmployeesPage(props: {
  params: Promise<{ lang: Locale }>;
}) {
  const session = await auth();
  if (!session) {
    redirect('/auth');
  }
  if (!session?.user?.roles?.includes('admin')) {
    redirect('/');
  }
  const params = await props.params;

  const { lang } = params;

  const { fetchTime, allUsers } = await getEmployees(lang);
  return <DataTable columns={columns} data={allUsers} fetchTime={fetchTime} />;
}
