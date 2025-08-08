'use client';
import type { Locale } from '@/i18n.config';
import type { Dictionary } from '../lib/dictionary';
import { useOvenStore, usePersonalNumberStore } from '../lib/stores';
import Login from './login';
import OvenSelection from './oven-selection';
import ProcessList from './process-list';
import ProgramSelection from './program-selection';

interface AppProps {
  dict: Dictionary;
  lang: Locale;
}

export default function App({ dict, lang }: AppProps) {
  const { operator1, operator2, operator3 } = usePersonalNumberStore();
  const { selectedOven, selectedProgram } = useOvenStore();

  if (!operator1 && !operator2 && !operator3) {
    return <Login dict={dict} />;
  } else if (!selectedOven) {
    return <OvenSelection dict={dict} />;
  } else if (selectedProgram === null) {
    return <ProgramSelection dict={dict} lang={lang} />;
  } else {
    return <ProcessList dict={dict} lang={lang} />;
  }
}