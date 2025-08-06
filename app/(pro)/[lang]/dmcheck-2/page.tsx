'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
  getArticlesForWorkplace,
  getBoxesOnPalletTableData,
  getInBoxTableData,
} from './actions';
import ArticleSelection from './components/article-selection';
import ErrorAlert from './components/error-alert';
import Login from './components/login';
import ScanPanel from './components/scan-panel';
import { useOperatorStore, useScanStore } from './lib/stores';
import type { ArticleConfigType } from './lib/types';

const errorMessageMap: Record<string, string> = {
  'wrong number 1': 'Nieprawidłowy numer personalny 1',
  'wrong number 2': 'Nieprawidłowy numer personalny 2',
  'wrong number 3': 'Nieprawidłowy numer personalny 3',
  'login error': 'Błąd logowania - skontaktuj się z IT',
  'getArticlesForWorkplace server action error': 'Błąd pobierania artykułów',
  'getInBoxTableData server action error': 'Błąd pobierania statusu box',
  'getBoxesOnPalletTableData server action error': 'Błąd pobierania statusu palety',
};

const translateError = (serverError: string): string => {
  return errorMessageMap[serverError] || 'Skontaktuj się z IT!';
};

export default function DmCheck2Page() {
  const searchParams = useSearchParams();
  const workplace = searchParams.get('workplace');
  
  const { operator1, operator2, operator3 } = useOperatorStore();
  const { selectedArticle } = useScanStore();
  
  const [articles, setArticles] = useState<ArticleConfigType[]>([]);
  const [boxStatus, setBoxStatus] = useState({ piecesInBox: 0, boxIsFull: false });
  const [palletStatus, setPalletStatus] = useState({ boxesOnPallet: 0, palletIsFull: false });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch articles when workplace and operator are available
  useEffect(() => {
    const fetchArticles = async () => {
      if (!workplace || !operator1) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        const articlesData = await getArticlesForWorkplace(workplace);
        setArticles(articlesData);
      } catch (err) {
        console.error('Error fetching articles:', err);
        setError('Błąd pobierania artykułów');
        toast.error(translateError('getArticlesForWorkplace server action error'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchArticles();
  }, [workplace, operator1]);

  // Fetch box and pallet status when article is selected
  useEffect(() => {
    const fetchStatus = async () => {
      if (!selectedArticle) {
        return;
      }

      try {
        const [boxData, palletData] = await Promise.all([
          getInBoxTableData(selectedArticle.id),
          selectedArticle.pallet 
            ? getBoxesOnPalletTableData(selectedArticle.id)
            : Promise.resolve({ boxesOnPallet: 0, palletIsFull: false }),
        ]);
        
        setBoxStatus(boxData);
        setPalletStatus(palletData);
      } catch (err) {
        console.error('Error fetching status:', err);
        toast.error('Błąd pobierania statusu');
      }
    };

    fetchStatus();
    // Refresh status every 5 seconds when article is selected
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, [selectedArticle]);

  // Check if workplace is provided
  if (!workplace) {
    return (
      <ErrorAlert
        title='Brak stanowiska!'
        description='Brak parametru workplace w URL (przykład: ?workplace=eol74)'
      />
    );
  }

  // Check if operator is logged in
  if (!operator1) {
    return <Login />;
  }

  // Loading state
  if (isLoading) {
    return (
      <div className='text-center'>
        <div className='animate-spin'>⏳</div>
        <p className='mt-2 text-sm text-muted-foreground'>Ładowanie...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <ErrorAlert
        title='Błąd!'
        description={error}
        refetch={() => window.location.reload()}
      />
    );
  }

  // No articles configured
  if (articles.length === 0) {
    return (
      <ErrorAlert
        title='Brak konfiguracji!'
        description={`Brak skonfigurowanych artykułów dla stanowiska ${workplace.toUpperCase()}. Skontaktuj się z IT.`}
      />
    );
  }

  // Article selection
  if (!selectedArticle) {
    return <ArticleSelection articles={articles} workplace={workplace} />;
  }

  // Get operator personal number for scanning
  const operatorNumbers = [
    operator1?.identifier,
    operator2?.identifier,
    operator3?.identifier,
  ].filter(Boolean);
  
  const operatorPersonalNumber = operatorNumbers.join(',');

  // Scan panel
  return (
    <ScanPanel
      workplace={workplace}
      articleConfigId={selectedArticle.id}
      operatorPersonalNumber={operatorPersonalNumber}
      boxStatus={boxStatus}
      palletStatus={selectedArticle.pallet ? palletStatus : undefined}
    />
  );
}