'use client';
import type { Locale } from '@/i18n.config';
import type { Dictionary } from '../lib/dictionary';
import { useOvenStore, usePersonalNumberStore } from '../lib/stores';
import UniversalLogin from '@/app/(pro)/components/universal-login';
import { login } from '../actions';
import OvenSelection from './oven-selection';
import ProcessList from './process-list';
import ProgramSelection from './program-selection';

interface AppProps {
  dict: Dictionary;
  lang: Locale;
}

export default function App({ dict, lang }: AppProps) {
  const { operator1, operator2, operator3, setOperator1, setOperator2, setOperator3 } = usePersonalNumberStore();
  const { selectedOven, selectedProgram } = useOvenStore();

  if (!operator1 && !operator2 && !operator3) {
    return (
      <UniversalLogin
        dict={dict.login}
        loginAction={login}
        onSuccess={(res) => {
          setOperator1(res.operator1 || null);
          setOperator2(res.operator2 || null);
          setOperator3(res.operator3 || null);
        }}
      />
    );
  } else if (!selectedOven) {
    return <OvenSelection dict={dict} />;
  } else if (selectedProgram === null) {
    return <ProgramSelection dict={dict} lang={lang} />;
  } else {
    return <ProcessList dict={dict} lang={lang} />;
  }
}