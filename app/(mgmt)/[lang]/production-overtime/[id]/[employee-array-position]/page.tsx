import getEmployees from '@/lib/get-from-api/get-employees';
import NewOvertimeRequestForm from './components/replace-employee-form';

export default async function AddDeviationPage(props: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const params = await props.params;
  const employees = await getEmployees();
  const { id } = params;

  return <NewOvertimeRequestForm requestId={id} employees={employees} />;
}
