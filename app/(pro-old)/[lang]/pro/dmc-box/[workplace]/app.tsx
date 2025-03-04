'use client';

import { countInBox, getBoxSize } from '@/app/(pro-old)/[lang]/pro/actions';
import ArticleSelector from '@/app/(pro-old)/[lang]/pro/components/ArticleSelector';
import NumLogIn from '@/app/(pro-old)/[lang]/pro/components/NumLogIn';
import ScanDmc from '@/app/(pro-old)/[lang]/pro/components/ScanDmc';
import ScanHydraQr from '@/app/(pro-old)/[lang]/pro/components/ScanHydraQr';
import config from '@/app/(pro-old)/[lang]/pro/config';
import { ArticleContext } from '@/app/(pro-old)/[lang]/pro/lib/ArticleContext';
import { PersonContext } from '@/app/(pro-old)/[lang]/pro/lib/PersonContext';
import { ScanContext } from '@/app/(pro-old)/[lang]/pro/lib/ScanContext';
import { usePathname } from 'next/navigation';
import { useContext, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import Status from '../components/Status';

export default function App() {
  const personContext = useContext(PersonContext);
  const scanContext = useContext(ScanContext);
  const articleContext = useContext(ArticleContext);
  const pathname = usePathname();
  const workplace = pathname?.split('/').pop();
  const workplaceType = pathname?.split('/')[3];
  const workplaceExists = config.some(
    (item) => item.workplace === workplace && item.type === workplaceType,
  );
  const articleExists = config.some(
    (item) =>
      item.article === articleContext?.article?.number &&
      item.type === workplaceType &&
      item.workplace === workplace,
  );
  const [isPending, setIsPending] = useState(true);
  const [inBox, setInBox] = useState(0);
  const [boxSize, setBoxSize] = useState(0);
  const [isFullBox, setIsFullBox] = useState(false);

  useEffect(() => {
    if (
      !workplace ||
      !articleContext?.article?.number ||
      !personContext?.person?.number
    ) {
      setIsPending(false);
      return;
    }
    if (!articleExists) {
      articleContext?.setArticle(() => ({
        number: null,
        name: null,
      }));
      setIsPending(false);
      return;
    }
    (async () => {
      setIsPending(true);
      // toast.loading('Ładowanie...', { id: 'loading' });
      try {
        if (!articleContext?.article?.number) {
          throw new Error('Article number is missing');
        }
        const [inBox, boxSize] = await Promise.all([
          countInBox(workplace, articleContext?.article.number),
          getBoxSize(workplace, articleContext?.article.number),
        ]);
        setInBox(inBox);
        if (!boxSize) {
          toast.error('Niepoprawny artykuł!', { id: 'error' });
          throw new Error('Box size is missing');
        }
        setBoxSize(boxSize);
        setIsFullBox(inBox === boxSize);
      } catch (error) {
        toast.error('Skontaktuj się z IT!', { id: 'error' });
        console.error('Failed to fetch quantity on a pallet:', error);
      } finally {
        setIsPending(false);
        // toast.dismiss('loading');
      }
    })();
  }, [
    workplace,
    scanContext?.scan.last,
    articleContext?.article?.number,
    articleContext,
    personContext?.person?.number,
    articleExists,
  ]);

  if (!workplaceExists || !workplace) {
    return (
      <div className='text-center'>
        <p className='mt-10'>
          The workplace does not exist in the configuration!
        </p>
      </div>
    );
  }

  return (
    <>
      <Status
        inBox={inBox}
        boxSize={boxSize}
        isFullBox={isFullBox}
        isPending={isPending}
      />
      {!personContext?.person?.number ? (
        <NumLogIn />
      ) : (
        <>
          {!articleContext?.article?.number || !articleContext.article.name ? (
            <ArticleSelector workplace={workplace} />
          ) : (
            <>
              {!isFullBox && (
                <ScanDmc
                  workplace={workplace}
                  article={articleContext.article.number}
                  operator={personContext.person.number}
                />
              )}
              {!isPending && isFullBox && (
                <ScanHydraQr
                  workplace={workplace}
                  article={articleContext.article.number}
                  operator={personContext.person.number}
                />
              )}
            </>
          )}
        </>
      )}
    </>
  );
}
