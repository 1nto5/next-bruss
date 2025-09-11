import { auth } from '@/auth';
import getEmployees from '@/lib/get-employees';
import { getUsers } from '@/lib/get-users';
import { Locale } from '@/i18n.config';
import { notFound, redirect } from 'next/navigation';
import EditOvertimeRequestForm from '../../components/edit-overtime-request-form';
import { getOvertimeRequestForEdit } from '../../actions';

export default async function EditOvertimeRequestPage(props: {
  params: Promise<{ lang: Locale; id: string }>;
}) {
  const params = await props.params;
  const { id } = params;
  
  const session = await auth();
  if (!session || !session.user?.email) {
    redirect('/auth');
  }

  // Get the overtime request
  const overtimeRequest = await getOvertimeRequestForEdit(id);
  
  if (!overtimeRequest) {
    notFound();
  }

  // Get employees and users lists
  const [employees, users] = await Promise.all([
    getEmployees(),
    getUsers(),
  ]);

  return (
    <EditOvertimeRequestForm
      employees={employees}
      users={users}
      overtimeRequest={overtimeRequest}
    />
  );
}