import { auth } from '@/auth';
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

  const session = await auth();
  if (!session || !session.user?.email) {
    redirect('/auth');
  }
  const access =
    session.user?.roles.some((role) => role.includes('group-leader')) ||
    session.user?.roles.includes('plant-manager') ||
    session.user?.roles.includes('admin') ||
    session.user?.roles.includes('hr') ||
    false;
  if (access === false) {
    redirect('/overtime-orders');
  }

  // Check overtime request status
  let overtimeRequestLocaleString;
  ({ overtimeRequestLocaleString } = await getOvertimeRequest(lang, id));

  const status = overtimeRequestLocaleString.status;

  // Redirect if status is not valid for adding day off
  if (status !== 'pending' && status !== 'approved' && status !== 'forecast') {
    redirect(`/overtime-orders/${id}`);
  }

  const employees = await getEmployees();
  return <AddDayOff employees={employees} id={id} />;
}
