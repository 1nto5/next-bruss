'use client';
import CardSelection from './components/card-selection';
import Login from './components/login';
import PositionEdit from './components/position-edit';
import PositionSelection from './components/position-selection';
import {
  useCardStore,
  usePersonalNumberStore,
  usePositionStore,
} from './lib/stores';

// import { getDictionary } from '@/lib/dict';

export default function App() {
  const { personalNumber1 } = usePersonalNumberStore();
  const { card } = useCardStore();
  const { position } = usePositionStore();
  if (!personalNumber1) {
    return <Login />;
  } else {
    if (card == 0) {
      return <CardSelection />;
    } else if (position === 0) {
      return <PositionSelection />;
    } else {
      return <PositionEdit />;
    }
  }
}
