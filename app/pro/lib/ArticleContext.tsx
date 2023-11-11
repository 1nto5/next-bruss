'use client';

import { useState, createContext, useLayoutEffect, ReactNode } from 'react';

type ArticleType = {
  number: string | null;
  name: string | null;
};

type ArticleContextType = {
  article: ArticleType;
  setArticle: React.Dispatch<React.SetStateAction<ArticleType>>;
};

export const ArticleContext = createContext<ArticleContextType | undefined>(
  undefined,
);

type ArticleProviderProps = {
  children: ReactNode;
};

export const ArticleProvider: React.FC<ArticleProviderProps> = ({
  children,
}) => {
  const [article, setArticle] = useState<ArticleType>(() => {
    if (typeof window !== 'undefined') {
      const localData = localStorage.getItem('pro.article');
      return localData ? JSON.parse(localData) : { number: null, name: null };
    }
    return { number: null, name: null };
  });

  useLayoutEffect(() => {
    localStorage.setItem('pro.article', JSON.stringify(article));
  }, [article]);

  return (
    <ArticleContext.Provider value={{ article, setArticle }}>
      {children}
    </ArticleContext.Provider>
  );
};
