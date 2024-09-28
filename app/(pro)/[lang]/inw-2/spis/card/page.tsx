'use client';

import { usePathname, useRouter } from 'next/navigation';
import CardSelection from '../components/card-selection';
import { usePersonalNumberStore } from '../lib/stores';

export default function ArticleSelectionPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { personalNumber1 } = usePersonalNumberStore();
  !personalNumber1 && router.push(pathname.replace('/card', '/login'));

  return personalNumber1 ? <CardSelection /> : null;
}
