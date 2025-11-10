'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CircleX, Loader, Search } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { revalidateCardPositions as revalidate } from '../actions';

import { Dictionary } from '@/app/[lang]/inventory/lib/dict';

export default function CardPositionsTableFilteringAndOptions({
  dict,
  fetchTime,
  cardNumber,
}: {
  dict: Dictionary;
  fetchTime: Date;
  cardNumber: string;
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

  const handleClearFilters = () => {
    setPositionFilter('');
    setArticleNameFilter('');
    setArticleNumberFilter('');
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
    positionFilter || articleNameFilter || articleNumberFilter,
  );

  const hasPendingChanges =
    positionFilter !== (searchParams?.get('position') || '') ||
    articleNameFilter !== (searchParams?.get('articleName') || '') ||
    articleNumberFilter !== (searchParams?.get('articleNumber') || '');

  const canSearch = hasActiveFilters || hasPendingChanges;

  return (
    <Card>
      <CardHeader className='p-4' />
      <CardContent className='p-4 pt-0'>
        <form onSubmit={handleSearchClick} className='flex flex-col gap-4'>
          {/* Row 1: Filters */}
          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
            <div className='flex flex-col space-y-1'>
              <Label>{dict.cardPositions.filters.positionId}</Label>
              <Input
                value={positionFilter}
                onChange={(e) => setPositionFilter(e.target.value)}
                type='number'
                className='w-full'
              />
            </div>
            <div className='flex flex-col space-y-1'>
              <Label>{dict.cardPositions.filters.article}</Label>
              <Input
                value={articleNameFilter}
                onChange={(e) => setArticleNameFilter(e.target.value)}
                className='w-full'
              />
            </div>
            <div className='flex flex-col space-y-1'>
              <Label>{dict.cardPositions.filters.articleNumber}</Label>
              <Input
                value={articleNumberFilter}
                onChange={(e) => setArticleNumberFilter(e.target.value)}
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
