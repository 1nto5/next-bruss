import { Locale } from '@/i18n.config';
// import { getDictionary } from '@/lib/dictionary';

import { ObjectId } from 'mongodb';
import { redirect } from 'next/navigation';
import { getEmployee } from '../../actions';
import EditEmployee from './components/edit-employee';

export default async function EditUserPage({
  params: { lang, employeeId },
}: {
  params: { lang: Locale; employeeId: string };
}) {
  // const dict = await getDictionary(lang);
  const employee = await getEmployee(new ObjectId(employeeId));
  console.log(employee);
  if (!employee || !employee._id) {
    redirect('/admin/employees');
  }
  return (
    <main className='m-2 flex justify-center'>
      <EditEmployee
        employeeObject={{
          ...employee,
          _id: employee._id.toString(),
        }}
      />
    </main>
  );
}
