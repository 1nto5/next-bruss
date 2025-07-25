import { auth } from '@/auth';
import { Locale } from '@/i18n.config';
import { redirect } from 'next/navigation';
import CompleteOrderForm from '../../components/complete-order-form';
import { getOvertimeRequest } from '../../lib/get-overtime-request';

// Update the attachment roles to match the specified requirements
const ATTACHMENT_ROLES = [
  'group-leader',
  'production-manager',
  'plant-manager',
  'hr',
] as const;

export default async function CompleteOrderPage(props: {
  params: Promise<{ lang: Locale; id: string }>;
}) {
  const params = await props.params;
  const { lang, id } = params;

  const session = await auth();
  if (!session || !session.user?.email) {
    redirect('/auth');
  }

  // Check overtime request status and get request details
  let overtimeRequestLocaleString;
  ({ overtimeRequestLocaleString } = await getOvertimeRequest(lang, id));

  const status = overtimeRequestLocaleString.status;
  const owner = overtimeRequestLocaleString.requestedBy;
  const responsibleEmployee = overtimeRequestLocaleString.responsibleEmployee;

  // Check if user has permission to complete orders
  const userRoles = session?.user?.roles || [];
  const userEmail = session?.user?.email;

  const canCompleteOrder =
    userRoles.some((role: string) =>
      ATTACHMENT_ROLES.includes(role as (typeof ATTACHMENT_ROLES)[number]),
    ) ||
    userEmail === owner ||
    userEmail === responsibleEmployee;

  if (!canCompleteOrder) {
    redirect(`/production-overtime`);
  }

  // Redirect if status is not valid for completing order
  if (status !== 'approved') {
    redirect(`/production-overtime/${id}`);
  }

  return (
    <CompleteOrderForm
      id={id}
      session={session}
      overtimeRequest={overtimeRequestLocaleString}
    />
  );
}
