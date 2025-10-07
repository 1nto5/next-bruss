'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Package, RefreshCw } from 'lucide-react';
import type { ArticleStatus } from '../lib/types';
import { Button } from '@/components/ui/button';

interface StatusBarProps {
  dict: {
    article136: string;
    article153: string;
    article136Name: string;
    article153Name: string;
    boxesOnPallet: string;
    palletFull: string;
    scanPallet: string;
  };
  article136Status: ArticleStatus | null;
  article153Status: ArticleStatus | null;
  onRefresh: () => void;
}

export default function StatusBar({ 
  dict, 
  article136Status, 
  article153Status, 
  onRefresh 
}: StatusBarProps) {
  const renderArticleCard = (
    title: string,
    name: string,
    status: ArticleStatus | null
  ) => {
    if (!status) {
      return (
        <Card>
          <CardHeader>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-3'>
                <Package className='text-muted-foreground h-6 w-6' />
                <CardTitle>{title}</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className='flex items-center justify-center py-8 text-muted-foreground'>
              Loading...
            </div>
          </CardContent>
        </Card>
      );
    }

    const progress = (status.boxesOnPallet / status.palletSize) * 100;
    const isFull = status.isFull;

    return (
      <Card>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-3'>
              <Package className='text-muted-foreground h-6 w-6' />
              <CardTitle>{title} - {name}</CardTitle>
            </div>
            <div className='flex items-center gap-3'>
              {isFull && (
                <Badge variant='destructive' className='animate-pulse'>
                  {dict.palletFull}
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            <div className='text-center'>
              <span className='text-6xl font-bold'>{status.boxesOnPallet}</span>
              <span className='text-4xl text-muted-foreground mx-3'>/</span>
              <span className='text-5xl font-semibold text-muted-foreground'>{status.palletSize}</span>
            </div>
            <Progress 
              value={progress} 
              className={`h-4 ${isFull ? 'animate-pulse [&>div]:bg-destructive' : ''}`} 
            />
            {isFull && (
              <div className='rounded-lg bg-orange-100 p-3 text-center dark:bg-orange-900/50'>
                <p className='text-lg font-semibold text-orange-900 dark:text-orange-100'>
                  {dict.scanPallet}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <>
      <div className='flex items-center justify-between mb-4'>
        <h2 className='text-xl font-semibold'>Status</h2>
        <Button
          variant='outline'
          size='sm'
          onClick={onRefresh}
          className='gap-2'
        >
          <RefreshCw className='h-4 w-4' />
          Refresh
        </Button>
      </div>
      <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
        {renderArticleCard(dict.article136, dict.article136Name, article136Status)}
        {renderArticleCard(dict.article153, dict.article153Name, article153Status)}
      </div>
    </>
  );
}