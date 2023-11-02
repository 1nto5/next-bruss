'use client';

import { PersonsProvider } from './lib/PersonsContext';
import { InventoryProvider } from './lib/InventoryContext';
import Status from './components/Status';
import Header from './components/Header';
import Login from './components/Login';
import Form from './components/Form';

export default function Page() {
  return (
    <PersonsProvider>
      <InventoryProvider>
        <Header title='inventory' />
        <Status />
        <Login />
        <Form />
      </InventoryProvider>
    </PersonsProvider>
  );
}
