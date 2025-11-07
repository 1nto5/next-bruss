'use client';

import {
  sectorsSelectOptions,
  warehouseSelectOptions,
} from '@/app/[lang]/inventory/lib/options';
import { Dictionary } from '@/app/[lang]/inventory/lib/dict';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MultiSelect } from '@/components/ui/multi-select';
import { CircleX, Loader, Search } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { revalidateCards as revalidate } from '../actions';

export default function CardsTableFilteringAndOptions({
  dict,
  fetchTime,
}: {
  dict: Dictionary;
  fetchTime: Date;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [isPendingSearch, setIsPendingSearch] = useState(false);

  useEffect(() => {
    setIsPendingSearch(false);
  }, [fetchTime]);

  const [cardNumberFilter, setCardNumberFilter] = useState(
    searchParams?.get('cardNumber') || '',
  );
  const [creatorsFilter, setCreatorsFilter] = useState(
    searchParams?.get('creators') || '',
  );
  const [warehouseFilter, setWarehouseFilter] = useState<string[]>(() => {
    const warehouseParam = searchParams?.get('warehouse');
    return warehouseParam ? warehouseParam.split(',') : [];
  });
  const [sectorFilter, setSectorFilter] = useState<string[]>(() => {
    const sectorParam = searchParams?.get('sector');
    return sectorParam ? sectorParam.split(',') : [];
  });

  const handleClearFilters = () => {
    setCardNumberFilter('');
    setCreatorsFilter('');
    setWarehouseFilter([]);
    setSectorFilter([]);
    if (searchParams?.toString()) {
      setIsPendingSearch(true);
      router.push(pathname || '');
    }
  };

  const handleSearchClick = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (cardNumberFilter) params.set('cardNumber', cardNumberFilter);
    if (creatorsFilter) params.set('creators', creatorsFilter);
    if (warehouseFilter.length > 0) params.set('warehouse', warehouseFilter.join(','));
    if (sectorFilter.length > 0) params.set('sector', sectorFilter.join(','));
    const newUrl = `${pathname}?${params.toString()}`;
    if (newUrl !== `${pathname}?${searchParams?.toString()}`) {
      setIsPendingSearch(true);
      router.push(newUrl);
    } else {
      setIsPendingSearch(true);
      revalidate();
    }
  };

  const hasActiveFilters = Boolean(
    cardNumberFilter || creatorsFilter || warehouseFilter.length > 0 || sectorFilter.length > 0,
  );

  const hasPendingChanges =
    cardNumberFilter !== (searchParams?.get('cardNumber') || '') ||
    creatorsFilter !== (searchParams?.get('creators') || '') ||
    warehouseFilter.join(',') !== (searchParams?.get('warehouse') || '') ||
    sectorFilter.join(',') !== (searchParams?.get('sector') || '');

  const canSearch = hasActiveFilters || hasPendingChanges;

  return (
    <Card>
      <CardHeader className='p-4' />
      <CardContent className='p-4 pt-0'>
        <form onSubmit={handleSearchClick} className='flex flex-col gap-4'>
          {/* Row 1: Card Number, Creators, Warehouse, Sector */}
          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
            <div className='flex flex-col space-y-1'>
              <Label>{dict.cards.filters.cardNumber}</Label>
              <Input
                value={cardNumberFilter}
                onChange={(e) => setCardNumberFilter(e.target.value)}
                type='number'
                className='w-full'
              />
            </div>
            <div className='flex flex-col space-y-1'>
              <Label>{dict.cards.filters.creators}</Label>
              <Input
                value={creatorsFilter}
                onChange={(e) => setCreatorsFilter(e.target.value)}
                className='w-full'
              />
            </div>
            <div className='flex flex-col space-y-1'>
              <Label>{dict.cards.filters.warehouse}</Label>
              <MultiSelect
                value={warehouseFilter}
                onValueChange={setWarehouseFilter}
                placeholder={dict.common.select}
                searchPlaceholder={dict.common.searchPlaceholder}
                emptyText={dict.common.notFound}
                clearLabel={dict.common.clear}
                selectedLabel={dict.common.selected}
                className='w-full'
                options={warehouseSelectOptions}
              />
            </div>
            <div className='flex flex-col space-y-1'>
              <Label>{dict.cards.filters.sector}</Label>
              <MultiSelect
                value={sectorFilter}
                onValueChange={setSectorFilter}
                placeholder={dict.common.select}
                searchPlaceholder={dict.common.searchPlaceholder}
                emptyText={dict.common.notFound}
                clearLabel={dict.common.clear}
                selectedLabel={dict.common.selected}
                className='w-full'
                options={sectorsSelectOptions}
              />
            </div>
          </div>

          {/* Row 2: Action buttons */}
          <div className='flex flex-col gap-2 sm:grid sm:grid-cols-2 sm:gap-4'>
            <Button
              type='button'
              variant='destructive'
              onClick={handleClearFilters}
              title={dict.common.clearFilters}
              disabled={isPendingSearch || !canSearch}
              className='order-2 w-full sm:order-1'
            >
              <CircleX /> <span>{dict.common.clear}</span>
            </Button>

            <Button
              type='submit'
              variant='secondary'
              disabled={isPendingSearch || !canSearch}
              className='order-1 w-full sm:order-2'
            >
              {isPendingSearch ? (
                <Loader className='animate-spin' />
              ) : (
                <Search />
              )}
              <span>{dict.common.search}</span>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
