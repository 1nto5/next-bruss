'use client';

import { useContext } from 'react';
import { PersonsContext } from './lib/PersonsContext';
import { InventoryContext } from './lib/InventoryContext';
import Status from './components/Status';
import Login from './components/Login';
import Card from './components/Card';
import Position from './components/Position';
import Edit from './components/Edit';

export default function App() {
  const inventoryContext = useContext(InventoryContext);
  const personsContext = useContext(PersonsContext);

  return (
    <>
      {!personsContext?.persons.first || !personsContext?.persons.second ? (
        <Login />
      ) : (
        <>
          <Status />
          <div className='mb-4 mt-4 flex flex-col items-center justify-center'>
            {!inventoryContext?.inventory.card ? (
              <Card />
            ) : !inventoryContext?.inventory.position ? (
              <Position />
            ) : (
              <Edit />
            )}
          </div>
        </>
      )}
    </>
  );
}
