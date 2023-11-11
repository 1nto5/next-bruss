'use client';

import { useContext } from 'react';
import StatusBox from '@/app/components/StatusBox';
import { PersonContext } from '../../lib/PersonContext';
import { countOnPallet } from '../../actions';
import { shortenLastName } from '@/lib/utils/nameFormat';

export default function Status() {
  const personContext = useContext(PersonContext);
  return (
    <div className='flex flex-row items-center justify-between bg-slate-100 pb-4 pt-4 shadow-md dark:bg-slate-800'>
      <StatusBox
        name='operator:'
        value={
          personContext?.person.number
            ? `${personContext?.person.number} (${
                personContext.person.name &&
                shortenLastName(personContext?.person.name)
              })`
            : 'brak'
        }
        width='w-1/4'
      />
      <div className='h-20 border-l-2 border-slate-200 dark:border-slate-700'></div>
    </div>
  );
}
