'use client';

import { useContext } from 'react';
import { PersonsContext } from '../lib/PersonsContext';
import { InventoryContext } from '../lib/InventoryContext';

type HeaderProps = {
  title: string;
};

const Header: React.FC<HeaderProps> = ({ title }) => {
  const personsContext = useContext(PersonsContext);
  const inventoryContext = useContext(InventoryContext);

  return (
    <div className='flex items-center justify-between border-b border-slate-200 bg-slate-100 p-2 shadow-md dark:border-slate-700 dark:bg-slate-800'>
      <h1 className='ml-2 mr-4 text-xs font-thin text-slate-900 dark:text-slate-100 sm:text-sm md:text-base lg:text-lg'>
        {title}
      </h1>

      <div className='mr-2 flex space-x-2 sm:space-x-4'>
        {inventoryContext?.inventory?.card && (
          <button
            onClick={() =>
              inventoryContext?.setInventory(() => ({
                position: null,
                card: null,
                warehouse: null,
                sector: null,
              }))
            }
            className='rounded bg-slate-200 pb-1 pl-2 pr-2 pt-1  text-center text-sm font-extralight text-slate-900 shadow-xs hover:bg-bruss dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-bruss sm:text-base lg:text-lg'
            type='button'
          >
            zakończ kartę
          </button>
        )}
        {inventoryContext?.inventory?.position && (
          <button
            onClick={() =>
              inventoryContext?.setInventory((prevState) => ({
                ...prevState,
                position: null,
              }))
            }
            className='rounded bg-slate-200 pb-1 pl-2 pr-2 pt-1  text-center text-sm font-extralight text-slate-900 shadow-xs hover:bg-bruss dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-bruss sm:text-base lg:text-lg'
            type='button'
          >
            zmień pozycję
          </button>
        )}
        {personsContext?.persons?.first && (
          <button
            onClick={() =>
              personsContext?.setPersons({
                first: null,
                nameFirst: null,
                second: null,
                nameSecond: null,
              })
            }
            className='rounded bg-red-600 pb-1 pl-2 pr-2 pt-1 text-center text-sm font-extralight text-slate-100 shadow-xs hover:bg-red-500 dark:bg-red-900 dark:text-slate-50 dark:hover:bg-red-700 sm:p-2 sm:text-base lg:text-lg'
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
