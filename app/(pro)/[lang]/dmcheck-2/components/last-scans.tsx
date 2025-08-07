'use client';

import { Card, CardContent } from '@/components/ui/card';
import type { Locale } from '@/i18n.config';
import { useScanStore } from '../lib/stores';

interface LastScansProps {
  lang: Locale;
}

export default function LastScans({ lang }: LastScansProps) {
  const { lastScans } = useScanStore();

  if (lastScans.length === 0) {
    return null;
  }

  const locale = lang === 'de' ? 'de-DE' : lang === 'en' ? 'en-US' : 'pl-PL';

  return (
    <Card>
      <CardContent className='mt-4 space-y-2'>
        {lastScans.map((scan, index) => (
          <Card key={index}>
            <CardContent className='flex items-center justify-between p-4'>
              <div className='flex items-center gap-4'>
                <span className='font-mono text-xs'>{scan.dmc}</span>
              </div>
              <span className='text-muted-foreground text-sm'>
                {new Date(scan.time).toLocaleTimeString(locale)}
              </span>
            </CardContent>
          </Card>
        ))}
      </CardContent>
    </Card>
  );
}