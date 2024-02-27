'use client';

import { useFormState } from 'react-dom';
import { useEffect } from 'react';
import { save } from '../actions';
import { toast } from 'sonner';
import { ScanInput } from './ScanInput';
import useSound from 'use-sound';

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
  const [playSuccess, { sound: successSound }] = useSound('/success.mp3');
  const [playError, { sound: errorSound }] = useSound('/error.mp3');
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
        playError();
        toast.error(cDict.toast.batchExists);
        break;
      case 'dmc not valid':
        playError();
        toast.error(cDict.toast.dmcNotValid);
        break;
      case 'qr not valid':
        playError();
        toast.error(cDict.toast.qrNotValid);
        break;
      case 'article not found' || 'wrong article config id':
        playError();
        toast.error(cDict.toast.articleNotFound);
        break;
      case 'ford date not valid':
        playError();
        toast.error(cDict.toast.fordDateNotValid);
        break;
      case 'bmw date not valid':
        playError();
        toast.error(cDict.toast.bmwDateNotValid);
        break;
      case 'qr wrong article':
        playError();
        toast.error(cDict.toast.qrWrongArticle);
        break;
      case 'qr wrong quantity':
        playError();
        toast.error(cDict.toast.qrWrongQuantity);
        break;
      case 'qr wrong process':
        playError();
        toast.error(cDict.toast.qrWrongProcess);
        break;
      case 'saving error':
        playError();
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
