import { auth } from '@/lib/auth';
import getEmployees from '@/lib/data/get-employees';
import { getUsers } from '@/lib/data/get-users';
import { Locale } from '@/lib/config/i18n';
import getOvertimeDepartments from '@/lib/get-overtime-departments';
import { notFound, redirect } from 'next/navigation';
import EditOvertimeRequestForm from '../../components/edit-overtime-request-form';
import { getOvertimeRequestForEdit } from '../../actions';
import { getDictionary } from '../../lib/dict';

export default async function EditOvertimeRequestPage(props: {
  params: Promise<{ lang: Locale; id: string }>;
}) {
  const params = await props.params;
  const { lang, id } = params;
  const dict = await getDictionary(lang);
  
  const session = await auth();
  if (!session || !session.user?.email) {
    redirect('/auth');
  }

  // Get the overtime request
  const overtimeRequest = await getOvertimeRequestForEdit(id);
  
  if (!overtimeRequest) {
    notFound();
  }

  // Get employees, users lists, and departments
  const [employees, users, departments] = await Promise.all([
    getEmployees(),
    getUsers(),
    getOvertimeDepartments(),
  ]);

  return (
    <EditOvertimeRequestForm
      employees={employees}
      users={users}
      departments={departments}
      overtimeRequest={overtimeRequest}
      dict={dict}
      lang={lang}
    />
  );
}