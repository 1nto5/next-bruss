'use client';
import LoginWithKeypad from '@/app/(shop-floor)/[lang]/components/login-with-keypad';
import type { Locale } from '@/lib/config/i18n';
import { login } from '../actions';
import type { Dictionary } from '../lib/dict';
import { useOperatorStore, useOvenStore } from '../lib/stores';
import OvenSelection from './oven-selection';
import ProcessList from './process-list';
import ProgramSelection from './program-selection';

interface AppProps {
  dict: Dictionary;
  lang: Locale;
}

export default function App({ dict, lang }: AppProps) {
  const {
    operator1,
    operator2,
    operator3,
    setOperator1,
    setOperator2,
    setOperator3,
  } = useOperatorStore();
  const { selectedOven, selectedProgram } = useOvenStore();

  if (!operator1 && !operator2 && !operator3) {
    return (
      <LoginWithKeypad
        {...dict.login}
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
    return <ProgramSelection dict={dict} />;
  } else {
    return <ProcessList dict={dict} lang={lang} />;
  }
}
