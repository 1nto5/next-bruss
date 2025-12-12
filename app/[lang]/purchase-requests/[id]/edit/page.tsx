import { auth } from '@/lib/auth';
import { Locale } from '@/lib/config/i18n';
import { redirect } from 'next/navigation';
import EditRequestForm from '../../components/edit-request-form';
import { getDictionary } from '../../lib/dict';
import { getApprovers } from '../../actions';

async function getPurchaseRequest(id: string) {
  const res = await fetch(`${process.env.API}/purchase-requests/${id}`, {
    next: { revalidate: 0, tags: ['purchase-requests'] },
  });

  if (!res.ok) {
    return null;
  }

  return res.json();
}

export default async function EditPurchaseRequestPage(props: {
  params: Promise<{ lang: Locale; id: string }>;
}) {
  const params = await props.params;
  const { lang, id } = params;

  const session = await auth();
  if (!session?.user?.email) {
    redirect(`/${lang}/auth?callbackUrl=/${lang}/purchase-requests/${id}/edit`);
  }

  const dict = await getDictionary(lang);
  const request = await getPurchaseRequest(id);

  if (!request) {
    redirect(`/${lang}/purchase-requests`);
  }

  // Check if user can edit
  const canEdit =
    ['draft', 'pending'].includes(request.status) &&
    request.requestedBy === session.user.email;

  if (!canEdit) {
    redirect(`/${lang}/purchase-requests/${id}`);
  }

  const approversResult = await getApprovers();
  const approvers = approversResult.data || [];

  return (
    <div className='container mx-auto max-w-4xl py-6'>
      <EditRequestForm
        request={request}
        dict={dict}
        lang={lang}
        approvers={approvers}
      />
    </div>
  );
}
