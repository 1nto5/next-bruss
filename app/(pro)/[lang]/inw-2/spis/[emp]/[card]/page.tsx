import Container from '@/components/ui/container';
import { Locale } from '@/i18n.config';
import { redirect } from 'next/navigation';
import { getCardPositions } from '../../actions';
import Header from '../../components/Header';
import PositionSelection from '../../components/PositionSelection';
// import { getEmpCards } from '../actions';

export default async function ArticleSelectionPage({
  params: { lang, emp, card },
}: {
  params: { lang: Locale; emp: string; card: string };
}) {
  const positions = await getCardPositions(card, emp);
  if (!positions[0]) {
    redirect(`/inw-2/spis/${emp}/${card}/1`);
  }
  return (
    <>
      <Header emp={emp} />
      <Container>
        <main className='flex justify-center'>
          <PositionSelection emp={emp} card={card} positions={positions} />
        </main>
      </Container>
    </>
  );
}
