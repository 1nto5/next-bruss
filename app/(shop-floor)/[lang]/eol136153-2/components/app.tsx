'use client';

import ErrorAlert from '@/app/(shop-floor)/[lang]/components/error-alert';
import Loading from '@/app/(shop-floor)/[lang]/components/loading';
import LoginWithKeypad from '@/app/(shop-floor)/[lang]/components/login-with-keypad';
import type { Locale } from '@/lib/config/i18n';
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { login } from '../actions';
import type { Dictionary } from '../lib/dict';
import { useGetArticleStatus } from '../data/get-article-status';
import { useEOLStore, useOperatorStore } from '../lib/stores';
import LastScans from './last-scans';
import ScanPanel from './scan-panel';
import StatusBar from './status-bar';

interface AppProps {
  dict: Dictionary;
  lang: Locale;
}

export default function App({ dict, lang }: AppProps) {
  const { operator, setOperator } = useOperatorStore();
  const queryClient = useQueryClient();
  const {
    article136Status,
    article153Status,
    setArticle136Status,
    setArticle153Status,
    currentMode,
    setCurrentMode,
  } = useEOLStore();

  // Get article statuses from React Query
  const {
    data: article136Data,
    isLoading: isLoading136,
    error: error136,
  } = useGetArticleStatus('28067');

  const {
    data: article153Data,
    isLoading: isLoading153,
    error: error153,
  } = useGetArticleStatus('28042');

  // Update store when React Query data changes
  useEffect(() => {
    if (article136Data) {
      setArticle136Status(article136Data);
    }
  }, [article136Data, setArticle136Status]);

  useEffect(() => {
    if (article153Data) {
      setArticle153Status(article153Data);
    }
  }, [article153Data, setArticle153Status]);

  // Determine current mode based on status
  useEffect(() => {
    if (article136Data?.isFull) {
      setCurrentMode('pallet136');
    } else if (article153Data?.isFull) {
      setCurrentMode('pallet153');
    } else {
      setCurrentMode('scanning');
    }
  }, [article136Data, article153Data, setCurrentMode]);

  // Refresh statuses by invalidating queries
  const refreshStatuses = () => {
    queryClient.invalidateQueries({ queryKey: ['article-status', '28067'] });
    queryClient.invalidateQueries({ queryKey: ['article-status', '28042'] });
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
  const isLoading = isLoading136 || isLoading153;
  const hasData = article136Status || article153Status;

  if (isLoading && !hasData) {
    return <Loading />;
  }

  // Error state
  const error = error136 || error153;
  if (error) {
    return (
      <ErrorAlert
        title={dict.errors.somethingWrong}
        description={dict.errors.fetchError}
        refetch={refreshStatuses}
      />
    );
  }

  // Main app interface
  return (
    <div className='space-y-2'>
      <StatusBar dict={dict.status} />
      <ScanPanel
        dict={dict}
        operator={operator.identifier}
        article136Status={article136Status}
        article153Status={article153Status}
        currentMode={currentMode}
        onScanSuccess={refreshStatuses}
      />
      <LastScans />
    </div>
  );
}
