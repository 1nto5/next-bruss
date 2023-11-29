'use client';

import { useState, createContext, useLayoutEffect, ReactNode } from 'react';

type ScanType = {
  last: string | null;
};

type ScanContextType = {
  scan: ScanType;
  setScan: React.Dispatch<React.SetStateAction<ScanType>>;
};

export const ScanContext = createContext<ScanContextType | undefined>(
  undefined,
);

type ScanProviderProps = {
  children: ReactNode;
};

export const ScanProvider: React.FC<ScanProviderProps> = ({ children }) => {
  const [scan, setScan] = useState<ScanType>(() => {
    // if (typeof window !== 'undefined') {
    //   const localData = localStorage.getItem('pro.scan');
    //   return localData ? JSON.parse(localData) : { scan: null, name: null };
    // }
    return { last: null };
  });

  // useLayoutEffect(() => {
  //   localStorage.setItem('pro.scan', JSON.stringify(scan));
  // }, [article]);

  return (
    <ScanContext.Provider value={{ scan, setScan }}>
      {children}
    </ScanContext.Provider>
  );
};
