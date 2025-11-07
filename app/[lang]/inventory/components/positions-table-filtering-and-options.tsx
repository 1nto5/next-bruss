'use client';

import { Dictionary } from '../lib/dict';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CircleX, Loader, Search } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { revalidatePositions as revalidate } from '../actions';

export default function PositionsTableFilteringAndOptions({
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

  const [positionFilter, setPositionFilter] = useState(
    searchParams?.get('position') || '',
  );
  const [articleNameFilter, setArticleNameFilter] = useState(
    searchParams?.get('articleName') || '',
  );
  const [articleNumberFilter, setArticleNumberFilter] = useState(
    searchParams?.get('articleNumber') || '',
  );
  const [quantityFilter, setQuantityFilter] = useState(
    searchParams?.get('quantity') || '',
  );

  const handleClearFilters = () => {
    setPositionFilter('');
    setArticleNameFilter('');
    setArticleNumberFilter('');
    setQuantityFilter('');
    if (searchParams?.toString()) {
      setIsPendingSearch(true);
      router.push(pathname || '');
    }
  };

  const handleSearchClick = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (positionFilter) params.set('position', positionFilter);
    if (articleNameFilter) params.set('articleName', articleNameFilter);
    if (articleNumberFilter) params.set('articleNumber', articleNumberFilter);
    if (quantityFilter) params.set('quantity', quantityFilter);
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
    positionFilter ||
      articleNameFilter ||
      articleNumberFilter ||
      quantityFilter,
  );

  const hasPendingChanges =
    positionFilter !== (searchParams?.get('position') || '') ||
    articleNameFilter !== (searchParams?.get('articleName') || '') ||
    articleNumberFilter !== (searchParams?.get('articleNumber') || '') ||
    quantityFilter !== (searchParams?.get('quantity') || '');

  const canSearch = hasActiveFilters || hasPendingChanges;

  return (
    <Card>
      <CardHeader className='p-4' />
      <CardContent className='p-4 pt-0'>
        <form onSubmit={handleSearchClick} className='flex flex-col gap-4'>
          {/* Row 1: Filters */}
          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
            <div className='flex flex-col space-y-1'>
              <Label>{dict.positions.filters.positionId}</Label>
              <Input
                value={positionFilter}
                onChange={(e) => setPositionFilter(e.target.value)}
                type='number'
                className='w-full'
              />
            </div>
            <div className='flex flex-col space-y-1'>
              <Label>{dict.positions.filters.article}</Label>
              <Input
                value={articleNameFilter}
                onChange={(e) => setArticleNameFilter(e.target.value)}
                className='w-full'
              />
            </div>
            <div className='flex flex-col space-y-1'>
              <Label>{dict.positions.filters.articleNumber}</Label>
              <Input
                value={articleNumberFilter}
                onChange={(e) => setArticleNumberFilter(e.target.value)}
                className='w-full'
              />
            </div>
            <div className='flex flex-col space-y-1'>
              <Label>{dict.positions.filters.quantity}</Label>
              <Input
                value={quantityFilter}
                onChange={(e) => setQuantityFilter(e.target.value)}
                type='number'
                className='w-full'
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
