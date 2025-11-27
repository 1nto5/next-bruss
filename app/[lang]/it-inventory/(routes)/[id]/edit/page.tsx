import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getDictionary } from '../../../lib/dict';
import EditItemForm from '../../../components/forms/edit-item-form';
import { getItemForEdit } from '../../../actions/crud';
import { Locale } from '@/lib/config/i18n';

export default async function EditItemPage({
  params,
}: {
  params: Promise<{ lang: Locale; id: string }>;
}) {
  const session = await auth();
  if (!session || !session.user?.email) {
    redirect('/auth');
  }

  const { lang, id } = await params;

  // getItemForEdit checks IT/Admin role internally
  const item = await getItemForEdit(id);
  if (!item) {
    redirect(`/${lang}/it-inventory`);
  }

  const dict = await getDictionary(lang);

  return <EditItemForm item={item} dict={dict} lang={lang} />;
}
