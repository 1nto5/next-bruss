'use client';

import { useState, createContext, ReactNode } from 'react';

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
  const [scan, setScan] = useState<ScanType>(() => ({
    last: null,
  }));

  return (
    <ScanContext.Provider value={{ scan, setScan }}>
      {children}
    </ScanContext.Provider>
  );
};
