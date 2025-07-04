'use client';
import Login from './components/login';
import { ProcessesTable } from './components/processes-table';
import { useOperatorsStore } from './lib/stores';

// import { getDictionary } from '@/lib/dictionary';

export default function App() {
  const { operator1 } = useOperatorsStore();
  if (!operator1.code) {
    return <Login />;
  } else {
    return <ProcessesTable />;
  }
}
