'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CircleX, Loader, Search } from 'lucide-react';
import { useState, useEffect } from 'react';
import { revalidateCardPositions as revalidate } from '../actions';
import { Dictionary } from '../../lib/dict';

export default function CardPositionsTableFilteringAndOptions({
  setFilter,
  dict,
  fetchTime,
}: {
  setFilter: (columnId: string, value: string) => void;
  dict: Dictionary;
  fetchTime: string;
}) {
  const [filterPositionValue, setFilterPositionValue] = useState('');
  const [filterArticleNameValue, setFilterArticleNameValue] = useState('');
  const [filterArticleNumberValue, setFilterArticleNumberValue] = useState('');
  const [isPendingSearch, setIsPendingSearch] = useState(false);

  useEffect(() => {
    setIsPendingSearch(false);
  }, [fetchTime]);

  const handleClearFilters = () => {
    setFilterPositionValue('');
    setFilterArticleNameValue('');
    setFilterArticleNumberValue('');
    setFilter('identifier', '');
    setFilter('articleName', '');
    setFilter('articleNumber', '');
  };

  const handleSearchClick = (e: React.FormEvent) => {
    e.preventDefault();
    setIsPendingSearch(true);
    setFilter('identifier', filterPositionValue);
    setFilter('articleName', filterArticleNameValue);
    setFilter('articleNumber', filterArticleNumberValue);
    revalidate();
  };

  const hasActiveFilters = Boolean(
    filterPositionValue || filterArticleNameValue || filterArticleNumberValue,
  );

  const canSearch = hasActiveFilters;

  return (
    <Card>
      <CardContent className='p-4'>
        <form onSubmit={handleSearchClick} className='flex flex-col gap-4'>
          <div className='grid grid-cols-1 gap-4 sm:grid-cols-3'>
            <div className='flex flex-col space-y-1'>
              <Label>ID</Label>
              <Input
                value={filterPositionValue}
                onChange={(e) => setFilterPositionValue(e.target.value)}
              />
            </div>
            <div className='flex flex-col space-y-1'>
              <Label>{dict.positions.articleName}</Label>
              <Input
                value={filterArticleNameValue}
                onChange={(e) => setFilterArticleNameValue(e.target.value)}
              />
            </div>
            <div className='flex flex-col space-y-1'>
              <Label>{dict.positions.articleNumber}</Label>
              <Input
                value={filterArticleNumberValue}
                onChange={(e) => setFilterArticleNumberValue(e.target.value)}
              />
            </div>
          </div>

          <div className='flex flex-col gap-2 sm:grid sm:grid-cols-2 sm:gap-4'>
            <Button
              type='button'
              variant='destructive'
              onClick={handleClearFilters}
              disabled={isPendingSearch || !hasActiveFilters}
              className='order-2 w-full sm:order-1'
            >
              <CircleX /> {dict.filters.clearFilters}
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
              {dict.filters.search}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
