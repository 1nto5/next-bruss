'use client';

import { useState, createContext, useLayoutEffect, ReactNode } from 'react';

type PersonType = {
  first: string | null;
  second: string | null;
};

type PersonsContextType = {
  persons: PersonType;
  setPersons: React.Dispatch<React.SetStateAction<PersonType>>;
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
  const [persons, setPersons] = useState<PersonType>(() => {
    if (typeof window !== 'undefined') {
      const localData = localStorage.getItem('inventoryPersons');
      return localData ? JSON.parse(localData) : { first: null, second: null };
    }
    return { first: null, second: null };
  });

  useLayoutEffect(() => {
    localStorage.setItem('inventoryPersons', JSON.stringify(persons));
  }, [persons]);

  return (
    <PersonsContext.Provider value={{ persons, setPersons }}>
      {children}
    </PersonsContext.Provider>
  );
};
