'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
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
      <CardHeader className='pb-6'>
        {lastScans.map((scan, index) => (
          <Card key={index}>
            <CardContent className='flex items-center justify-between px-3 py-2'>
              <div className='flex items-center gap-3'>
                <span className='font-mono text-sm'>{scan.dmc}</span>
              </div>
              <span className='text-muted-foreground text-sm'>
                {new Date(scan.time).toLocaleTimeString(locale)}
              </span>
            </CardContent>
          </Card>
        ))}
      </CardHeader>
    </Card>
  );
}
