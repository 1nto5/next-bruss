import { createContext, ReactNode, useEffect, useState } from 'react';

type PersonsType = {
  first?: string | null;
  nameFirst?: string | null;
  second?: string | null;
  nameSecond?: string | null;
} | null;

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
  const [persons, setPersons] = useState<PersonsType | null>(null);

  useEffect(() => {
    const localData = localStorage.getItem('inventory.persons');
    const data = localData
      ? JSON.parse(localData)
      : { first: null, nameFirst: null, second: null, nameSecond: null };
    setPersons(data);
  }, []);

  useEffect(() => {
    if (persons) {
      localStorage.setItem('inventory.persons', JSON.stringify(persons));
    }
  }, [persons]);

  if (!persons) {
    return null;
  }

  return (
    <PersonsContext.Provider value={{ persons, setPersons }}>
      {children}
    </PersonsContext.Provider>
  );
};
