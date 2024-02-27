'use client';

import { useFormState } from 'react-dom';
import { useFormStatus } from 'react-dom';
import { useState, useEffect } from 'react';
import { personLogin } from '../actions';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { useRouter, usePathname } from 'next/navigation';

const initialState = {
  message: '',
};

type PersonLoginProps = {
  cDict: any;
  lang: string;
};

export function PersonLogin({ cDict, lang }: PersonLoginProps) {
  const [state, formAction] = useFormState(personLogin, initialState);
  const { pending } = useFormStatus();
  const [personalNumber, setPersonalNumber] = useState('');

  const router = useRouter();
  const pathname = usePathname();

  const handleNumberClick = (number: number) => {
    setPersonalNumber(personalNumber + number.toString());
  };

  useEffect(() => {
    if (state?.message === 'not valid') {
      toast.error(cDict.loginNotValid);
    } else if (state?.message === 'error') {
      toast.error(cDict.loginNotValid);
    } else if (state?.message === 'not exist') {
      toast.error(cDict.loginNotExist);
    } else {
      router.push(pathname + `/${state?.message}`);
    }
    setPersonalNumber('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <form action={formAction} className='grid grid-cols-3 gap-4'>
      <Input
        autoFocus
        id='personalNumber'
        name='personalNumber'
        type='text'
        placeholder={cDict.personalNumberInputPlaceholder}
        value={personalNumber}
        onChange={(e) => setPersonalNumber(e.target.value)}
        className='col-span-3'
      />
      {lang !== 'de' && (
        <>
          {Array.from(Array(9).keys()).map((number) => (
            <Button
              type='button'
              className='w-18 h-14'
              variant='outline'
              key={number + 1}
              onClick={() => handleNumberClick(number + 1)}
            >
              {number + 1}
            </Button>
          ))}
          <Button
            type='button'
            variant='destructive'
            onClick={() => setPersonalNumber('')}
            className='w-18 h-14'
          >
            Reset
          </Button>
          <Button
            type='button'
            className='w-18 h-14'
            variant='outline'
            onClick={() => handleNumberClick(0)}
          >
            0
          </Button>
          <Button type='submit' aria-disabled={pending} className='w-18 h-14'>
            {cDict.confirmButton}
          </Button>
        </>
      )}
    </form>
  );
}
