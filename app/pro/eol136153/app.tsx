'use client';

import { useContext, useTransition, useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { PersonContext } from '../lib/PersonContext';
import { ScanContext } from '../lib/ScanContext';
import { countOnPallet, getPalletSize } from '../actions';
import NumLogIn from '../components/NumLogIn';
import Status from './components/Status';
import ScanHydraQr from './components/ScanHydraQr';
import ScanPalletQr from './components/ScanPalletQr';
import PrintPalletLabel from './components/PrintPalletLabel';
import toast from 'react-hot-toast';

const article136 = '28067';
const article153 = '28042';

export default function App() {
  const personContext = useContext(PersonContext);
  const scanContext = useContext(ScanContext);
  const pathname = usePathname();
  const workplace = pathname.split('pro/')[1];
  //   const [isPending, startTransition] = useTransition();
  const [isPending, setIsPending] = useState(true);
  const [onPallet136, setOnPallet136] = useState(0);
  const [palletSize136, setPalletSize136] = useState(0);
  const [isFull136, setIsFull136] = useState(false);
  const [onPallet153, setOnPallet153] = useState(0);
  const [palletSize153, setPalletSize153] = useState(0);
  const [isFull153, setIsFull153] = useState(false);

  useEffect(() => {
    (async () => {
      setIsPending(true);
      toast.loading('Ładowanie...', { id: 'loading' });
      try {
        const [onPallet136, onPallet153, palletSize136, palletSize153] =
          await Promise.all([
            countOnPallet(workplace, article136),
            countOnPallet(workplace, article153),
            getPalletSize(workplace, article136),
            getPalletSize(workplace, article153),
          ]);
        setOnPallet136(onPallet136);
        setOnPallet153(onPallet153);
        if (!palletSize136 || !palletSize153) {
          throw new Error('Failed to fetch pallet size');
        }
        setPalletSize136(palletSize136);
        setPalletSize153(palletSize153);
        setIsFull136(onPallet136 === palletSize136);
        setIsFull153(onPallet153 === palletSize153);
      } catch (error) {
        console.error('Failed to fetch quantity on a pallet:', error);
      } finally {
        setIsPending(false);
        toast.dismiss('loading');
      }
    })();
  }, [workplace, scanContext?.scan.last]);

  return (
    <>
      {!personContext?.person.number ? (
        <NumLogIn />
      ) : (
        <>
          <Status
            onPallet153={onPallet153}
            palletSize153={palletSize153}
            onPallet136={onPallet136}
            palletSize136={palletSize136}
            isFull153={isFull153}
            isFull136={isFull136}
            isPending={isPending}
          />
          {!isFull136 && !isFull153 && !isPending && (
            <ScanHydraQr operator={personContext.person.number} />
          )}
          {isFull136 && !isPending && (
            <>
              <ScanPalletQr
                workplace='eol136153'
                operator={personContext.person.number}
                article={article136}
                quantityOnPallet={onPallet136}
                palletSize={palletSize136}
              />
              <PrintPalletLabel
                articleNumber='28067'
                articleName='M-136-K-1-A'
                quantityOnPallet={onPallet136}
              />
            </>
          )}
          {isFull153 && !isPending && (
            <>
              <ScanPalletQr
                workplace='eol136153'
                operator={personContext.person.number}
                article={article153}
                quantityOnPallet={onPallet153}
                palletSize={palletSize153}
              />
              <PrintPalletLabel
                articleNumber='28042'
                articleName='M-153-K-C'
                quantityOnPallet={onPallet153}
              />
            </>
          )}
        </>
      )}
    </>
  );
}
