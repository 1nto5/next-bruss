import { useContext } from 'react';
import config from '@/app/(persons)/pro/config';
import toast from 'react-hot-toast';
import { ArticleContext } from '@/app/(persons)/pro/lib/ArticleContext';
type StatusProps = {
  workplace: string;
};

export default function ArticleSelector(props: StatusProps) {
  const articleContext = useContext(ArticleContext);
  const articles = config
    .filter((item) => item.article !== '')
    .sort((a, b) =>
      a.article.localeCompare(b.article, undefined, {
        numeric: true,
        sensitivity: 'base',
      }),
    );

  const handleClick = (
    number: string,
    name: string,
    boxSize: number | number[],
  ) => {
    articleContext?.setArticle({ number, name, boxSize });
    toast.success('Artikel eingeloggt!', { id: 'success' });
  };

  return (
    <div className='mb-4 mt-4 flex flex-wrap items-center justify-center'>
      {articles?.map((item) => (
        <button
          key={item.article}
          onClick={() => handleClick(item.article, item.name, item.boxSize)}
          className='m-8 rounded bg-slate-200 p-6 text-center text-3xl text-slate-900 shadow-sm hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600'
        >
          <div className='flex flex-col items-center'>
            <span className='font-4xl'>{item.article}</span>
            <span className='text-lg font-thin'>{item.name}</span>
          </div>
        </button>
      ))}
    </div>
  );
}
