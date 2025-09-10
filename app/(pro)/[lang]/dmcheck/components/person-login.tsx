'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { usePathname, useRouter } from 'next/navigation';
import { useActionState, useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { personLogin } from '../actions';

const initialState = {
  message: '',
};

type PersonLoginProps = {
  cDict: any;
  lang: string;
};

const buttonClass = 'h-14 w-28';

export function PersonLogin({ cDict, lang }: PersonLoginProps) {
  const [state, formAction, pending] = useActionState(
    personLogin,
    initialState,
  );
  const [personalNumber, setPersonalNumber] = useState('');

  const router = useRouter();
  const pathname = usePathname();

  // Optimised by memoizing the click handler
  const handleNumberClick = useCallback((number: number) => {
    setPersonalNumber((prev) => prev + number.toString());
  }, []);

  useEffect(() => {
    if (!state) return;
    if (state.message === 'not valid') {
      toast.error(cDict.loginNotValid);
    } else if (state.message === 'not exist') {
      toast.error(cDict.loginNotExist);
    } else if (state.message) {
      router.push(pathname + `/${state.message}`);
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
        autoComplete='off'
      />
      {lang !== 'de' && (
        <>
          {
            // Render digits 1-9 from a numeric array
            [1, 2, 3, 4, 5, 6, 7, 8, 9].map((number) => (
              <Button
                key={number}
                type='button'
                className={buttonClass}
                variant='outline'
                onClick={() => handleNumberClick(number)}
              >
                {number}
              </Button>
            ))
          }
          <Button
            type='button'
            variant='destructive'
            onClick={() => setPersonalNumber('')}
            className={buttonClass}
          >
            Reset
          </Button>
          <Button
            type='button'
            className={buttonClass}
            variant='outline'
            onClick={() => handleNumberClick(0)}
          >
            0
          </Button>
          <Button type='submit' aria-disabled={pending} className={buttonClass}>
            {cDict.confirmButton}
          </Button>
        </>
      )}
    </form>
  );
}
