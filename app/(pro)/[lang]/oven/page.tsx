'use client';
import Login from './components/login';
import OvenSelection from './components/oven-selection';
import ProgramSelection from './components/program-selection';
import ProcessList from './components/process-list';
import { useOvenStore, usePersonalNumberStore } from './lib/stores';

export default function App() {
  const { operator1, operator2, operator3 } = usePersonalNumberStore();
  const { selectedOven, selectedProgram } = useOvenStore();

  if (!operator1 && !operator2 && !operator3) {
    return <Login />;
  } else if (!selectedOven) {
    return <OvenSelection />;
  } else if (selectedProgram === null) {
    return <ProgramSelection />;
  } else {
    return <ProcessList />;
  }
}
