'use client';

import { useState, createContext, useLayoutEffect, ReactNode } from 'react';

type PersonType = {
  number: string | null;
  name: string | null;
};

type PersonContextType = {
  person: PersonType;
  setPerson: React.Dispatch<React.SetStateAction<PersonType>>;
};

export const PersonContext = createContext<PersonContextType | undefined>(
  undefined,
);

type PersonProviderProps = {
  children: ReactNode;
};

export const PersonProvider: React.FC<PersonProviderProps> = ({ children }) => {
  const [person, setPerson] = useState<PersonType>(() => {
    if (typeof window !== 'undefined') {
      const localData = localStorage.getItem('pro.person');
      return localData ? JSON.parse(localData) : { number: null, name: null };
    }
    return { number: null, name: null };
  });

  useLayoutEffect(() => {
    localStorage.setItem('pro.person', JSON.stringify(person));
  }, [person]);

  return (
    <PersonContext.Provider value={{ person, setPerson }}>
      {children}
    </PersonContext.Provider>
  );
};
