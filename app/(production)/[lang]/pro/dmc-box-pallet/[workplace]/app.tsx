'use client';

import { useContext, useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { PersonContext } from '@/app/(persons)/[lang]/pro/lib/PersonContext';
import { ScanContext } from '@/app/(persons)/[lang]/pro/lib/ScanContext';
import { ArticleContext } from '@/app/(persons)/[lang]/pro/lib/ArticleContext';
import {
  countBoxesOnPallet,
  getPalletSize,
  countInBox,
  getBoxSize,
} from '@/app/(persons)/[lang]/pro/actions';
import NumLogIn from '@/app/(persons)/[lang]/pro/components/NumLogIn';
import Status from '../components/Status';
import ArticleSelector from '@/app/(persons)/[lang]/pro/components/ArticleSelector';
import ScanDmc from '@/app/(persons)/[lang]/pro/components/ScanDmc';
import ScanHydraQr from '@/app/(persons)/[lang]/pro/components/ScanHydraQr';
import ScanPalletQr from '@/app/(persons)/[lang]/pro/components/ScanPalletQr';
import PrintPalletLabel from '@/app/(persons)/[lang]/pro/components/PrintPalletLabel';
import toast from 'react-hot-toast';
import config from '@/app/(persons)/[lang]/pro/config';

export default function App() {
  const personContext = useContext(PersonContext);
  const scanContext = useContext(ScanContext);
  const articleContext = useContext(ArticleContext);
  const pathname = usePathname();
  const workplace = pathname.split('/').pop();
  const workplaceType = pathname.split('/')[3];
  const workplaceExists = config.some(
    (item) => item.workplace === workplace && item.type === workplaceType,
  );
  const articleExists = config.some(
    (item) =>
      item.article === articleContext?.article?.number &&
      item.type === workplaceType &&
      item.workplace === workplace,
  );
  const [isPending, setIsPending] = useState(false);
  const [inBox, setInBox] = useState(0);
  const [boxSize, setBoxSize] = useState(0);
  const [isFullBox, setIsFullBox] = useState(false);
  const [boxesOnPallet, setBoxesOnPallet] = useState(0);
  const [palletSize, setPalletSize] = useState(0);
  const [isFullPallet, setIsFullPallet] = useState(false);

  useEffect(() => {
    if (
      !workplace ||
      !articleContext?.article?.number ||
      !personContext?.person?.number
    ) {
      return;
    }
    if (!articleExists) {
      articleContext?.setArticle(() => ({
        number: null,
        name: null,
      }));
      return;
    }
    (async () => {
      setIsPending(true);
      // toast.loading('Ładowanie...', { id: 'loading' });
      try {
        if (!articleContext?.article?.number) {
          throw new Error('Article number is missing');
        }
        const [boxesOnPallet, palletSize, inBox, boxSize] = await Promise.all([
          countBoxesOnPallet(workplace, articleContext?.article.number),
          getPalletSize(workplace, articleContext?.article.number),
          countInBox(workplace, articleContext?.article.number),
          getBoxSize(workplace, articleContext?.article.number),
        ]);
        setBoxesOnPallet(boxesOnPallet);
        setInBox(inBox);
        if (!palletSize || !boxSize) {
          toast.error('Skontaktuj się z IT!', { id: 'error' });
          throw new Error('Pallet or box size is missing');
        }
        setPalletSize(palletSize);
        setBoxSize(boxSize);
        setIsFullPallet(boxesOnPallet === palletSize);
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
    boxesOnPallet,
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
        onPallet={boxesOnPallet}
        palletSize={palletSize}
        isFullPallet={isFullPallet}
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
              {!isFullPallet && !isFullBox && (
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
              {!isPending && isFullPallet && (
                <>
                  <ScanPalletQr
                    workplace={workplace}
                    operator={personContext.person.number}
                    article={articleContext?.article.number}
                  />
                  <PrintPalletLabel
                    workplace={workplace}
                    articleNumber={articleContext?.article.number}
                    articleName={articleContext?.article.name}
                  />
                </>
              )}
            </>
          )}
        </>
      )}
    </>
  );
}
