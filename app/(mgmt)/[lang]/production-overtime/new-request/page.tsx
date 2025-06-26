import getEmployees from '@/lib/get-employees';
import { getUsers } from '@/lib/get-users';
import NewOvertimeRequestForm from '../components/new-overtime-request-form';

export default async function AddDeviationPage() {
  const employees = await getEmployees();
  const users = await getUsers();
  return <NewOvertimeRequestForm employees={employees} users={users} />;
}
