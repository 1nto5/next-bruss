'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

import useSWR from 'swr';
import { useSession } from 'next-auth/react';
import {
  GetPosition,
  SavePosition,
  GetArticles,
  ApprovePosition,
} from '../actions';
import Select from './Select';
import Loader from './Loader';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';

type Article = {
  value: string;
  label: string;
  number: number;
  name: string;
  unit: string;
  converter: number;
};

// TODO: jeśli pozycja nalzey do karty innego usera, przekieruj do /inventory
// TODO: jeśli pozycja zatwierdzona, nie pozwalaj edytować, wyświetl zielony komunikat "pozycja zatwierdzona przez: ..."

export default function CardPositionForm() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  if (!/\/card=\d+$/.test(pathname) && !/\/position=\d+$/.test(pathname)) {
    router.push('/inventory');
  }
  const matchesPosition = pathname.match(/position=(\d+)/);
  const matchesCard = pathname.match(/card=(\d+)/);
  const position = matchesPosition ? Number(matchesPosition[1]) : null;
  const card = matchesCard ? Number(matchesCard[1]) : null;
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  // TODO: useTransition
  const { data: articles, error: getArticlesError } = useSWR<Article[]>(
    'articlesKey',
    GetArticles,
  );
  const [wip, setWip] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [quantity, setQuantity] = useState(0);
  const [confirmed, setConfirmed] = useState(false);
  const [identifier, setIdentifier] = useState('');
  const [blockNextPosition, setBlockNextPosition] = useState(false);

  // prefetching
  // useEffect(() => {
  //   if (position) {
  //     const newPathname = pathname.replace(
  //       /(position-)(\d+)/,
  //       (_, prefix, num) => {
  //         console.log(`${prefix}${Number(num) + 1}`)
  //         return `${prefix}${Number(num) + 1}`
  //       }
  //     )
  //     console.log(newPathname)
  //     router.prefetch(newPathname)
  //   }
  // }, [router])

  const errorSetter = (message: string) => {
    setErrorMessage(message);
    setMessage(null);
  };

  const messageSetter = (message: string) => {
    setMessage(message);
    setErrorMessage(null);
  };

  // fetch existing position
  useEffect(() => {
    const fetchData = async () => {
      if (card && position && session?.user.email) {
        const positionData = await GetPosition(
          card,
          position,
          session?.user.email,
        );
        if (positionData) {
          if (positionData.status == 'wrong position') {
            router.push('/inventory');
          }
          if (positionData.status == 'no access') {
            router.push('/inventory');
          }
          positionData.status == 'no card' && errorSetter('No card!');
          if (positionData.status == 'skipped') {
            router.replace(`position=${positionData.position}`);
          }

          if (positionData.status == 'new') {
            setBlockNextPosition(true);
          }
        }
        if (positionData.status == 'found') {
          messageSetter('The position exists, content retrieved!');
          setIdentifier(positionData.position.identifier);
          setQuantity(positionData.position.quantity);
          if (articles) {
            const foundArticle = articles.find(
              (article) =>
                article.number === positionData.position.articleNumber,
            );
            foundArticle && setSelectedArticle(foundArticle);
          }
        }
      }
    };
    setIsPending(true);
    fetchData();
    setIsPending(false);
    return () => {};
  }, [articles, card, position, router, session?.user.email]);

  // save position
  const savePosition = async () => {
    if (identifier !== '') {
      if (
        !window.confirm(
          'Are you sure you want to save the position again? This will generate a new identifier and require it to be noted on the inventory item.',
        )
      ) {
        return;
      }
    }
    if (!selectedArticle) {
      errorSetter('Select an article!');
      return;
    }
    if (!quantity || quantity <= 0) {
      errorSetter('Enter the correct quantity!');
      return;
    }
    if (card && position) {
      try {
        const converter = selectedArticle?.converter;
        let finalQuantity;
        if (converter) {
          finalQuantity = Math.floor(quantity * converter);
        } else {
          finalQuantity = quantity;
        }

        if (selectedArticle && session?.user.email) {
          setIsPending(true);
          const res = await SavePosition(
            card,
            position,
            selectedArticle.number,
            selectedArticle.name,
            finalQuantity,
            selectedArticle.unit,
            wip,
            session.user.email,
          );

          if (res?.status === 'added') {
            res?.identifier && setIdentifier(res?.identifier);
            messageSetter(`Position ${position} added!`);
            setBlockNextPosition(false);
          } else if (res?.status === 'updated') {
            res?.identifier && setIdentifier(res?.identifier);
            messageSetter(`Position ${position} updated!`);
            setBlockNextPosition(false);
          } else if (
            res?.status === 'not added' ||
            res?.status === 'not updated'
          ) {
            errorSetter('Saving position error. Please contact IT!');
          }
        }
      } catch (error) {
        errorSetter('Saving position error. Please contact IT!');
      } finally {
        setIsPending(false);
      }
    }
  };

  // approve position
  const approvePosition = async () => {
    if (!window.confirm('Are you sure you want to approve the position?')) {
      return;
    }
    try {
      if (card && position && session?.user.email) {
        setIsPending(true);
        const res = await ApprovePosition(card, position, session.user.email);

        if (res?.status === 'approved') {
          messageSetter('The position has been approved!');
        } else if (res?.status === 'no changes') {
          messageSetter('The position had already been approved!');
        }
      }
    } catch (error) {
      errorSetter('Saving position error. Please contact IT!');
    } finally {
      setIsPending(false);
    }
  };

  const selectArticle = (option: Article | null) => {
    setSelectedArticle(option);
  };

  if (getArticlesError) {
    errorSetter('An error occurred during loading artiles options.');
  }
  if (!articles) {
    return <Loader />;
  }
  if (isPending) {
    return <Loader />;
  }

  return (
    <div className='mb-4 mt-4 flex flex-col items-center justify-center'>
      <span className='text-sm font-extralight tracking-widest text-slate-700 dark:text-slate-100'>
        edit position
      </span>
      <div className='flex w-11/12 max-w-lg justify-center rounded bg-slate-100 p-4 shadow-md dark:bg-slate-800'>
        <div className='flex w-11/12 flex-col gap-3'>
          {message || errorMessage || identifier ? (
            <div className='flex flex-col items-center justify-center space-y-4'>
              {message && (
                <div className='rounded bg-bruss p-2 text-center text-slate-100'>
                  {message}
                </div>
              )}
              {errorMessage && (
                <div className='rounded bg-red-500 p-2 text-center  text-slate-100 dark:bg-red-700'>
                  {errorMessage}
                </div>
              )}
              {identifier && (
                <div className='rounded bg-black p-2 text-center text-3xl font-semibold text-slate-100 dark:bg-white dark:text-red-500'>
                  {identifier}
                </div>
              )}
            </div>
          ) : null}
          <Select
            options={articles}
            value={selectedArticle}
            onChange={selectArticle}
            placeholder={'select article'}
          />

          {selectedArticle && (
            <div className='flex items-center justify-center'>
              <label className='flex items-center space-x-2'>
                <input
                  type='number'
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  placeholder='quantity'
                  defaultValue={quantity !== 0 ? quantity : undefined}
                  className='w-20 rounded border-slate-700 bg-white p-1 text-center shadow-sm   dark:bg-slate-900 dark:outline-slate-600'
                />
                <span>
                  {!selectedArticle.converter ? selectedArticle.unit : 'kg'}
                  {selectedArticle.converter && (
                    <>
                      {' '}
                      = {Math.floor(quantity / selectedArticle.converter)} st
                    </>
                  )}
                </span>
              </label>
            </div>
          )}
          <div className='flex items-center justify-start'>
            <label className='flex items-center space-x-2'>
              <input
                type='checkbox'
                checked={wip}
                onChange={(e) => setWip(e.target.checked)}
              />
              <span>WIP</span>
            </label>
          </div>
          <div className='flex justify-center space-x-3'>
            <button
              onClick={() => {
                if (position !== null) {
                  if (position !== 1) {
                    router.replace(`position=${position - 1}`);
                  } else {
                    errorSetter('No 0 position!');
                  }
                }
              }}
              className='rounded bg-slate-200 p-3 text-center text-lg font-extralight text-slate-900 shadow-sm hover:bg-orange-400 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-orange-500'
            >
              <FaArrowLeft />
            </button>
            <button
              onClick={savePosition}
              className='w-full rounded bg-slate-200 p-2 text-center text-lg font-extralight text-slate-900 shadow-sm hover:bg-bruss dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-bruss'
            >
              save
            </button>
            {session?.user.roles?.includes('inventory_confirmer') && (
              <button
                onClick={approvePosition}
                className='w-full rounded bg-slate-200 p-2 text-center text-lg font-extralight text-slate-900 shadow-sm hover:bg-bruss dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-bruss'
              >
                approve
              </button>
            )}

            <button
              onClick={() => {
                if (!blockNextPosition) {
                  if (position !== null && position != 25) {
                    router.replace(`position=${position + 1}`);
                  } else {
                    errorSetter('The card is full!');
                  }
                } else {
                  errorSetter('Save the current position!');
                }
              }}
              className='rounded bg-slate-200 p-3 text-center text-lg font-extralight text-slate-900 shadow-sm hover:bg-blue-400 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-blue-600'
            >
              <FaArrowRight />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
