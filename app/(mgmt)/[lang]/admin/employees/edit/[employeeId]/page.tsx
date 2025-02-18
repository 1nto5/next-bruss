import { Locale } from '@/i18n.config';
// import { getDictionary } from '@/lib/dictionary';

import { ObjectId } from 'mongodb';
import { redirect } from 'next/navigation';
import { getEmployee } from '../../actions';
import EditEmployee from './components/edit-employee';

export default async function EditUserPage(props: {
  params: Promise<{ lang: Locale; employeeId: string }>;
}) {
  const params = await props.params;

  const { employeeId } = params;

  // const dict = await getDictionary(lang);
  const employee = await getEmployee(new ObjectId(employeeId));

  if (!employee) {
    redirect('/admin/employees');
  }

  return (
    <main className='m-2 flex justify-center'>
      <EditEmployee employee={employee} />
    </main>
  );
}
