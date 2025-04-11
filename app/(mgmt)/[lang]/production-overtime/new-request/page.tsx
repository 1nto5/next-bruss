import getEmployees from '@/lib/get-employees';
import NewOvertimeRequestForm from '../components/new-overtime-request-form';

export default async function AddDeviationPage() {
  const employees = await getEmployees();
  return <NewOvertimeRequestForm employees={employees} />;
}
