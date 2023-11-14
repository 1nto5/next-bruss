'use client';

import { useContext, useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { PersonContext } from '@/app/pro/lib/PersonContext';
import { ScanContext } from '@/app/pro/lib/ScanContext';
import { ArticleContext } from '@/app/pro/lib/ArticleContext';
import {
  countOnPallet,
  getPalletSize,
  countInBox,
  getBoxSize,
} from '@/app/pro/actions';
import NumLogIn from '@/app/pro/components/NumLogIn';
import Status from './../components/Status';
import ArticleSelector from '@/app/pro/components/ArticleSelector';
import ScanDmc from '@/app/pro/components/ScanDmc';
import ScanHydraQr from '@/app/pro/components/ScanHydraQr';
import ScanPalletQr from './../components/ScanPalletQr';
import PrintPalletLabel from './../components/PrintPalletLabel';
import toast from 'react-hot-toast';
import config from '@/app/pro/config';

export default function App() {
  const personContext = useContext(PersonContext);
  const scanContext = useContext(ScanContext);
  const articleContext = useContext(ArticleContext);
  const pathname = usePathname();
  const workplace = pathname.split('/').pop();
  const workplaceType = pathname.split('/')[2];
  console.log('workplaceType', workplaceType);
  const workplaceExists = config.some(
    (item) => item.workplace === workplace && item.type === workplaceType,
  );
  const [isPending, setIsPending] = useState(true);
  const [inBox, setInBox] = useState(0);
  const [boxSize, setBoxSize] = useState(0);
  const [isFullBox, setIsFullBox] = useState(false);
  const [onPallet, setOnPallet] = useState(0);
  const [palletSize, setPalletSize] = useState(0);
  const [isFullPallet, setIsFullPallet] = useState(false);

  useEffect(() => {
    (async () => {
      setIsPending(true);
      toast.loading('Ładowanie...', { id: 'loading' });
      try {
        if (!articleContext?.article.number) {
          toast.error('Skontaktuj się z IT!', { id: 'error' });
          throw new Error('Article number is missing');
        }
        if (!workplace) {
          toast.error('Skontaktuj się z IT!', { id: 'error' });
          throw new Error('Workplace is missing');
        }
        const [onPallet, palletSize, inBox, boxSize] = await Promise.all([
          countOnPallet(workplace, articleContext?.article.number),
          getPalletSize(workplace, articleContext?.article.number),
          countInBox(workplace, articleContext?.article.number),
          getBoxSize(workplace, articleContext?.article.number),
        ]);
        setOnPallet(onPallet);
        setInBox(inBox);
        if (!palletSize || !boxSize) {
          toast.error('Skontaktuj się z IT!', { id: 'error' });
          throw new Error('Pallet or box size is missing');
        }
        setPalletSize(palletSize);
        setBoxSize(boxSize);
        setIsFullPallet(onPallet === palletSize);
        setIsFullBox(inBox === boxSize);
      } catch (error) {
        toast.error('Skontaktuj się z IT!', { id: 'error' });
        console.error('Failed to fetch quantity on a pallet:', error);
      } finally {
        setIsPending(false);
        toast.dismiss('loading');
      }
    })();
  }, [workplace, scanContext?.scan.last, articleContext?.article.number]);

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
        onPallet={onPallet}
        palletSize={palletSize}
        isFullPallet={isFullPallet}
        inBox={inBox}
        boxSize={boxSize}
        isFullBox={isFullBox}
        isPending={isPending}
      />
      {!isPending &&
        (!personContext?.person.number ? (
          <NumLogIn />
        ) : (
          <>
            {!articleContext?.article.number || !articleContext.article.name ? (
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
                {isFullBox && (
                  <ScanHydraQr
                    workplace={workplace}
                    article={articleContext.article.number}
                    operator={personContext.person.number}
                  />
                )}
                {isFullPallet && (
                  <>
                    <ScanPalletQr
                      workplace={workplace}
                      operator={personContext.person.number}
                      article={articleContext?.article.number}
                      onPallet={onPallet}
                      boxSize={palletSize}
                    />
                    <PrintPalletLabel
                      articleNumber={articleContext?.article.number}
                      articleName={articleContext?.article.name}
                      quantityOnPallet={onPallet}
                    />
                  </>
                )}
              </>
            )}
          </>
        ))}
    </>
  );
}
