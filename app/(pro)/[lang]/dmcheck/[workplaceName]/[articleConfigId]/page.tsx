import { Locale } from '@/i18n.config';
import { getDictionary } from '@/lib/dictionary';
import { PersonLogin } from '../../components/PersonLogin';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default async function PersonLoginPage({
  params: { lang },
}: {
  params: { lang: Locale };
}) {
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
