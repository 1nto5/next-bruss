'use server';

import { dbc } from '@/lib/db/mongo';

export type SelectOption = {
  value: string;
  label: string;
};

export async function getInventoryFilterOptions(): Promise<{
  warehouseOptions: SelectOption[];
  sectorOptions: SelectOption[];
}> {
  const collection = await dbc('inventory_configs');

  const warehouseConfig = await collection.findOne({ config: 'warehouse_options' });
  const sectorConfig = await collection.findOne({ config: 'sector_options' });

  const warehouseOptions = (warehouseConfig?.options || [])
    .filter((opt: any) => opt.active !== false)
    .sort((a: any, b: any) => (a.order || 0) - (b.order || 0))
    .map((opt: any) => ({ value: opt.value, label: opt.label }));

  const sectorOptions = (sectorConfig?.options || [])
    .filter((opt: any) => opt.active !== false)
    .sort((a: any, b: any) => (a.order || 0) - (b.order || 0))
    .map((opt: any) => ({ value: opt.value, label: opt.label }));

  return { warehouseOptions, sectorOptions };
}
