import { Locale } from '@/i18n.config';
import getEmployees from '@/lib/get-employees';
import { redirect } from 'next/navigation';
import AddDayOff from '../../components/add-day-off-form';
import { getOvertimeRequest } from '../../lib/get-overtime-request';

export default async function AddDayOffPage(props: {
  params: Promise<{ lang: Locale; id: string }>;
}) {
  const params = await props.params;
  const { lang, id } = params;

  // Check overtime request status
  let overtimeRequestLocaleString;
  ({ overtimeRequestLocaleString } = await getOvertimeRequest(lang, id));

  const status = overtimeRequestLocaleString.status;

  // Redirect if status is not valid for adding day off
  if (status !== 'pending' && status !== 'approved') {
    redirect(`/${lang}/production-overtime/${id}`);
  }

  const employees = await getEmployees();
  return <AddDayOff employees={employees} id={id} />;
}
