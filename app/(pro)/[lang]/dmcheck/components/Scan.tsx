'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect } from 'react';
import { useFormState } from 'react-dom';
import { toast } from 'sonner';
import useSound from 'use-sound';
import { save } from '../actions';
import { LastFiveTable } from './last-five-table';
import { ScanInput } from './scan-input';

const initialState: { message: string; dmc?: string; time?: string } = {
  message: '',
  dmc: '',
  time: '',
};

type ScanProps = {
  cDict: any;
  boxIsFull: boolean;
  palletIsFull: boolean;
  articleConfigId: string;
  operatorPersonalNumber: string;
};

export function Scan({
  cDict,
  boxIsFull,
  palletIsFull,
  articleConfigId,
  operatorPersonalNumber,
}: ScanProps) {
  const [state, formAction] = useFormState(save, initialState);
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const volume = parseFloat(searchParams.get('volume') || '0.75');
  if (isNaN(volume) || volume < 0 || volume > 1) {
    throw new Error(
      'Invalid volume value. Please provide a value between 0.0 and 1.0.',
    );
  }
  const [playOk, { sound: okSound }] = useSound('/ok.wav', {
    volume: volume,
  });

  const [playNok, { sound: nokSound }] = useSound('/nok.mp3', {
    volume: volume,
  });

  const createQueryString = useCallback(
    (dmc: string, time: string) => {
      const params = new URLSearchParams(searchParams.toString());

      const prevLastFive = params.get('lastFive') || '';
      let lastFiveArray = prevLastFive ? prevLastFive.split(',') : [];

      // Dodaj nową parę na początek tablicy
      lastFiveArray.unshift(dmc, time);

      // Jeśli liczba elementów przekracza 10, usuń najstarsze elementy z końca tablicy
      if (lastFiveArray.length > 10) {
        lastFiveArray = lastFiveArray.slice(0, 10);
      }

      // Ustaw parametr lastFive z nową wartością
      params.set('lastFive', lastFiveArray.join(','));
      return params.toString();
    },
    [searchParams],
  );

  useEffect(() => {
    switch (state?.message) {
      case 'dmc saved':
        playOk();
        toast.success(cDict.toast.dmcSaved);
        console.log(state.dmc, state.time);
        state.dmc &&
          state.time &&
          router.push(
            pathname + '?' + createQueryString(state.dmc, state.time),
          );
        break;
      case 'batch saved':
        playOk();
        toast.success(cDict.toast.batchSaved);
        break;
      case 'dmc exists':
        playNok();
        toast.error(cDict.toast.dmcExists);
        break;
      case 'batch exists':
        playNok();
        toast.error(cDict.toast.batchExists);
        break;
      case 'dmc not valid':
        playNok();
        toast.error(cDict.toast.dmcNotValid);
        break;
      case 'qr not valid':
        playNok();
        toast.error(cDict.toast.qrNotValid);
        break;
      case 'article not found' || 'wrong article config id':
        playNok();
        toast.error(cDict.toast.articleNotFound);
        break;
      case 'ford date not valid':
        playNok();
        toast.error(cDict.toast.fordDateNotValid);
        break;
      case 'bmw date not valid':
        playNok();
        toast.error(cDict.toast.bmwDateNotValid);
        break;
      case 'qr wrong article':
        playNok();
        toast.error(cDict.toast.qrWrongArticle);
        break;
      case 'qr wrong quantity':
        playNok();
        toast.error(cDict.toast.qrWrongQuantity);
        break;
      case 'qr wrong process':
        playNok();
        toast.error(cDict.toast.qrWrongProcess);
        break;
      // case 'saving error':
      //   playNok();
      //   toast.error(cDict.toast.unknownSavingError);
      //   break;
      case '40040 nok':
        playNok();
        toast.error(cDict.toast.nok);
        break;
      case 'smart not found':
        playNok();
        toast.error('Nie znaleziono w bazie SMART!');
        break;
      case 'smart unknown':
        playNok();
        toast.error('SMART: Część nieprzeprocesowana na wszystkich stacjach!');
        break;
      case 'smart nok':
        playNok();
        toast.error('SMART: Część otrzymała status NOK na jednej ze stacji!'); // can we determine which station in the future?
        break;
      case 'smart pattern':
        playNok();
        toast.error('SMART: Część jest wzornikiem!');
        break;
      case 'smart fetch error':
        playNok();
        toast.error('Problem połączenia z bazą SMART!');
        break;
      default:
        break;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <>
      <form action={formAction}>
        <input
          hidden
          type='text'
          id='articleConfigId'
          name='articleConfigId'
          defaultValue={articleConfigId}
        />
        <input
          hidden
          type='text'
          id='operatorPersonalNumber'
          name='operatorPersonalNumber'
          defaultValue={operatorPersonalNumber}
        />
        {!boxIsFull && !palletIsFull && (
          <ScanInput
            name='dmc'
            placeholder={cDict.dmcScanInputPlaceholder}
            savingPlaceholder={cDict.scanInputSavingPlaceholder}
          />
        )}
        {boxIsFull && !palletIsFull && (
          <ScanInput
            name='hydra'
            placeholder={cDict.hydraScanInputPlaceholder}
            savingPlaceholder={cDict.scanInputSavingPlaceholder}
          />
        )}
        {palletIsFull && (
          <ScanInput
            name='pallet'
            placeholder={cDict.palletScanInputPlaceholder}
            savingPlaceholder={cDict.scanInputSavingPlaceholder}
          />
        )}
      </form>
    </>
  );
}
