'use client';

import { usePathname } from 'next/navigation';
import Header from '../../components/Header';
import { ArticleProvider } from '../../lib/ArticleContext';
import { PersonProvider } from '../../lib/PersonContext';
import { ScanProvider } from '../../lib/ScanContext';
import App from './app';

export default function Page() {
  const pathname = usePathname();
  const workplace = pathname?.split('/').pop();

  return (
    <PersonProvider>
      <ArticleProvider>
        <ScanProvider>
          <Header title={workplace ? workplace.toUpperCase() : 'brak'} />
          <App />
        </ScanProvider>
      </ArticleProvider>
    </PersonProvider>
  );
}
