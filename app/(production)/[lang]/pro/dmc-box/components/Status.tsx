'use client';

import { useContext } from 'react';
import StatusBox from '@/app/(persons)/[lang]/components/StatusBox';
import { PersonContext } from '../../lib/PersonContext';
import { ArticleContext } from '../../lib/ArticleContext';
import { shortenLastName } from '@/lib/utils/nameFormat';

type StatusProps = {
  inBox: number;
  boxSize: number;
  isFullBox: boolean;
  isPending: boolean;
};

export default function Status(props: StatusProps) {
  const personContext = useContext(PersonContext);
  const articleContext = useContext(ArticleContext);
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
        width='w-4/12'
      />
      <StatusBox
        name={`artykuł:`}
        value={
          articleContext?.article?.number
            ? `${articleContext?.article.name} (${articleContext?.article.number})`
            : 'brak'
        }
        width='w-6/12'
      />
      <StatusBox
        name='w boxie:'
        value={`${props.inBox}/${props.boxSize}`}
        width='w-2/12'
        loading={props.isPending}
        full={props.isFullBox}
      />
    </div>
  );
}
