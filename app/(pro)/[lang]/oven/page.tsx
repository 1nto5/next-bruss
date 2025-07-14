'use client';
import Login from './components/login';
import OvenSelection from './components/oven-selection';
import ProcessList from './components/process-list';
import { useOvenStore, usePersonalNumberStore } from './lib/stores';

export default function App() {
  const { operator1, operator2, operator3 } = usePersonalNumberStore();
  const { selectedOven } = useOvenStore();

  if (!operator1 && !operator2 && !operator3) {
    return <Login />;
  } else if (!selectedOven) {
    return <OvenSelection />;
  } else {
    return <ProcessList />;
  }
}
