import { Locale } from '@/i18n.config';
import { getDictionary } from '@/lib/dictionary';
import { getArticlesForWorkplace } from '../actions';
import { Info } from '../components/info';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export default async function ArticleSelectionPage(props: {
  params: Promise<{ lang: Locale; workplaceName: string }>;
}) {
  const params = await props.params;

  const { lang, workplaceName } = params;

  const dict = await getDictionary(lang);
  const cDict = dict.dmcheck.articleSelection;
  const workplaceArticles = await getArticlesForWorkplace(workplaceName);

  if (workplaceArticles.length === 0) {
    return (
      <main className='mt-24 flex justify-center'>
        <Info
          title={cDict.noArticleConfigForWorkplaceTitle}
          description={`${cDict.noArticleConfigForWorkplaceDescription} ${workplaceName.toUpperCase()}`}
        />
      </main>
    );
  }

  workplaceArticles.sort((a, b) => a.articleNumber - b.articleNumber);

  return (
    <Card className='mx-auto w-full max-w-7xl'>
      <CardHeader>
        <CardTitle>{cDict.cardTitle}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
          {workplaceArticles.map((a) => (
            <Link
              key={a.articleNumber}
              href={`${workplaceName}/${a._id.toString()}`}
            >
              <Button
                className='flex h-auto w-full flex-col items-center p-4 text-center'
                variant='outline'
              >
                <div className='mb-2 text-lg font-bold'>
                  {a.articleNumber} - {a.articleName}
                </div>
                <div className='text-sm font-extralight'>
                  {a.piecesPerBox} {cDict.piecesPerBox}
                </div>
                {a.pallet && (
                  <div className='text-sm font-extralight'>
                    {a.boxesPerPallet} {cDict.boxesPerPallet}
                  </div>
                )}
                {a.articleNote && (
                  <div className='text-muted-foreground mt-2 text-sm'>
                    {a.articleNote}
                  </div>
                )}
              </Button>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
