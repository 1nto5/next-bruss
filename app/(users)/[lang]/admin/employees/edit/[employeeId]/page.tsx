import { Locale } from '@/i18n.config';
// import { getDictionary } from '@/lib/dictionary';

import { getEmployee } from '../../actions';
import { redirect } from 'next/navigation';
import { ObjectId } from 'mongodb';
import EditEmployee from './components/EditEmployee';

export default async function EditUserPage({
  params: { lang, employeeId },
}: {
  params: { lang: Locale; employeeId: string };
}) {
  // const dict = await getDictionary(lang);
  let employee = await getEmployee(new ObjectId(employeeId));
  if (!employee) {
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
