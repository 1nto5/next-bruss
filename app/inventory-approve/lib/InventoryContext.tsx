'use client';

import { useState, createContext, ReactNode } from 'react';

type InventoryType = {
  card: number | null;
  position: number | null;
};

type InventoryContextType = {
  inventory: InventoryType;
  setInventory: React.Dispatch<React.SetStateAction<InventoryType>>;
};

// Create a context with a default undefined value for now.
export const InventoryContext = createContext<InventoryContextType | undefined>(
  undefined,
);

type InventoryProviderProps = {
  children: ReactNode;
};

export const InventoryProvider: React.FC<InventoryProviderProps> = ({
  children,
}) => {
  const [inventory, setInventory] = useState<InventoryType>({
    card: null,
    position: null,
  });

  return (
    <InventoryContext.Provider value={{ inventory, setInventory }}>
      {children}
    </InventoryContext.Provider>
  );
};
