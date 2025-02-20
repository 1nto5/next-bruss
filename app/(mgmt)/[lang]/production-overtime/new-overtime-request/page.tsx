// import { getDictionary } from '@/lib/dictionary';
import { EmployeeType } from '@/lib/types/employee-types';
import NewOvertimeRequestForm from './components/new-overtime-request-form';

async function getEmployees(): Promise<EmployeeType[]> {
  const res = await fetch(`${process.env.API}/employees`, {
    next: {
      // revalidate: 60 * 60 * 8, // 8 hours
      revalidate: 0, // TODO: change to 60 * 60 * 8
      tags: ['employees'],
    },
  });

  if (!res.ok) {
    const json = await res.json();
    throw new Error(
      `getEmployees error:  ${res.status}  ${res.statusText} ${json.error}`,
    );
  }
  const data = await res.json();
  return data;
}

export default async function AddDeviationPage(props: {
  // params: Promise<{ lang: Locale }>;
}) {
  // const params = await props.params;
  // const { lang } = params;
  // const dict = await getDictionary(lang);
  const employees = await getEmployees();
  return <NewOvertimeRequestForm employees={employees} />;
}
