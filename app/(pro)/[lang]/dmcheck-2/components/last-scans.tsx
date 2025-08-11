'use client';

import { ProCard, ProCardContent } from '@/app/(pro)/components/ui/pro-card';
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
    <ProCard>
      <ProCardContent className='space-y-3'>
        {lastScans.map((scan, index) => (
          <ProCard key={index}>
            <ProCardContent className='flex items-center justify-between px-6 py-4'>
              <div className='flex items-center gap-4'>
                <span className='font-mono text-base'>{scan.dmc}</span>
              </div>
              <span className='text-muted-foreground text-base'>
                {new Date(scan.time).toLocaleTimeString(locale)}
              </span>
            </ProCardContent>
          </ProCard>
        ))}
      </ProCardContent>
    </ProCard>
  );
}