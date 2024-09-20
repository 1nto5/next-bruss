'use client';

import { useState, createContext, ReactNode, useEffect } from 'react';

type InventoryType = {
  card?: number | null;
  position?: number | null;
  warehouse?: string | null;
  sector?: string | null;
} | null;

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
  const [inventory, setInventory] = useState<InventoryType | null>(null);

  useEffect(() => {
    const localData = localStorage.getItem('inventory');
    const data = localData
      ? JSON.parse(localData)
      : { card: null, position: null, warehouse: null, sector: null };
    setInventory(data);
  }, []);

  useEffect(() => {
    if (inventory) {
      localStorage.setItem('inventory', JSON.stringify(inventory));
    }
  }, [inventory]);

  if (!inventory) {
    return null;
  }

  return (
    <InventoryContext.Provider value={{ inventory, setInventory }}>
      {children}
    </InventoryContext.Provider>
  );
};
