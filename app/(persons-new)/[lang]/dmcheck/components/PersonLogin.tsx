'use client';

import { useFormState } from 'react-dom';
import { useFormStatus } from 'react-dom';
import { useState } from 'react';
import { useEffect } from 'react';

import { personLogin } from '../actions';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';

const initialState = {
  message: '',
};

type PersonLoginProps = {
  cDict: any;
  workplaceName: string;
  articleConfigId: string;
};

export function PersonLogin({
  cDict,
  workplaceName,
  articleConfigId,
}: PersonLoginProps) {
  const [state, formAction] = useFormState(personLogin, initialState);
  const { pending } = useFormStatus();

  const router = useRouter();

  useEffect(() => {
    if (state.message === 'not valid') {
      toast.error('not valid');
    }
    if (state.message === 'error') {
      toast(state.message);
    }
  }, [state]);

  const [personalNumber, setPersonalNumber] = useState('');

  const handleNumberClick = (number: number) => {
    setPersonalNumber(personalNumber + number.toString());
  };

  return (
    <form action={formAction} className='grid grid-cols-3 gap-4'>
      <Input
        id='personalNumber'
        name='personalNumber'
        type='text'
        placeholder={cDict.personalNumberInputPlaceholder}
        value={personalNumber}
        onChange={(e) => setPersonalNumber(e.target.value)}
        className='col-span-3'
      />
      {Array.from(Array(9).keys()).map((number) => (
        <Button
          type='button'
          className='h-24 w-24'
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
        className='h-24 w-24'
      >
        Reset
      </Button>
      <Button
        type='button'
        className='h-24 w-24'
        variant='outline'
        onClick={() => handleNumberClick(0)}
      >
        0
      </Button>
      <Button type='submit' aria-disabled={pending} className='h-24 w-24'>
        {cDict.confirmButton}
      </Button>
    </form>
  );
}
