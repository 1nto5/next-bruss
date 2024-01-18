import { useContext } from 'react';
import toast from 'react-hot-toast';
import { ArticleContext } from '@/app/(persons)/pro/lib/ArticleContext';

type VariantSelectorProps = {
  boxSize: number[];
};

export default function VariantSelector(props: VariantSelectorProps) {
  const articleContext = useContext(ArticleContext);

  const handleClick = (boxSize: number) => {
    const currentArticle = articleContext?.article;

    if (currentArticle) {
      articleContext?.setArticle({
        ...currentArticle,
        boxSize: boxSize,
      });
      toast.success('Artikel eingeloggt!', { id: 'success' });
    }
  };

  return (
    <div className='mb-4 mt-4 flex flex-wrap items-center justify-center'>
      {props.boxSize?.map((item) => (
        <button
          key={item}
          onClick={() => handleClick(item)}
          className='m-8 rounded bg-slate-200 p-6 text-center text-3xl text-slate-900 shadow-sm hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600'
        >
          <div className='flex flex-col items-center'>
            <span className='font-4xl'>{item}</span>
            <span className='text-lg font-thin'></span>
          </div>
        </button>
      ))}
    </div>
  );
}
