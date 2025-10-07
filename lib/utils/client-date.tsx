'use client';

import { Locale } from '@/lib/config/i18n';
import { useParams } from 'next/navigation';

export function useClientLocaleDateString(
  date: Date | string | null | undefined,
): string {
  const params = useParams<{ lang: Locale }>();

  if (!date) return '-';

  const dateObj = typeof date === 'string' ? new Date(date) : date;

  if (isNaN(dateObj.getTime())) return '-';

  return dateObj.toLocaleDateString(params?.lang || 'pl');
}

export function useClientLocaleString(
  date: Date | string | null | undefined,
): string {
  const params = useParams<{ lang: string }>();

  if (!date) return '-';

  const dateObj = typeof date === 'string' ? new Date(date) : date;

  if (isNaN(dateObj.getTime())) return '-';

  return dateObj.toLocaleString(params?.lang || 'pl');
}
