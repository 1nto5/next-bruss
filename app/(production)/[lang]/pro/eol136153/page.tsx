'use client';

import { PersonProvider } from '../lib/PersonContext';
import { ArticleProvider } from '../lib/ArticleContext';
import Header from '../components/Header';
import App from './app';
import { ScanProvider } from '../lib/ScanContext';

export default function Page() {
  return (
    <PersonProvider>
      <ArticleProvider>
        <ScanProvider>
          <Header title='EOL136153' showArticleLogOut={false} />
          <App />
        </ScanProvider>
      </ArticleProvider>
    </PersonProvider>
  );
}
