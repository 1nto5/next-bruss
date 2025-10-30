import { auth } from '@/lib/auth';
import { Locale } from '@/lib/config/i18n';
import { getUsers } from '@/lib/data/get-users';
import { redirect } from 'next/navigation';
import AddOvertimeForm from '../../components/add-overtime-form';
import { getDictionary } from '../../lib/dict';

export const dynamic = 'force-dynamic';

export default async function AddOvertimePage(props: {
  params: Promise<{ lang: Locale }>;
}) {
  const params = await props.params;
  const { lang } = params;
  const dict = await getDictionary(lang);
  const managers = await getUsers();
  const session = await auth();
  if (!session || !session.user?.email) {
    redirect(
      `/${lang}/auth?callbackUrl=${encodeURIComponent(`/overtime-submissions/add-overtime`)}`,
    );
  }
  return (
    <AddOvertimeForm
      managers={managers}
      loggedInUserEmail={session?.user?.email ?? ''}
      mode='new'
      dict={dict}
      lang={lang}
    />
  );
}
