'use client';
import CardSelection from './components/card-selection';
import Login from './components/login';
import { useCardStore, usePersonalNumberStore } from './lib/stores';

// import { getDictionary } from '@/lib/dictionary';

export default function App() {
  const { personalNumber1 } = usePersonalNumberStore();
  const { card } = useCardStore();
  if (!personalNumber1) {
    return <Login />;
  } else {
    if (card == 0) {
      return <CardSelection />;
    } else {
      return <div>Card: {card}</div>;
    }
  }
}
