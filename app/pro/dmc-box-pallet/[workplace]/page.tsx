'use client';

import { PersonProvider } from '../../lib/PersonContext';
import { ArticleProvider } from '../../lib/ArticleContext';
import Header from '../../components/Header';
import App from './app';
import { ScanProvider } from '../../lib/ScanContext';
import { usePathname } from 'next/navigation';

export default function Page() {
  const pathname = usePathname();
  const workplace = pathname.split('/').pop();

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
