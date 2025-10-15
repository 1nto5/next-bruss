'use client';

import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Component } from 'lucide-react';
import { useScanStore } from '../lib/stores';
import type { ArticleConfigType } from '../lib/types';
import type { Dictionary } from '../lib/dict';

interface ArticleSelectionProps {
  articles: ArticleConfigType[];
  workplace: string;
  dict: Dictionary['articleSelection'];
}

export default function ArticleSelection({ 
  articles, 
  workplace, 
  dict 
}: ArticleSelectionProps) {
  const { setSelectedArticle } = useScanStore();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{dict.title} - {workplace.toUpperCase()}</CardTitle>
      </CardHeader>

      <CardContent>
        <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
          {articles.map((article) => (
            <Button
              key={article.id}
              variant='outline'
              className='h-auto flex-col items-start justify-start p-6 text-left'
              onClick={() => setSelectedArticle(article)}
            >
              <div className='flex w-full items-center justify-between'>
                <Component className='h-6 w-6' />
                <span className='text-sm text-muted-foreground'>
                  {article.piecesPerBox} {dict.piecesPerBox}
                  {article.pallet && `, ${article.boxesPerPallet} ${dict.boxesPerPallet}`}
                </span>
              </div>
              <div className='mt-3 space-y-2'>
                <div className='text-lg'>{article.articleNumber}</div>
                <div className='text-base text-muted-foreground'>
                  {article.articleName}
                </div>
                {(article.ford || article.bmw) && (
                  <div className='text-sm text-blue-600 font-medium'>
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