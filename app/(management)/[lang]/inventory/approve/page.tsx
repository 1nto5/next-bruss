import { InventoryProvider } from './lib/InventoryContext';
import Header from './components/Header';
import App from './app';

export default async function Page() {
  return (
    <InventoryProvider>
      <Header title='inventory approve' />
      <App />
    </InventoryProvider>
  );
}
