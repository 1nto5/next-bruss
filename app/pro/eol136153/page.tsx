'use client';

import { PersonProvider } from '../lib/PersonContext';
import { ArticleProvider } from '../lib/ArticleContext';
import Header from '../components/Header';
import App from './app';

export default function Page() {
  return (
    <PersonProvider>
      <ArticleProvider>
        <Header title='eol136153' showArticleLogOut={false} />
        <App />
      </ArticleProvider>
    </PersonProvider>
  );
}
