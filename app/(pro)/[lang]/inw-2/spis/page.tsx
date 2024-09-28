'use client';
import { Locale } from '@/i18n.config';
import { usePathname, useRouter } from 'next/navigation';
import { login } from './actions';
import { usePersonalNumberStore } from './lib/stores';

// import { getDictionary } from '@/lib/dictionary';

export default function ArticleSelectionPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { personalNumber1 } = usePersonalNumberStore();
  !personalNumber1 && router.push(`${pathname}/login`);
  personalNumber1 && router.push(`${pathname}/card`);
}
