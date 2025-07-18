import { auth } from '@/auth';
import { Locale } from '@/i18n.config';
import { redirect } from 'next/navigation';
// import { getDictionary } from '@/lib/dictionary';
import EditDraftForm from '../../components/edit-draft-form';
import {
  getConfigAreaOptions,
  getConfigReasonOptions,
} from '../../lib/get-configs';
import { getDeviation } from '../../lib/get-deviation';

export default async function EditDeviationPage(props: {
  params: Promise<{ lang: Locale; id: string }>;
}) {
  const session = await auth();
  if (!session) {
    redirect('/auth?callbackUrl=/deviations');
  }
  const params = await props.params;

  const { lang, id } = params;

  // const dict = await getDictionary(lang);
  const reasonOptions = await getConfigReasonOptions();
  const areaOptions = await getConfigAreaOptions();
  const deviationData = await getDeviation(id);
  return (
    <EditDraftForm
      reasonOptions={reasonOptions}
      areaOptions={areaOptions}
      deviation={deviationData.deviation}
      id={id}
      lang={lang}
    />
  );
}
