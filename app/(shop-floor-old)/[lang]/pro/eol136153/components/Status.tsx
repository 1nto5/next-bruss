'use client';

import StatusBox from '@/app/(shop-floor-old)/[lang]/components/StatusBox';
import { shortenLastName } from '@/lib/utils/name-format';
import { useContext } from 'react';
import { PersonContext } from '../../lib/PersonContext';

type StatusProps = {
  onPallet153: number;
  palletSize153: number;
  onPallet136: number;
  palletSize136: number;
  isFull153: boolean;
  isFull136: boolean;
  isPending: boolean;
};

export default function Status(props: StatusProps) {
  const personContext = useContext(PersonContext);
  return (
    <div className='flex flex-row items-center justify-between bg-slate-100 pb-4 pt-4 shadow-md dark:bg-slate-800'>
      <StatusBox
        name='operator:'
        value={
          personContext?.person?.number
            ? `${personContext?.person.number} (${
                personContext.person.name &&
                shortenLastName(personContext?.person.name)
              })`
            : 'brak'
        }
        width='w-1/3'
      />
      <StatusBox
        name='153 (28042):'
        value={`${props.onPallet153}/${props.palletSize153}`}
        width='w-1/3'
        loading={props.isPending}
        full={props.isFull153}
      />
      <StatusBox
        name='136 (28067):'
        value={`${props.onPallet136}/${props.palletSize136}`}
        width='w-1/3'
        loading={props.isPending}
        full={props.isFull136}
        separator={false}
      />
    </div>
  );
}
