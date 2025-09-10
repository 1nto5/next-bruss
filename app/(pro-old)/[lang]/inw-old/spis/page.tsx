'use client';

import { PersonsProvider } from './lib/PersonsContext';
import { InventoryProvider } from './lib/InventoryContext';
import Header from './components/Header';
import App from './app';

export default function Page() {
  return (
    <PersonsProvider>
      <InventoryProvider>
        <Header title='inventory' />
        <App />
      </InventoryProvider>
    </PersonsProvider>
  );
}
