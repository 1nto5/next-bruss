'use client';
import Login from './components/login';
import OvenSelection from './components/oven-selection';
import ProcessList from './components/process-list';
import { useOvenStore, usePersonalNumberStore } from './lib/stores';

export default function App() {
  const { personalNumber1 } = usePersonalNumberStore();
  const { selectedOven } = useOvenStore();

  if (!personalNumber1) {
    return <Login />;
  } else if (!selectedOven) {
    return <OvenSelection />;
  } else {
    return <ProcessList />;
  }
}
