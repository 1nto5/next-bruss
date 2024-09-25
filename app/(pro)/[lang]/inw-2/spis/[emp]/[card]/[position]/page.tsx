import Container from '@/components/ui/container';
import { Locale } from '@/i18n.config';
import { redirect } from 'next/navigation';
import { getCardInfo, getPosition } from '../../../actions';
import Header from '../../../components/Header';
import PositionEdit from '../../../components/PositionEdit';
// import { getEmpCards } from '../actions';

export default async function ArticleSelectionPage({
  params: { lang, emp, card, position },
}: {
  params: { lang: Locale; emp: string; card: string; position: string };
}) {
  const cardInfo = await getCardInfo(card);
  const positionData = await getPosition(card, position);
  if (!positionData === null) {
    const { _id, ...rest } = positionData;
  }

  return (
    <>
      <Header emp={emp} card={positionData && card} />
      <Container>
        <main className='flex justify-center'>
          <PositionEdit
            cardInfo={cardInfo}
            positionData={positionData}
            positionNumber={position}
          />
        </main>
      </Container>
    </>
  );
}
