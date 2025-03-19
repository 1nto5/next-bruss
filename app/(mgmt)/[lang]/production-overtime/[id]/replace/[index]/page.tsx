import getEmployees from '@/lib/get-employees';
import { notFound } from 'next/navigation';
import { getOvertimeRequest } from '../../../lib/get-overtime-request';
import ReplaceEmployeeForm from './components/replace-employee-form';

export default async function AddDeviationPage(props: {
  params: Promise<{ lang: string; id: string; index: string }>;
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const params = await props.params;
  const id = params.id;
  const lang = params.lang;
  const index = params.index;
  const employees = await getEmployees();
  const data = await getOvertimeRequest(lang, id);

  const currentEmployeeIndex = parseInt(index, 10);
  if (
    isNaN(currentEmployeeIndex) ||
    !data.overtimeRequestLocaleString.employees[currentEmployeeIndex]
  ) {
    notFound();
  }

  return (
    <ReplaceEmployeeForm
      requestId={id}
      employees={employees}
      currentEmployeeIndex={currentEmployeeIndex}
      currentEmployeeData={
        data.overtimeRequestLocaleString.employees[currentEmployeeIndex]
      }
    />
  );
}
