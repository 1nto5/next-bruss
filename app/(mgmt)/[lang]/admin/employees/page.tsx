import { Locale } from '@/i18n.config';
// import { getDictionary } from '@/lib/dictionary';
import { EmployeeType } from '@/app/(mgmt)/[lang]/admin/employees/lib/employee-types';
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

  let allUsers = await res.json();

  return { fetchTime, allUsers };
}

export default async function AdminEmployeesPage(props: {
  params: Promise<{ lang: Locale }>;
}) {
  const params = await props.params;

  const { lang } = params;

  const { fetchTime, allUsers } = await getEmployees(lang);
  return <DataTable columns={columns} data={allUsers} fetchTime={fetchTime} />;
}
