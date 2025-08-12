'use client';

import ErrorAlert from '@/app/(pro)/components/error-alert';
import Loading from '@/app/(pro)/components/loading';
import LoginWithKeypad from '@/app/(pro)/components/login-with-keypad';
import type { Locale } from '@/i18n.config';
import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { login } from '../actions';
import { useGetArticles } from '../data/get-articles';
import type { Dictionary } from '../lib/dictionary';
import { useOperatorStore, useScanStore } from '../lib/stores';
import ArticleSelection from './article-selection';
import LastScans from './last-scans';
import ScanPanel from './scan-panel';
import StatusBar from './status-bar';

interface AppProps {
  dict: Dictionary;
  lang: Locale;
}

export default function App({ dict, lang }: AppProps) {
  const searchParams = useSearchParams();
  const workplace = searchParams.get('workplace');

  const { operator1, setOperator1, setOperator2, setOperator3 } =
    useOperatorStore();
  const { selectedArticle, setSelectedArticle } = useScanStore();

  // Use React Query hooks
  const {
    data: articles = [],
    isLoading: articlesLoading,
    error: articlesError,
  } = useGetArticles(workplace);

  // Update selectedArticle when articles refresh (e.g., every hour)
  useEffect(() => {
    if (selectedArticle && articles.length > 0) {
      const updatedArticle = articles.find((a) => a.id === selectedArticle.id);
      if (updatedArticle) {
        // Check if any value changed
        const hasChanged =
          updatedArticle.piecesPerBox !== selectedArticle.piecesPerBox ||
          updatedArticle.boxesPerPallet !== selectedArticle.boxesPerPallet ||
          updatedArticle.articleNumber !== selectedArticle.articleNumber ||
          updatedArticle.articleName !== selectedArticle.articleName ||
          updatedArticle.workplace !== selectedArticle.workplace ||
          updatedArticle.pallet !== selectedArticle.pallet;

        if (hasChanged) {
          setSelectedArticle({
            id: updatedArticle.id,
            articleNumber: updatedArticle.articleNumber,
            articleName: updatedArticle.articleName,
            workplace: updatedArticle.workplace,
            piecesPerBox: updatedArticle.piecesPerBox,
            boxesPerPallet: updatedArticle.boxesPerPallet,
            pallet: updatedArticle.pallet,
          });
        }
      }
    }
  }, [articles, selectedArticle, setSelectedArticle]);

  // Check if workplace is provided
  if (!workplace) {
    return (
      <ErrorAlert
        title={dict.errors.noWorkplace}
        description={dict.errors.noWorkplaceDescription}
      />
    );
  }

  // Check if operator is logged in
  if (!operator1) {
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
  }

  // Loading state for articles
  if (articlesLoading && operator1) {
    return <Loading />;
  }

  // Error state
  if (articlesError) {
    return (
      <ErrorAlert
        title={dict.errors.somethingWrong}
        description={dict.errors.fetchArticlesError}
        refetch={() => window.location.reload()}
      />
    );
  }

  // No articles configured
  if (articles.length === 0) {
    return (
      <ErrorAlert
        title={dict.errors.noConfiguration}
        description={`${dict.errors.noArticlesDescription} ${workplace.toUpperCase()}. ${dict.errors.contactIT}`}
      />
    );
  }

  // Article selection
  if (!selectedArticle) {
    return (
      <ArticleSelection
        articles={articles}
        workplace={workplace}
        dict={dict.articleSelection}
      />
    );
  }

  // Main scanning interface
  return (
    <div className='space-y-2'>
      <StatusBar dict={dict.statusBar} lang={lang} />
      <ScanPanel dict={dict} />
      <LastScans lang={lang} />
    </div>
  );
}
