import { Locale } from '@/i18n.config';
import { redirect } from 'next/navigation';
import { getEmpCards } from '../actions';
import CardSelection from './components/CardSelection';

export default async function ArticleSelectionPage({
  params: { lang, emp },
}: {
  params: { lang: Locale; emp: string };
}) {
  console.log('emp', emp);
  const cards = await getEmpCards(emp);
  console.log('cards', cards);
  return <CardSelection emp={emp} cards={cards} />;
}
