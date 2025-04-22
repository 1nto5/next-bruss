import { Locale } from '@/i18n.config';
// import { getDictionary } from '@/lib/dictionary';
import EditForm from '../../components/edit-form';
import {
  getConfigAreaOptions,
  getConfigReasonOptions,
} from '../../lib/get-configs';
import { getDeviation } from '../../lib/get-deviation';

export default async function EditDeviationPage(props: {
  params: Promise<{ lang: Locale; id: string }>;
}) {
  const params = await props.params;

  const { lang, id } = params;

  // const dict = await getDictionary(lang);
  const reasonOptions = await getConfigReasonOptions();
  const areaOptions = await getConfigAreaOptions();
  const deviationData = await getDeviation(id);
  return (
    <EditForm
      reasonOptions={reasonOptions}
      areaOptions={areaOptions}
      deviation={deviationData.deviation}
      id={id}
      lang={lang}
    />
  );
}
