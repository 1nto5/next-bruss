import { auth } from '@/lib/auth';
import { Locale } from '@/lib/config/i18n';
import { redirect } from 'next/navigation';
import { getDictionary } from '../lib/dict';
import RequestDetails from '../components/request-details';

async function getPurchaseRequest(id: string) {
  const res = await fetch(`${process.env.API}/purchase-requests/${id}`, {
    next: { revalidate: 0, tags: ['purchase-requests'] },
  });

  if (!res.ok) {
    return null;
  }

  return res.json();
}

export default async function PurchaseRequestDetailsPage(props: {
  params: Promise<{ lang: Locale; id: string }>;
}) {
  const params = await props.params;
  const { lang, id } = params;

  const session = await auth();
  const dict = await getDictionary(lang);

  const request = await getPurchaseRequest(id);
  if (!request) {
    redirect(`/${lang}/purchase-requests`);
  }

  return (
    <div className='container mx-auto max-w-5xl py-6'>
      <RequestDetails
        request={request}
        dict={dict}
        lang={lang}
        session={session}
      />
    </div>
  );
}
