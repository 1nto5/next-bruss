'use client';

import { PCard, PCardContent, PCardHeader } from '@/app/(pro)/components/ui/wrappers';
import { CardTitle } from '@/components/ui/card';
import { Clock } from 'lucide-react';
import type { Locale } from '@/i18n.config';
import { useEOLStore } from '../lib/stores';

interface LastScansProps {
  lang: Locale;
}

export default function LastScans({ lang }: LastScansProps) {
  const { lastScans } = useEOLStore();
  
  const locale = lang === 'de' ? 'de-DE' : lang === 'en' ? 'en-US' : 'pl-PL';
  
  const formatTime = (time: Date) => {
    return new Date(time).toLocaleTimeString(locale);
  };

  const getArticleName = (article: string) => {
    return article === '28067' ? 'M-136-K-1-A' : 'M-153-K-C';
  };

  if (lastScans.length === 0) return null;

  return (
    <PCard>
      <PCardHeader>
        <div className='flex items-center gap-3'>
          <Clock className='text-muted-foreground h-6 w-6' />
          <CardTitle>Ostatnie skanowania</CardTitle>
        </div>
      </PCardHeader>
      <PCardContent>
        <div className='space-y-2'>
          {lastScans.slice(0, 5).map((scan, index) => (
            <div 
              key={`${scan.batch}-${index}`}
              className='flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2'
            >
              <div className='flex items-center gap-3'>
                <span className='font-mono text-sm'>{scan.batch}</span>
                <span className='text-xs text-muted-foreground'>
                  {getArticleName(scan.article)}
                </span>
              </div>
              <span className='text-xs text-muted-foreground'>
                {formatTime(scan.time)}
              </span>
            </div>
          ))}
        </div>
      </PCardContent>
    </PCard>
  );
}