'use client';

import { useState, createContext, ReactNode, useEffect } from 'react';

type ArticleType = {
  number: string | null;
  name: string | null;
} | null;

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
  const [article, setArticle] = useState<ArticleType | null>(null);

  useEffect(() => {
    const localData = localStorage.getItem('pro.article');
    const data = localData
      ? JSON.parse(localData)
      : { number: null, name: null };
    setArticle(data);
  }, []);

  useEffect(() => {
    if (article) {
      localStorage.setItem('pro.article', JSON.stringify(article));
    }
  }, [article]);

  if (!article) {
    return null;
  }

  return (
    <ArticleContext.Provider value={{ article, setArticle }}>
      {children}
    </ArticleContext.Provider>
  );
};
