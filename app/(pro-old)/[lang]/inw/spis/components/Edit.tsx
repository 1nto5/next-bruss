'use client';

import { extractNameFromEmail } from '@/lib/utils/name-format';
import clsx from 'clsx';
import { use, useContext, useEffect, useState } from 'react';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import useSWR from 'swr';
import { getArticlesOptions, getPosition, savePosition } from '../actions';
import { InventoryContext } from '../lib/InventoryContext';
import { PersonsContext } from '../lib/PersonsContext';
import Select from './Select';

type Article = {
  value: string;
  label: string;
  number: number;
  name: string;
  unit: string;
  converter: number;
  max: number;
};

type PersonsType = {
  first: string | null;
  nameFirst: string | null;
  second: string | null;
  nameSecond: string | null;
};

export default function Edit() {
  const personsContext = useContext(PersonsContext);
  const inventoryContext = useContext(InventoryContext);
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPendingPosition, setIsPendingPosition] = useState(true);
  const [isPendingSaving, setIsPendingSaving] = useState(false);
  const { data: articlesOptions, error: getArticlesOptionsError } = useSWR<
    Article[]
  >('articlesOptionsKey', getArticlesOptions);
  const [wip, setWip] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [quantity, setQuantity] = useState(0);
  const [approved, setApproved] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<string | undefined>('kg');
  const [identifier, setIdentifier] = useState('');
  const [blockNextPosition, setBlockNextPosition] = useState(false);

  useEffect(() => {
    setErrorMessage(null);
    setMessage(null);
    setIdentifier('');
    setSelectedArticle(null);
    setQuantity(0);
    setApproved(false);
    setSelectedUnit('kg');
  }, [inventoryContext?.inventory?.position]);

  useEffect(() => {
    setErrorMessage(null);
  }, [message]);

  useEffect(() => {
    setMessage(null);
  }, [errorMessage]);

  useEffect(() => {
    (async () => {
      if (
        inventoryContext?.inventory?.card &&
        inventoryContext?.inventory?.position &&
        personsContext?.persons?.first &&
        personsContext?.persons?.second
      ) {
        try {
          setIsPendingPosition(true);
          const positionData = await getPosition(
            inventoryContext?.inventory?.card,
            inventoryContext.inventory.position,
            personsContext?.persons,
          );
          if (positionData) {
            if (positionData.status == 'wrong position') {
              inventoryContext.setInventory((prevState) => ({
                ...prevState,
                position: null,
              }));
            }
            if (positionData.status == 'no access') {
              inventoryContext.setInventory((prevState) => ({
                ...prevState,
                card: null,
              }));
            }
            positionData.status == 'no card' && setErrorMessage('No card!');
            if (positionData.status == 'skipped') {
              inventoryContext.setInventory((prevState) => ({
                ...prevState,
                position: positionData.position.position,
              }));
            }
            if (positionData.status == 'new') {
              setBlockNextPosition(true);
              setWip(false);
            }
          }
          console.log('positionData:', positionData);
          if (positionData.status == 'found') {
            setIdentifier(positionData.positionOnCard.identifier);
            setQuantity(positionData.positionOnCard.quantity);
            setWip(positionData.positionOnCard.wip);
            setSelectedUnit(positionData.positionOnCard.unit);
            if (positionData.positionOnCard.approver) {
              setApproved(true);
              setErrorMessage(
                `Edycja niedozowolona, pozycja została zatwierdzona przez: ${extractNameFromEmail(
                  positionData.positionOnCard.approver,
                )}!`,
              );
            }
            setBlockNextPosition(false);
            if (articlesOptions) {
              const foundArticle = articlesOptions.find(
                (article) =>
                  article.number === positionData.positionOnCard.articleNumber,
              );
              foundArticle && setSelectedArticle(foundArticle);
            }
          }
        } catch (error) {
          console.error('Error fetching position:', error);
          setErrorMessage('Skontaktuj się z IT!');
        } finally {
          setIsPendingPosition(false);
        }
      }
    })();
  }, [
    articlesOptions,
    inventoryContext,
    inventoryContext?.inventory?.position,
    personsContext?.persons,
  ]);

  // save position
  const handleSavePosition = async () => {
    if (identifier !== '') {
      if (!window.confirm('Czy na pewno chcesz ponownie zapisać pozycję?')) {
        return;
      }
    }
    if (!selectedArticle) {
      setErrorMessage('Wybierz artykuł!');
      return;
    }
    if (!quantity || quantity <= 0) {
      setErrorMessage('Podaj poprawną ilość!');
      return;
    }
    if (
      selectedArticle?.max &&
      selectedArticle?.converter &&
      selectedArticle?.unit === 'st' &&
      selectedUnit === 'kg' &&
      quantity / selectedArticle?.converter > selectedArticle?.max
    ) {
      // const userConfirm = window.confirm(
      //   `Wprowadzona wartość przekracza domyślną wartość dla tego artykułu: (${selectedArticle?.max} ${selectedArticle?.unit}). Czy na pewno chcesz kontynuuować?`,
      // );
      // if (!userConfirm) {
      //   return;
      // }
      setErrorMessage(
        'Wprowadzona wartość przekracza domyślną wartość dla tego artykułu!',
      );
      return;
    }
    if (selectedArticle?.max && quantity > selectedArticle?.max) {
      // const userConfirm = window.confirm(
      //   `Wprowadzona wartość przekracza domyślną wartość dla tego artykułu: (${selectedArticle?.max} ${selectedArticle?.unit}). Czy na pewno chcesz kontynuuować?`,
      // );
      // if (!userConfirm) {
      //   return;
      // }
      setErrorMessage(
        'Wprowadzona wartość przekracza domyślną wartość dla tego artykułu!',
      );
      return;
    }

    if (
      inventoryContext?.inventory?.card &&
      inventoryContext.inventory.position
    ) {
      try {
        const converter = selectedArticle?.converter;
        let finalQuantity;
        if (converter && selectedUnit !== 'st') {
          finalQuantity = Math.floor(quantity / converter);
        } else {
          finalQuantity = quantity;
        }

        if (
          selectedArticle &&
          personsContext?.persons?.first &&
          personsContext?.persons?.second
        ) {
          setIsPendingSaving(true);
          const res = await savePosition(
            inventoryContext.inventory.card,
            inventoryContext.inventory.position,
            selectedArticle.number,
            selectedArticle.name,
            finalQuantity,
            selectedArticle.unit,
            wip,
            personsContext?.persons,
          );

          if (res?.status === 'added') {
            res?.identifier && setIdentifier(res?.identifier);
            setMessage(
              `Pozycja: ${inventoryContext.inventory.position} zapisana!`,
            );
            setBlockNextPosition(false);
          } else if (res?.status === 'updated') {
            res?.identifier && setIdentifier(res?.identifier);
            setMessage(
              `Pozycja: ${inventoryContext.inventory.position} zaktualizowana!`,
            );
            setBlockNextPosition(false);
          } else if (
            res?.status === 'not added' ||
            res?.status === 'not updated'
          ) {
            setErrorMessage('Skontaktuj się z IT!');
          }
        }
      } catch (error) {
        setErrorMessage('Skontaktuj się z IT!');
      } finally {
        setIsPendingSaving(false);
      }
    }
  };

  const selectArticle = (option: Article | null) => {
    setSelectedArticle(option);
  };

  return (
    <>
      <span className='text-sm font-extralight tracking-widest text-slate-700 dark:text-slate-100'>
        {isPendingPosition ? 'pobieranie pozycji' : 'edycja pozycji'}
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
                <div className='w-1/2 rounded bg-black p-2 text-center text-lg font-semibold text-slate-100 dark:bg-white dark:text-red-500 sm:text-2xl md:text-3xl'>
                  {identifier}
                </div>
              )}
            </div>
          ) : null}
          <Select
            options={articlesOptions ?? []}
            value={selectedArticle}
            onChange={selectArticle}
            placeholder={
              !getArticlesOptionsError
                ? articlesOptions
                  ? 'wybierz artykuł'
                  : 'pobieranie'
                : 'błąd pobierania'
            }
            isDisabled={approved}
          />
          {selectedArticle && !approved && (
            <div className='flex items-center justify-center'>
              <div className='flex items-center space-x-2'>
                <input
                  type='number'
                  onChange={(e) => {
                    const value = e.target.value.replace(',', '.');
                    setQuantity(Number(value));
                  }}
                  placeholder='ilość'
                  defaultValue={quantity !== 0 ? quantity : undefined}
                  className='rounded border-slate-700 bg-white p-2 text-center font-bold shadow-sm dark:bg-slate-900 dark:outline-slate-600'
                />

                {selectedArticle.converter && (
                  <select
                    onChange={(e) => setSelectedUnit(e.target.value)}
                    className='w-12 rounded border-slate-700 bg-white p-1 text-center shadow-sm dark:bg-slate-900 dark:outline-slate-600'
                    value={selectedUnit}
                  >
                    <option>kg</option>
                    <option>st</option>
                  </select>
                )}

                <span>
                  {!selectedArticle.converter && selectedArticle.unit}
                  {selectedArticle.converter && selectedUnit === 'kg' && (
                    <>
                      {' '}
                      = {Math.floor(quantity / selectedArticle.converter)} st
                    </>
                  )}
                  {selectedArticle.converter && selectedUnit === 'st' && (
                    <>
                      {' '}
                      = {Math.floor(quantity * selectedArticle.converter)} kg
                    </>
                  )}
                </span>
              </div>
            </div>
          )}
          {approved && selectedArticle && (
            <span className='flex justify-center'>
              {!selectedArticle.converter && selectedArticle.unit === 'kg' && (
                <>{quantity} kg</>
              )}
              {!selectedArticle.converter && selectedArticle.unit === 'st' && (
                <>{quantity} st</>
              )}
              {selectedArticle.converter && (
                <>
                  {quantity} st ={' '}
                  {Math.floor(quantity * selectedArticle.converter)} kg
                </>
              )}
            </span>
          )}

          <div className='m-2 flex items-center justify-start'>
            <label className='flex space-x-1'>
              <input
                type='checkbox'
                checked={wip}
                disabled={
                  approved || inventoryContext?.inventory?.sector === 'S900'
                }
                onChange={(e) => setWip(e.target.checked)}
              />
              <span>WIP</span>
            </label>
          </div>
          <div className='flex justify-center space-x-3'>
            <button
              onClick={() => {
                if (inventoryContext?.inventory?.position) {
                  if (inventoryContext?.inventory?.position !== 1) {
                    inventoryContext.setInventory((prevState) => ({
                      ...prevState,
                      position:
                        inventoryContext?.inventory?.position &&
                        inventoryContext?.inventory?.position - 1,
                    }));
                  } else {
                    setErrorMessage('Karta nie posiada pozycji 0!');
                  }
                }
              }}
              className='flex w-1/4 items-center justify-center rounded bg-slate-200 p-3 text-lg font-extralight text-slate-900 shadow-sm hover:bg-orange-400 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-orange-500'
            >
              <FaArrowLeft />
            </button>
            <button
              onClick={handleSavePosition}
              disabled={approved}
              className={clsx(
                `w-2/4 rounded bg-slate-200 p-2 text-center text-lg font-extralight text-slate-900 shadow-sm ${
                  approved ? 'cursor-not-allowed' : 'hover:bg-bruss'
                } dark:bg-slate-700 dark:text-slate-100`,
                { 'animate-pulse': isPendingSaving === true },
              )}
            >
              {isPendingSaving ? 'zapisywanie' : 'zapisz'}
            </button>

            <button
              onClick={() => {
                if (!blockNextPosition) {
                  if (
                    inventoryContext?.inventory?.position &&
                    inventoryContext?.inventory?.position !== 25
                  ) {
                    inventoryContext?.setInventory((prevState) => ({
                      ...prevState,
                      position:
                        inventoryContext?.inventory?.position &&
                        inventoryContext?.inventory?.position + 1,
                    }));
                  } else {
                    setErrorMessage('Karta jest pełna!');
                  }
                } else {
                  setErrorMessage('Najpierw zapisz aktualną pozycję!');
                }
              }}
              className='flex w-1/4 items-center justify-center rounded bg-slate-200 p-3 text-lg font-extralight text-slate-900 shadow-sm hover:bg-blue-400 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-blue-600'
            >
              <FaArrowRight />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
