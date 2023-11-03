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
      <h1 className='ml-2 mr-4 text-lg font-thin text-slate-900 dark:text-slate-100'>
        {title}
      </h1>

      <div className='mr-2 flex space-x-4'>
        {inventoryContext?.inventory.card && (
          <button
            onClick={() =>
              inventoryContext?.setInventory(() => ({
                position: null,
                card: null,
              }))
            }
            className='w-20 rounded bg-slate-200 p-2 text-center text-lg font-extralight text-slate-900 shadow-sm hover:bg-bruss dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-bruss'
            type='button'
          >
            karta
          </button>
        )}
        {inventoryContext?.inventory.position && (
          <button
            onClick={() =>
              inventoryContext?.setInventory((prevState) => ({
                ...prevState,
                position: null,
              }))
            }
            className='w-20 rounded bg-slate-200 p-2 text-center text-lg font-extralight text-slate-900 shadow-sm hover:bg-bruss dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-bruss'
            type='button'
          >
            pozycja
          </button>
        )}
        {personsContext?.persons.first && (
          <button
            onClick={() =>
              personsContext?.setPersons((prevState) => ({
                ...prevState,
                first: null,
                second: null,
              }))
            }
            className='w-20 rounded bg-red-600 p-2 text-center text-lg font-extralight text-slate-100 shadow-sm hover:bg-red-500 dark:bg-red-900 dark:text-slate-50 dark:hover:bg-red-700'
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
