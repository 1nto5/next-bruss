import Container from '@/components/ui/container';
import { Locale } from '@/i18n.config';
import { redirect } from 'next/navigation';
import { getEmpCards } from '../actions';
import CardSelection from '../components/card-selection';
import Header from '../components/header';

export default async function CardSelectionPage({
  params: { lang, emp },
}: {
  params: { lang: Locale; emp: string };
}) {
  console.log('emp', emp);
  const cards = (await getEmpCards(emp)).map(({ _id, ...card }) => card);
  console.log('cards', cards);
  return (
    <>
      <Header />
      <Container>
        <main className='flex justify-center'>
          <CardSelection emp={emp} cards={cards} />
        </main>
      </Container>
    </>
  );
}
