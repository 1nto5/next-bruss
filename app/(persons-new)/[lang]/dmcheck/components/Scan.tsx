'use client';

import { useFormState } from 'react-dom';
import { useEffect } from 'react';
import { save } from '../actions';
import { toast } from 'sonner';
import { ScanInput } from './ScanInput';
import useSound from 'use-sound';
import { useSearchParams } from 'next/navigation';

const initialState = {
  message: '',
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
  const volume = parseFloat(searchParams.get('volume') || '0.75');
  if (isNaN(volume) || volume < 0 || volume > 1) {
    throw new Error(
      'Invalid volume value. Please provide a value between 0.0 and 1.0.',
    );
  }
  const [playSuccess, { sound: successSound }] = useSound('/success.wav', {
    volume: volume,
  });
  useEffect(() => {
    switch (state?.message) {
      case 'dmc saved':
        playSuccess();
        toast.success(cDict.toast.dmcSaved);
        break;
      case 'batch saved':
        playSuccess();
        toast.success(cDict.toast.batchSaved);
        break;
      case 'dmc exists':
        toast.error(cDict.toast.dmcExists);
        break;
      case 'batch exists':
        toast.error(cDict.toast.batchExists);
        break;
      case 'dmc not valid':
        playSuccess();

        toast.error(cDict.toast.dmcNotValid);
        break;
      case 'qr not valid':
        toast.error(cDict.toast.qrNotValid);
        break;
      case 'article not found' || 'wrong article config id':
        toast.error(cDict.toast.articleNotFound);
        break;
      case 'ford date not valid':
        toast.error(cDict.toast.fordDateNotValid);
        break;
      case 'bmw date not valid':
        toast.error(cDict.toast.bmwDateNotValid);
        break;
      case 'qr wrong article':
        toast.error(cDict.toast.qrWrongArticle);
        break;
      case 'qr wrong quantity':
        toast.error(cDict.toast.qrWrongQuantity);
        break;
      case 'qr wrong process':
        toast.error(cDict.toast.qrWrongProcess);
        break;
      case 'saving error':
        toast.error(cDict.toast.unknownSavingError);
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
