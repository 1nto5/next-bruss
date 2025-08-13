'use client';

import ErrorAlert from '@/app/(pro)/[lang]/components/error-alert';
import Loading from '@/app/(pro)/[lang]/components/loading';
import LoginWithKeypad from '@/app/(pro)/[lang]/components/login-with-keypad';
import type { Locale } from '@/i18n.config';
import { useEffect, useState } from 'react';
import { getArticleStatuses, login } from '../actions';
import type { Dictionary } from '../lib/dictionary';
import { useEOLStore, useOperatorStore } from '../lib/stores';
import LastScans from './last-scans';
import ScanPanel from './scan-panel';
import StatusBar from './status-bar';

interface AppProps {
  dict: Dictionary;
  lang: Locale;
}

export default function App({ dict, lang }: AppProps) {
  const { operator, setOperator, logout } = useOperatorStore();
  const {
    article136Status,
    article153Status,
    setArticle136Status,
    setArticle153Status,
    currentMode,
    setCurrentMode,
    reset,
  } = useEOLStore();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load article statuses
  const loadStatuses = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const statuses = await getArticleStatuses();
      const status136 = statuses.find((s) => s.article === '28067');
      const status153 = statuses.find((s) => s.article === '28042');

      if (status136) setArticle136Status(status136);
      if (status153) setArticle153Status(status153);

      // Determine current mode based on status
      if (status136?.isFull) {
        setCurrentMode('pallet136');
      } else if (status153?.isFull) {
        setCurrentMode('pallet153');
      } else {
        setCurrentMode('scanning');
      }
    } catch (err) {
      console.error('Failed to load statuses:', err);
      setError(dict.errors.fetchError);
    } finally {
      setIsLoading(false);
    }
  };

  // Load statuses on mount and when operator changes
  useEffect(() => {
    if (operator) {
      loadStatuses();
    }
  }, [operator]);

  // Refresh statuses
  const refreshStatuses = async () => {
    await loadStatuses();
  };

  // Check if operator is logged in
  if (!operator) {
    return (
      <LoginWithKeypad
        {...dict.login}
        loginAction={login}
        onSuccess={(res) => {
          setOperator(res.operator1 || null);
        }}
      />
    );
  }

  // Loading state
  if (isLoading && !article136Status && !article153Status) {
    return <Loading />;
  }

  // Error state
  if (error) {
    return (
      <ErrorAlert
        title={dict.errors.somethingWrong}
        description={error}
        refetch={loadStatuses}
      />
    );
  }

  // Main app interface
  return (
    <div className='space-y-4'>
      <StatusBar
        dict={dict.status}
        article136Status={article136Status}
        article153Status={article153Status}
        onRefresh={refreshStatuses}
      />
      <ScanPanel
        dict={dict}
        operator={operator.identifier}
        article136Status={article136Status}
        article153Status={article153Status}
        currentMode={currentMode}
        onScanSuccess={refreshStatuses}
      />
      <LastScans lang={lang} />
    </div>
  );
}
