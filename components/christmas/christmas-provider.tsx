'use client';

import { usePathname } from 'next/navigation';
import { isChristmasEnabledForPath } from '@/lib/config/christmas';
import { ChristmasWrapper } from './christmas-wrapper';

export function ChristmasProvider() {
  const pathname = usePathname();

  if (!isChristmasEnabledForPath(pathname)) {
    return null;
  }

  return <ChristmasWrapper />;
}
