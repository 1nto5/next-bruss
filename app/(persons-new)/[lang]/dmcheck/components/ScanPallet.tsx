'use client';

import { useFormState } from 'react-dom';
import { useEffect } from 'react';
import { savePallet } from '../actions';
import { toast } from 'sonner';
import { ScanInput } from './ScanInput';

const initialState = {
  message: '',
};

type ScanHydraProps = {
  cDict: any;
  articleConfigId: string;
  operatorPersonalNumber: string;
};

export function ScanPallet({
  cDict,
  articleConfigId,
  operatorPersonalNumber,
}: ScanHydraProps) {
  const [state, formAction] = useFormState(savePallet, initialState);

  useEffect(() => {
    switch (state?.message) {
      case 'saved':
        toast.success(cDict.toast.hydraSaved);
        break;
      case 'exists':
        toast.error(cDict.toast.hydraExists);
        break;
      case 'not valid':
        toast.error(cDict.toast.hydraNotValid);
        break;
      case 'article not found' || 'wrong article config id':
        toast.error(cDict.toast.articleNotFound);
        break;
      case 'wrong article':
        toast.error(cDict.toast.hydraWrongArticle);
        break;
      case 'wrong quantity':
        toast.error(cDict.toast.hydraWrongQuantity);
        break;
      case 'wrong process':
        toast.error(cDict.toast.hydraWrongProcess);
        break;
      case 'saving pallet error':
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
        <ScanInput
          name='pallet'
          placeholder={cDict.palletScanInputPlaceholder}
          savingPlaceholder={cDict.scanInputSavingPlaceholder}
        />
      </form>
    </>
  );
}
