import { Locale } from '@/i18n.config';
import { getDictionary } from '@/lib/dictionary';
import { StatusBar } from '../../../components/StatusBar';
import {
  getArticleConfigById,
  getOperatorName,
  revalidateTest,
} from '../../../actions';

export default async function ScanPage({
  params: { lang, articleConfigId, personalNumber },
}: {
  params: { lang: Locale; articleConfigId: string; personalNumber: string };
}) {
  const dict = await getDictionary(lang);
  const operatorName = await getOperatorName(personalNumber);
  const nameParts = operatorName.split(' ');
  const shortNameWithPersonalNumber = `${nameParts[0]} ${nameParts[1].charAt(0)}. (${personalNumber})`;
  const article = await getArticleConfigById(articleConfigId);
  // const inBox = await fetch('/api/dmcheck/fetch-in-box', {
  //   method: 'POST',
  //   next: { tags: [articleConfigId] },
  //   headers: {
  //     'Content-Type': 'application/json',
  //   },
  //   body: JSON.stringify(articleConfigId),
  // });

  const response = await fetch(
    'http://localhost:3000/api/dmcheck/fetch-in-box',
    {
      next: { tags: [articleConfigId] },
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ articleId: articleConfigId }),
    },
  );

  const data = await response.json();

  console.log(data.message); // This will log 'test message'
  // const response = await fetch('/api/generate-excel', {
  //   method: 'POST',
  //   headers: {
  //     'Content-Type': 'application/json',
  //   },
  //   body: JSON.stringify(formData),
  // });

  return (
    <>
      <StatusBar
        cDict={dict.dmcheck.scan.statusBar}
        operator={shortNameWithPersonalNumber}
        article={`${article?.articleNumber} (${article?.articleName})`}
        pallet={article?.pallet}
      />
      <form action={revalidateTest}>
        <button>revalidate</button>
      </form>
    </>
  );
}
