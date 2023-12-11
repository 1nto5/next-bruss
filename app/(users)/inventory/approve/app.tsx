'use client';

import { useContext } from 'react';
import { InventoryContext } from './lib/InventoryContext';
import Status from './components/Status';
import CardOrPosition from './components/CardOrPosition';
import Position from './components/Position';
import Edit from './components/Edit';

export default function App() {
  const inventoryContext = useContext(InventoryContext);

  return (
    <>
      <Status />
      <div className='mb-4 mt-4 flex flex-col items-center justify-center'>
        {!inventoryContext?.inventory?.card ? (
          <CardOrPosition />
        ) : !inventoryContext?.inventory.position ? (
          <Position />
        ) : (
          <Edit />
        )}
      </div>
    </>
  );
}
