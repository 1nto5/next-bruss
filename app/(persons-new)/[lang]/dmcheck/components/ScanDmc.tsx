'use client';

import { useFormState } from 'react-dom';
import { useFormStatus } from 'react-dom';
import { useState, useEffect } from 'react';
import { saveDmc } from '../actions';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';

const initialState = {
  message: '',
};

type PersonLoginProps = {
  cDict: any;
  articleConfigId: string;
  operatorPersonalNumber: string;
};

export function ScanDmc({
  cDict,
  articleConfigId,
  operatorPersonalNumber,
}: PersonLoginProps) {
  const [dmcInput, setDmcInput] = useState('');
  const [state, formAction] = useFormState(saveDmc, initialState);
  const { pending } = useFormStatus();

  useEffect(() => {
    setDmcInput('');
    if (state?.message === 'wrong article config id') {
      toast.error('test');
    } else if (state?.message === 'not valid') {
      toast.error('not valid');
    } else if (state?.message === 'saved') {
      toast.success('saved');
    } else {
      console.log('state?.message', state?.message);
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
        <Input
          id='dmc'
          name='dmc'
          type='text'
          value={dmcInput}
          onChange={(e) => setDmcInput(e.target.value)}
          placeholder={cDict.dmcScanInputPlaceholder}
          className='text-center'
        />
        <input type='submit' hidden />
      </form>
    </>
  );
}
