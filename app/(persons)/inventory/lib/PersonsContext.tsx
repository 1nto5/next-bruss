'use client';

import { useState, createContext, useLayoutEffect, ReactNode } from 'react';

type PersonsType = {
  first: string | null;
  nameFirst: string | null;
  second: string | null;
  nameSecond: string | null;
};

type PersonsContextType = {
  persons: PersonsType;
  setPersons: React.Dispatch<React.SetStateAction<PersonsType>>;
};

export const PersonsContext = createContext<PersonsContextType | undefined>(
  undefined,
);

type PersonsProviderProps = {
  children: ReactNode;
};

export const PersonsProvider: React.FC<PersonsProviderProps> = ({
  children,
}) => {
  const [persons, setPersons] = useState<PersonsType>(() => {
    if (typeof window !== 'undefined') {
      const localData = localStorage.getItem('inventory.persons');
      return localData
        ? JSON.parse(localData)
        : { first: null, nameFirst: null, second: null, nameSecond: null };
    }
    return { first: null, nameFirst: null, second: null, nameSecond: null };
  });

  useLayoutEffect(() => {
    localStorage.setItem('inventory.persons', JSON.stringify(persons));
  }, [persons]);

  return (
    <PersonsContext.Provider value={{ persons, setPersons }}>
      {children}
    </PersonsContext.Provider>
  );
};