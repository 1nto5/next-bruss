'use client';

import { useEffect, useTransition } from 'react';
import Status from './components/Status';
import NumLogIn from '@/app/pro/components/NumLogIn';
import ScanHydraQr from './components/ScanHydraQr';
import ScanPalletQr from './components/ScanPalletQr';
import PrintPalletLabel from './components/PrintPalletLabel';

import { countOnPallet, getPalletSize, getBoxSize } from './actions';

import toast from 'react-hot-toast';

const lArticle = '28067';
const rArticle = '28042';

export default function Page() {
  const operatorLogged = useAppSelector((state) => state.operator.loggedIn);
  const lastScan = useAppSelector((state) => state.workplace.lastScan);

  const dispatch = useDispatch();

  const isFull136 = useAppSelector((state) => state.workplace.isFull136);
  const isFull153 = useAppSelector((state) => state.workplace.isFull153);

  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    dispatch(togglePending(isPending));
  }, [dispatch, isPending]);

  useEffect(() => {
    startTransition(async () => {
      try {
        toast.loading('Ładowanie...', { id: 'loading' });
        const onPallet136 = await countOnPallet(lArticle);
        dispatch(updateOnPallet136(onPallet136));
        const onPallet153 = await countOnPallet(rArticle);
        dispatch(updateOnPallet153(onPallet153));
        const palletSize136 = await getPalletSize(lArticle);
        dispatch(updatePalletSize136(palletSize136));
        const palletSize153 = await getPalletSize(rArticle);
        dispatch(updatePalletSize153(palletSize153));
        if (onPallet136 >= palletSize136) {
          dispatch(toggleIsFull136());
        }
        if (onPallet153 >= palletSize153) {
          dispatch(toggleIsFull153());
        }
        const boxSize136 = await getBoxSize(lArticle);
        dispatch(updateBoxSize136(boxSize136));
        const boxSize153 = await getBoxSize(rArticle);
        dispatch(updateBoxSize153(boxSize153));
        toast.dismiss('loading');
      } catch (error) {
        console.error(
          'Failed to fetch quantity on a pallet, pallet size or box size:',
          error,
        );
      }
    });
  }, [dispatch, lastScan]);

  return (
    <div>
      {operatorLogged && <Status />}
      {!operatorLogged && <NumLogIn />}
      {isPending ? (
        <div></div>
      ) : (
        operatorLogged && (
          <>
            {isFull136 && (
              <>
                <ScanPalletQr article='28067' />
                <PrintPalletLabel
                  articleNumber={28067}
                  articleName='M-136-K-1-A'
                />
              </>
            )}
            {isFull153 && (
              <>
                <ScanPalletQr article='28042' />
                <PrintPalletLabel
                  articleNumber={28042}
                  articleName='M-153-K-C'
                />
              </>
            )}
            {!isFull136 && !isFull153 && <ScanHydraQr />}
          </>
        )
      )}
    </div>
  );
}
