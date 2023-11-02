'use client';

import { useContext } from 'react';
import { PersonsContext } from '../lib/PersonsContext';
import { InventoryContext } from '../lib/InventoryContext';
import CardChooser from './CardChooser';

export default function Form() {
  const personsContext = useContext(PersonsContext);
  const inventoryContext = useContext(InventoryContext);

  return (
    <div className='mb-4 mt-4 flex flex-col items-center justify-center'>
      {/* <Loader></Loader> */}
      <CardChooser />
    </div>
  );
}
