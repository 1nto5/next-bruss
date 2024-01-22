'use client';

import { useState, createContext, useEffect, ReactNode } from 'react';

type PersonType = {
  number: string | null;
  name: string | null;
} | null;

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
  const [person, setPerson] = useState<PersonType | null>(null);

  useEffect(() => {
    const localData = localStorage.getItem('pro.person');
    const data = localData
      ? JSON.parse(localData)
      : { number: null, name: null };
    setPerson(data);
  }, []);

  useEffect(() => {
    if (person) {
      localStorage.setItem('pro.person', JSON.stringify(person));
    }
  }, [person]);

  if (!person) {
    return null;
  }

  return (
    <PersonContext.Provider value={{ person, setPerson }}>
      {children}
    </PersonContext.Provider>
  );
};
