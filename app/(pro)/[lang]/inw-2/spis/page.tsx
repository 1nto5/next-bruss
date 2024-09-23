import { Locale } from '@/i18n.config';
import { getDictionary } from '@/lib/dictionary';

import Link from 'next/link';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Login from './components/Login';

export default async function ArticleSelectionPage({
  params: { lang },
}: {
  params: { lang: Locale };
}) {
  return <Login />;
}
