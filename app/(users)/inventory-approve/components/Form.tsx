'use client';

import { useContext } from 'react';
import { InventoryContext } from '../lib/InventoryContext';
import Card from './CardOrPosition';

export default function Form() {
  const inventoryContext = useContext(InventoryContext);

  return (
    <div className='mb-4 mt-4 flex flex-col items-center justify-center'>
      {!inventoryContext?.inventory?.card && <Card />}
    </div>
  );
}
