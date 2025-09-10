import { Locale } from '@/i18n.config';
import { getDictionary } from '@/lib/dictionary';
import { PersonLogin } from '../../components/person-login';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default async function PersonLoginPage(
  props: {
    params: Promise<{ lang: Locale }>;
  }
) {
  const params = await props.params;

  const {
    lang
  } = params;

  const dict = await getDictionary(lang);
  const cDict = dict.dmcheck.personLogin;

  return (
    <Card className='w-max-7xl'>
      <CardHeader>
        <CardTitle>{cDict.cardTitle}</CardTitle>
      </CardHeader>
      <CardContent className='flex flex-wrap justify-center'>
        <PersonLogin cDict={dict.dmcheck.personLogin} lang={lang} />
      </CardContent>
    </Card>
  );
}
