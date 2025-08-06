'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package } from 'lucide-react';
import { useScanStore } from '../lib/stores';
import type { ArticleConfigType } from '../lib/types';

interface ArticleSelectionProps {
  articles: ArticleConfigType[];
  workplace: string;
}

export default function ArticleSelection({ articles, workplace }: ArticleSelectionProps) {
  const { setSelectedArticle } = useScanStore();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Wybór artykułu - {workplace.toUpperCase()}</CardTitle>
      </CardHeader>

      <CardContent>
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
          {articles.map((article) => (
            <Button
              key={article._id}
              variant='outline'
              className='h-auto flex-col items-start justify-start p-4 text-left'
              onClick={() => setSelectedArticle({
                id: article._id,
                articleNumber: article.articleNumber,
                articleName: article.articleName,
                workplace: article.workplace,
                piecesPerBox: article.piecesPerBox,
                boxesPerPallet: article.boxesPerPallet,
                pallet: article.pallet,
                dmcLength: article.dmc.length,
                dmcFirstValidation: article.dmcFirstValidation,
                dmcSecondValidation: article.dmcSecondValidation,
                secondValidation: article.secondValidation,
                ford: article.ford,
                bmw: article.bmw,
                nonUniqueHydraBatch: article.nonUniqueHydraBatch,
              })}
            >
              <div className='flex w-full items-center justify-between'>
                <Package className='h-5 w-5' />
                <span className='text-xs text-muted-foreground'>
                  {article.piecesPerBox} szt/box
                  {article.pallet && `, ${article.boxesPerPallet} box/pal`}
                </span>
              </div>
              <div className='mt-2 space-y-1'>
                <div className='font-semibold'>{article.articleNumber}</div>
                <div className='text-sm text-muted-foreground'>
                  {article.articleName}
                </div>
                {(article.ford || article.bmw) && (
                  <div className='text-xs text-blue-600'>
                    {article.ford && 'FORD'} {article.bmw && 'BMW'}
                  </div>
                )}
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}