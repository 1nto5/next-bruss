'use client';

import { useFormState } from 'react-dom';
import { useEffect } from 'react';
import { saveDmc } from '../actions';
import { toast } from 'sonner';
import { ScanInput } from './ScanInput';

const initialState = {
  message: '',
};

type ScanDmcProps = {
  cDict: any;
  articleConfigId: string;
  operatorPersonalNumber: string;
};

export function ScanDmc({
  cDict,
  articleConfigId,
  operatorPersonalNumber,
}: ScanDmcProps) {
  const [state, formAction] = useFormState(saveDmc, initialState);

  useEffect(() => {
    switch (state?.message) {
      case 'saved':
        toast.success(cDict.toast.dmcSaved);
        break;
      case 'exists':
        toast.error(cDict.toast.dmcExists);
        break;
      case 'not valid':
        toast.error(cDict.toast.dmcNotValid);
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
      case 'saving dmc error':
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
          name='dmc'
          placeholder={cDict.dmcScanInputPlaceholder}
          savingPlaceholder={cDict.scanInputSavingPlaceholder}
        />
      </form>
    </>
  );
}
