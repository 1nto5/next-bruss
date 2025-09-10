'use client';

import { useContext } from 'react';
import { PersonContext } from '../lib/PersonContext';
import { ArticleContext } from '../lib/ArticleContext';
import toast from 'react-hot-toast';

type HeaderProps = {
  title: string;
  showArticleLogOut?: boolean;
  showPersonLogOut?: boolean;
};

const Header: React.FC<HeaderProps> = ({
  title,
  showArticleLogOut = true,
  showPersonLogOut = true,
}) => {
  const personContext = useContext(PersonContext);
  const articleContext = useContext(ArticleContext);
  return (
    <div className='flex h-16 items-center justify-between border-b border-slate-200 bg-slate-100 p-2 shadow-md dark:border-slate-700 dark:bg-slate-800'>
      <h1 className='ml-2 mr-4 text-lg font-thin text-slate-900 dark:text-slate-100'>
        {title}
      </h1>
      <div className='mr-2 flex space-x-4'>
        {showArticleLogOut && articleContext?.article?.number && (
          <button
            onClick={() => {
              toast.success(`Artykuł wylogowany!`, { id: 'success' });
              articleContext.setArticle(() => ({
                number: null,
                name: null,
              }));
            }}
            className='w-20 rounded bg-slate-200 p-2 text-center text-lg font-extralight text-slate-900 shadow-xs hover:bg-bruss dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-bruss'
            type='button'
          >
            artykuł
          </button>
        )}
        {showPersonLogOut && personContext?.person?.number && (
          <button
            onClick={() => {
              toast.success(`${personContext.person?.number} wylogowany!`, {
                id: 'success',
              });
              personContext.setPerson(() => ({
                number: null,
                name: null,
              }));
            }}
            className='w-20 rounded bg-red-600 p-2 text-center text-lg font-extralight text-slate-100 shadow-xs hover:bg-red-500 dark:bg-red-900 dark:text-slate-50 dark:hover:bg-red-700'
            type='button'
          >
            wyloguj
          </button>
        )}
      </div>
    </div>
  );
};

export default Header;
