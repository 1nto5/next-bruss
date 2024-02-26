import { Locale } from '@/i18n.config';
import { getDictionary } from '@/lib/dictionary';
import { getArticlesConfigForWorkplace } from '../actions';
import { Info } from '../components/Info';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default async function ArticleSelectionPage({
  params: { lang, workplaceName },
}: {
  params: { lang: Locale; workplaceName: string };
}) {
  const dict = await getDictionary(lang);
  const cDict = dict.dmcheck.articleSelection;

  const articlesConfigForWorkplace =
    await getArticlesConfigForWorkplace(workplaceName);

  if (articlesConfigForWorkplace.length === 0) {
    return (
      <Info
        title={cDict.noArticleConfigForWorkplaceTitle}
        description={`${cDict.noArticleConfigForWorkplaceDescription} ${workplaceName.toUpperCase()}`}
      />
    );
  }

  return (
    <Card className='w-max-7xl'>
      <CardHeader>
        <CardTitle>{cDict.cardTitle}</CardTitle>
      </CardHeader>
      <CardContent className='flex flex-wrap justify-center'>
        {articlesConfigForWorkplace.map((a, index) => (
          <Link
            key={index}
            href={{
              pathname: `${workplaceName}/${a._id.toString()}`,
            }}
          >
            <Button className='m-4 flex flex-col' variant='outline'>
              <div className='mb-2 text-xl'>
                {a.articleNumber} - {a.articleName}
              </div>
              <div className='font-extralight'>
                {a.piecesPerBox} {cDict.piecesPerBox}
              </div>
              {a.pallet && (
                <>
                  <div className='font-extralight'>
                    {a.boxesPerPallet} {cDict.boxesPerPallet}
                  </div>
                </>
              )}
              <div className='mt-2'>
                {a.articleNote} lorem ipsumrem ipsumlorem ipsumlorem ipsumlorem
                ipsumlorem ipsumlorem ipsum
              </div>
            </Button>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}
